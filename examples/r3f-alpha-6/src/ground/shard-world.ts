import { Quaternion, Vector3, type BufferGeometry } from "three/webgpu";

export type Shard = {
  geometry: BufferGeometry;
  position: Vector3;
  velocity: Vector3;
  spin: Vector3;
  delay: number;
};
/** A letter or wall that slides along x. Shards collide with its box. */
export type Obstacle = {
  min: Vector3;
  max: Vector3;
  offset: (t: number) => number;
};
export type PhysicsOptions = {
  duration: number;
  gravity: number;
  bounce: number;
  friction: number;
  collide: boolean;
};
/** A kinematic sphere such as the cursor. Shards that touch it are pushed along with its velocity. */
export type Pusher = { center: Vector3; velocity: Vector3; radius: number };

export type Body = {
  x: Vector3;
  q: Quaternion;
  v: Vector3;
  w: Vector3;
  invMass: number;
  invInertia: Vector3;
  points: Vector3[];
  radius: number;
  reach: number;
  delay: number;
  released: boolean;
  asleep: boolean;
  still: number;
};

/** Convex hull of the shard outline on the ground (xz), extruded to both faces. These points touch the ground, letters and pushers. */
function hullPoints(geometry: BufferGeometry) {
  const position = geometry.getAttribute("position");
  const flat: [number, number][] = [];
  for (let i = 0; i < position.count; i++)
    flat.push([position.getX(i), position.getZ(i)]);
  flat.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: number[], a: number[], b: number[]) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower: [number, number][] = [],
    upper: [number, number][] = [];
  for (const p of flat) {
    while (
      lower.length >= 2 &&
      cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0
    )
      lower.pop();
    lower.push(p);
  }
  for (let i = flat.length - 1; i >= 0; i--) {
    while (
      upper.length >= 2 &&
      cross(upper[upper.length - 2], upper[upper.length - 1], flat[i]) <= 0
    )
      upper.pop();
    upper.push(flat[i]);
  }
  const hull = lower.slice(0, -1).concat(upper.slice(0, -1));
  let area = 0;
  hull.forEach((p, i) => {
    const n = hull[(i + 1) % hull.length];
    area += p[0] * n[1] - n[0] * p[1];
  });
  geometry.computeBoundingBox();
  const box = geometry.boundingBox!;
  return {
    area: Math.abs(area) / 2,
    size: box.getSize(new Vector3()),
    points: hull.flatMap(([x, z]) => [
      new Vector3(x, box.min.y, z),
      new Vector3(x, box.max.y, z),
    ]),
  };
}

/** A resting rigid body for a shard at its unbroken position. */
export function createBody(shard: Shard): Body {
  const { area, size, points } = hullPoints(shard.geometry);
  const mass = Math.max(area * size.y, 1e-5);
  return {
    x: shard.position.clone(),
    q: new Quaternion(),
    v: new Vector3(),
    w: new Vector3(),
    invMass: 1 / mass,
    invInertia: new Vector3(
      12 / (mass * (size.y ** 2 + size.z ** 2)),
      12 / (mass * (size.x ** 2 + size.z ** 2)),
      12 / (mass * (size.x ** 2 + size.y ** 2)),
    ),
    points,
    radius: Math.max(size.y / 2, Math.min(size.x, size.z) * 0.45),
    reach: size.length() / 2,
    delay: shard.delay,
    released: false,
    asleep: false,
    still: 0,
  };
}

/**
 * Rigid shards over the ground at y = 0. Hull points resolve ground, letter and pusher contacts with
 * restitution and Coulomb friction so pieces settle flat. Spheres keep shards apart. Settled shards sleep
 * until something hits them.
 */
export function createShardWorld(
  bodies: Body[],
  shards: Shard[],
  obstacles: Obstacle[],
  options: PhysicsOptions,
) {
  const p = new Vector3(),
    r = new Vector3(),
    n = new Vector3(),
    u = new Vector3(),
    a = new Vector3(),
    b = new Vector3(),
    surface = new Vector3();
  const inverse = new Quaternion(),
    spinQ = new Quaternion();

  /** World inverse inertia applied to `out`, in place. */
  const inertia = (body: Body, out: Vector3) =>
    out
      .applyQuaternion(inverse.copy(body.q).invert())
      .multiply(body.invInertia)
      .applyQuaternion(body.q);
  const push = (body: Body, impulse: Vector3, offset: Vector3) => {
    body.v.addScaledVector(impulse, body.invMass);
    body.w.add(inertia(body, a.copy(offset).cross(impulse)));
  };
  /** Velocity of the body at `offset` from its center, relative to a moving surface. */
  const pointVelocity = (body: Body, offset: Vector3, out: Vector3) =>
    out.copy(body.w).cross(offset).add(body.v).sub(surface);
  /** Resolves one contact point with restitution and Coulomb friction. */
  const contact = (
    body: Body,
    offset: Vector3,
    normal: Vector3,
    bounce: number,
  ) => {
    const vn = pointVelocity(body, offset, u).dot(normal);
    if (vn >= 0) return;
    const k =
      body.invMass +
      normal.dot(inertia(body, b.copy(offset).cross(normal)).cross(offset));
    const jn = (-(vn < -0.6 ? 1 + bounce : 1) * vn) / k;
    push(body, b.copy(normal).multiplyScalar(jn), offset);
    pointVelocity(body, offset, u);
    u.addScaledVector(normal, -u.dot(normal));
    const slip = u.length();
    if (slip < 1e-6) return;
    u.divideScalar(slip);
    const kt =
      body.invMass +
      u.dot(inertia(body, b.copy(offset).cross(u)).cross(offset));
    push(
      body,
      u.multiplyScalar(-Math.min(slip / kt, options.friction * jn)),
      offset,
    );
    body.asleep = false;
  };
  const wake = (body: Body) => {
    body.asleep = false;
    body.still = 0;
  };

  return {
    /** Advances by `dt` to time `t` after the strike. */
    step(t: number, dt: number, pusher?: Pusher) {
      bodies.forEach((body, i) => {
        if (!body.released && t >= body.delay) {
          body.released = true;
          body.v.copy(shards[i].velocity);
          body.w.copy(shards[i].spin);
        }
        if (!body.released || body.asleep) return;
        body.v.y -= options.gravity * dt;
        body.w.multiplyScalar(1 / (1 + dt * 0.4));
        body.x.addScaledVector(body.v, dt);
        spinQ
          .set((body.w.x * dt) / 2, (body.w.y * dt) / 2, (body.w.z * dt) / 2, 0)
          .multiply(body.q);
        body.q
          .set(
            body.q.x + spinQ.x,
            body.q.y + spinQ.y,
            body.q.z + spinQ.z,
            body.q.w + spinQ.w,
          )
          .normalize();
      });

      for (const body of bodies) {
        if (!body.released) continue;
        if (
          pusher &&
          body.x.distanceTo(pusher.center) < body.reach + pusher.radius
        ) {
          surface.copy(pusher.velocity);
          for (const point of body.points) {
            r.copy(point).applyQuaternion(body.q);
            n.copy(body.x).add(r).sub(pusher.center);
            const distance = n.length(),
              depth = pusher.radius - distance;
            if (depth <= 0) continue;
            if (distance < 1e-6) n.set(0, 1, 0);
            else n.divideScalar(distance);
            body.x.addScaledVector(n, depth);
            wake(body);
            contact(body, r, n, 0.3);
          }
        }
        let grounded = false;
        if (!body.asleep) {
          surface.set(0, 0, 0);
          n.set(0, 1, 0);
          for (let pass = 0; pass < 2; pass++) {
            let lowest = 0;
            for (const point of body.points) {
              r.copy(point).applyQuaternion(body.q);
              const y = body.x.y + r.y;
              if (y > 0.002) continue;
              grounded = true;
              lowest = Math.min(lowest, y);
              contact(body, r, n, options.bounce);
            }
            body.x.y -= lowest;
          }
        }
        for (const obstacle of obstacles) {
          const shift = obstacle.offset(t);
          if (
            body.x.x + body.reach < obstacle.min.x + shift ||
            body.x.x - body.reach > obstacle.max.x + shift ||
            body.x.y - body.reach > obstacle.max.y ||
            body.x.z + body.reach < obstacle.min.z ||
            body.x.z - body.reach > obstacle.max.z
          )
            continue;
          surface.set(
            (obstacle.offset(t + dt) - obstacle.offset(t - dt)) / (2 * dt),
            0,
            0,
          );
          for (const point of body.points) {
            r.copy(point).applyQuaternion(body.q);
            p.copy(body.x).add(r);
            const left = p.x - obstacle.min.x - shift,
              right = obstacle.max.x + shift - p.x,
              top = obstacle.max.y - p.y;
            const back = p.z - obstacle.min.z,
              front = obstacle.max.z - p.z;
            const depth = Math.min(left, right, top, back, front);
            if (depth <= 0 || p.y < 0) continue;
            if (depth === left) n.set(-1, 0, 0);
            else if (depth === right) n.set(1, 0, 0);
            else if (depth === top) n.set(0, 1, 0);
            else if (depth === back) n.set(0, 0, -1);
            else n.set(0, 0, 1);
            body.x.addScaledVector(n, depth);
            body.asleep = false;
            contact(body, r, n, 0.35);
          }
        }
        surface.set(0, 0, 0);
        const settled = body.v.lengthSq() < 0.0025 && body.w.lengthSq() < 0.04;
        body.still = grounded && settled ? body.still + dt : 0;
        if (body.still > 0.2) {
          body.asleep = true;
          body.v.set(0, 0, 0);
          body.w.set(0, 0, 0);
        }
      }

      if (options.collide)
        for (let i = 0; i < bodies.length; i++) {
          const one = bodies[i];
          if (!one.released) continue;
          for (let j = i + 1; j < bodies.length; j++) {
            const two = bodies[j];
            if (!two.released || (one.asleep && two.asleep)) continue;
            n.subVectors(two.x, one.x);
            const distance = n.length(),
              overlap = one.radius + two.radius - distance;
            if (overlap <= 0 || distance < 1e-6) continue;
            n.divideScalar(distance);
            // Resting shards stay put so they never get pushed through the ground.
            const share = one.asleep
              ? 0
              : two.asleep
                ? 1
                : one.invMass / (one.invMass + two.invMass);
            one.x.addScaledVector(n, -overlap * share);
            two.x.addScaledVector(n, overlap * (1 - share));
            const vn = u.subVectors(two.v, one.v).dot(n);
            if (vn >= 0) continue;
            const impulse = (-1.2 * vn) / (one.invMass + two.invMass);
            one.v.addScaledVector(n, -impulse * one.invMass);
            two.v.addScaledVector(n, impulse * two.invMass);
            if (Math.abs(vn) > 0.2) one.asleep = two.asleep = false;
          }
        }
    },
    /** Pops shards near `center` up and away, strongest at the center and fading to zero at `radius`. */
    kick(center: Vector3, radius: number, strength: number) {
      for (const body of bodies) {
        n.subVectors(body.x, center).setY(0);
        const falloff = 1 - n.length() / radius;
        if (!body.released || falloff <= 0) continue;
        wake(body);
        n.normalize().multiplyScalar(1.6).setY(3.2);
        body.v.addScaledVector(n, strength * falloff);
        body.w.add(
          a
            .set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
            .multiplyScalar(24 * strength * falloff),
        );
      }
    },
    /** True while any released shard is still moving. */
    awake: () => bodies.some((body) => body.released && !body.asleep),
  };
}
