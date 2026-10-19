import { Quaternion, Vector3 } from "three/webgpu";
import {
  createBody,
  createShardWorld,
  type Obstacle,
  type PhysicsOptions,
  type Pusher,
  type Shard,
} from "./shard-world.ts";

/**
 * Bakes the shards falling onto the ground and keeps 60 frames per second for scrubbing.
 * Time 0 is the strike. Each shard waits for its delay, then flies with its velocity and spin.
 * A `track` from an earlier bake of the same shards skips the simulation.
 */
export function bakeShards(
  shards: Shard[],
  obstacles: Obstacle[],
  options: PhysicsOptions,
  baked?: Float32Array,
) {
  const rate = 240,
    keep = 4,
    count = shards.length;
  const frames = Math.floor(Math.ceil(options.duration * rate) / keep) + 1;
  const track =
    baked ?? simulate(shards, obstacles, options, rate, keep, frames);
  const p = new Vector3(),
    blend = [0, 0, 0, 1];

  return {
    track,
    /** Pose of shard `index` at `t` seconds after the strike. */
    sample(
      t: number,
      index: number,
      position: Vector3,
      quaternion: Quaternion,
    ) {
      const f = Math.max(0, Math.min(frames - 1, (t * rate) / keep));
      const i0 = Math.floor(f),
        i1 = Math.min(frames - 1, i0 + 1),
        mix = f - i0;
      const o0 = (i0 * count + index) * 7,
        o1 = (i1 * count + index) * 7;
      position
        .set(track[o0], track[o0 + 1], track[o0 + 2])
        .lerp(p.set(track[o1], track[o1 + 1], track[o1 + 2]), mix);
      Quaternion.slerpFlat(
        blend,
        0,
        track as unknown as number[],
        o0 + 3,
        track as unknown as number[],
        o1 + 3,
        mix,
      );
      quaternion.fromArray(blend);
    },
    /**
     * A live world that continues from the baked frame at `from` seconds after the strike, by default the
     * last. Shards keep the speed and spin they had there, unlaunched ones still launch on their delays,
     * and the letters keep gliding on the same clock until they rest. Shards that had settled start asleep
     * and wake when the pusher or a kick reaches them.
     */
    live(from = options.duration) {
      const step = keep / rate;
      const frame = Math.max(0, Math.min(frames - 1, Math.round(from / step)));
      const settled = frame === frames - 1;
      const before = Math.max(0, frame - 1),
        after = Math.min(frames - 1, frame + 1),
        span = (after - before) * step;
      const turn = new Quaternion(),
        start = new Quaternion();
      let clock = frame * step;
      const resting = shards.map((shard, i) => {
        const body = createBody(shard);
        const at = (f: number) => (f * count + i) * 7;
        body.x.fromArray(track, at(frame));
        body.q.fromArray(track, at(frame) + 3);
        body.released = clock >= body.delay;
        body.asleep = settled;
        if (body.released && !settled && span > 0) {
          body.v
            .fromArray(track, at(after))
            .sub(p.fromArray(track, at(before)))
            .divideScalar(span);
          // The spin is the world-space turn between the neighboring frames.
          turn
            .fromArray(track, at(after) + 3)
            .multiply(start.fromArray(track, at(before) + 3).invert());
          if (turn.w < 0) turn.set(-turn.x, -turn.y, -turn.z, -turn.w);
          const sine = Math.sqrt(Math.max(0, 1 - turn.w * turn.w));
          if (sine > 1e-6)
            body.w
              .set(turn.x, turn.y, turn.z)
              .multiplyScalar(
                (2 * Math.acos(Math.min(1, turn.w))) / sine / span,
              );
        }
        return body;
      });
      const world = createShardWorld(
        resting,
        shards,
        obstacles.map((obstacle) => ({
          ...obstacle,
          offset: (t: number) => obstacle.offset(Math.min(t, options.duration)),
        })),
        options,
      );
      return {
        ...world,
        /** Steps at the bake rate while the pusher sweeps along its velocity to end at `pusher.center`. */
        advance(delta: number, pusher?: Pusher) {
          if (delta <= 0) return;
          const count = Math.min(12, Math.ceil(delta * rate));
          const end = pusher?.center.clone();
          for (let i = 1; i <= count; i++) {
            if (pusher && end)
              pusher.center
                .copy(end)
                .addScaledVector(pusher.velocity, -delta * (1 - i / count));
            clock += delta / count;
            world.step(clock, delta / count, pusher);
          }
        },
        pose(index: number, position: Vector3, quaternion: Quaternion) {
          position.copy(resting[index].x);
          quaternion.copy(resting[index].q);
        },
      };
    },
  };
}
/** Steps the world at `rate` and records every `keep`th step as position and quaternion per shard. */
function simulate(
  shards: Shard[],
  obstacles: Obstacle[],
  options: PhysicsOptions,
  rate: number,
  keep: number,
  frames: number,
) {
  const bodies = shards.map(createBody);
  const world = createShardWorld(bodies, shards, obstacles, options);
  const track = new Float32Array(frames * bodies.length * 7);
  const record = (frame: number) =>
    bodies.forEach((body, i) => {
      body.x.toArray(track, (frame * bodies.length + i) * 7);
      body.q.toArray(track, (frame * bodies.length + i) * 7 + 3);
    });
  record(0);
  for (let step = 1; step <= (frames - 1) * keep; step++) {
    world.step(step / rate, 1 / rate);
    if (step % keep === 0) record(step / keep);
  }
  return track;
}
export type ShardLive = ReturnType<ReturnType<typeof bakeShards>["live"]>;
