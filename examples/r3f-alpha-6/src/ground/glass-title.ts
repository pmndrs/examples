import {
  Box3,
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  MeshBasicNodeMaterial,
  Mesh,
  Vector3,
  type Material,
  type Object3D,
} from "three/webgpu";
import { extrude, glyphShapes, sitOnGround } from "../fracture";
import { ease } from "../timeline";
import { traceStartup } from "../startup";
import { glide, impactTime, tagPose } from "./choreography";
import { bakeShards, type ShardLive } from "./shard-physics";
import {
  physicsOptions,
  titleObstacles,
  type ShatterJob,
  type ShatterResult,
} from "./shatter";
import type { Pusher } from "./shard-world";
import { withShadow } from "./shadow-light";
import { causticCast } from "./caustics";
import type { Typography } from "../typography";
import type { GroundSettings } from "./settings";

/**
 * `<Canvas renderer />` in glass, lying on the ground at y = 0 in em units so the letter faces point up.
 * `/>` winds up and strikes `renderer`, whose shards fall under a baked simulation while `<Canvas` glides over to meet `/>`.
 * `duration` is how long the choreography runs after the strike. `fit` gives the world scale for a word
 * width, so the title grows from fitting `<Canvas renderer />` to fitting `<Canvas />` on narrow screens. Once it ends the shards switch to a live
 * simulation where a cursor sphere sweeps them and a click pops them up.
 * `keepClear` is a box on the ground, in world units from the title's position, that shards bounce off. The fracture and bake run in a worker.
 * `compile` prepares the GPU for the shards when they arrive, and the opening holds until it finishes so the strike never stalls.
 */
export function createGlassTitle(
  typography: Typography,
  material: Material,
  settings: GroundSettings,
  duration: number,
  fit: (width: number) => number,
  keepClear: Box3 | undefined,
  compile: (shards: Group) => Promise<unknown>,
) {
  const { depth, bevel, fractureSeed, fragmentCount } = settings;
  const root = new Group(),
    intact = new Group(),
    shardGroup = new Group(),
    tag = new Group();
  root.add(intact, shardGroup, tag);
  const source = typography.handle.createText({
    font: typography.display,
    text: "<Canvas renderer />",
    style: { fontSize: 1 },
  });
  const layout = source.glyphs();
  const finalSource = typography.handle.createText({
    font: typography.display,
    text: "<Canvas />",
    style: { fontSize: 1 },
  });
  const finalLayout = finalSource.glyphs();
  const ink = layout.inkBounds!;
  // Glyph outlines sit in xy. After sitting on the ground the faces point up and the word is centered in xz.
  const offset = new Vector3(-layout.width / 2, ink.y + ink.height, 0);
  const geometries: BufferGeometry[] = [];
  const shadowMaterial = new MeshBasicNodeMaterial();
  shadowMaterial.castShadowNode = causticCast(
    (material as unknown as { color: Color }).color,
  );
  const opening: { mesh: Object3D; travel: number; box: Box3 }[] = [];
  const tagBox = new Box3(),
    intactBox = new Box3();
  const fractureShapes: ReturnType<typeof glyphShapes> = [];
  let tagTravel = 0,
    baseY: number | undefined;
  // The settled `<Canvas />` closes up most of the word space so `/>` doesn't read as a hole.
  const spaceAt = finalLayout.clusters.indexOf(7),
    tagAt = finalLayout.clusters.indexOf(8);
  const tighten =
    spaceAt < 0 || tagAt < 0
      ? 0
      : (finalLayout.x[tagAt] - finalLayout.x[spaceAt]) * 0.6;
  for (let i = 0; i < layout.glyphCount; i++) {
    const cluster = layout.clusters[i];
    const shapes = glyphShapes(layout, i);
    if (!shapes.length) continue;
    const geometry = sitOnGround(
      extrude(shapes, bevel, depth).translate(0, offset.y, 0),
    );
    geometries.push(geometry);
    const mesh = withShadow(new Mesh(geometry, material), shadowMaterial);
    mesh.position.set(offset.x, 0, 0);
    const box = geometry.boundingBox!.clone().translate(mesh.position);
    if (cluster >= 8 && cluster < 16) {
      intact.add(mesh);
      intactBox.union(box);
      fractureShapes.push(...shapes);
      continue;
    }
    const finalIndex = Array.from(finalLayout.clusters).indexOf(
      cluster > 15 ? cluster - 9 : cluster,
    );
    const travel =
      finalLayout.x[finalIndex] -
      finalLayout.width / 2 -
      (layout.x[i] - layout.width / 2) +
      (cluster > 15 ? -tighten / 2 : tighten / 2);
    if (cluster > 15) {
      tag.add(mesh);
      tagBox.union(box);
      tagTravel = travel;
    } else {
      root.add(mesh);
      opening.push({ mesh, travel, box });
    }
  }
  const [startScale, endScale] = [
    fit(layout.width),
    fit(finalLayout.width - tighten),
  ];
  source.dispose();
  finalSource.dispose();

  // `/>` pivots at the middle of its base so it can lean and squash like a spring toy.
  const pivot = (tagBox.min.x + tagBox.max.x) / 2;
  tag.position.x = pivot;
  tag.children.forEach((mesh) => {
    mesh.position.x -= pivot;
  });
  const strike = intactBox.max.x - tagBox.min.x;

  const job: Omit<ShatterJob, "physics"> = {
    shapes: fractureShapes.map((shape) => shape.toJSON()),
    offset: offset.toArray(),
    word: { min: intactBox.min.toArray(), max: intactBox.max.toArray() },
    seed: fractureSeed,
    cells: fragmentCount,
    depth,
    duration,
    opening: opening.map(({ box, travel }) => ({
      min: box.min.toArray(),
      max: box.max.toArray(),
      travel,
    })),
    tag: {
      min: tagBox.min.toArray(),
      max: tagBox.max.toArray(),
      strike,
      travel: tagTravel,
    },
    // Into em units at the settled scale, as a wall tall enough that shards cannot fly over it.
    clear: keepClear && {
      min: [keepClear.min.x / endScale, 0, keepClear.min.z / endScale],
      max: [keepClear.max.x / endScale, 1e3, keepClear.max.z / endScale],
    },
  };
  let pose: ReturnType<typeof tagPose> | undefined,
    poseKey = "";
  let live: ShardLive | undefined, last: Vector3 | undefined;
  const pusher: Pusher = {
    center: new Vector3(),
    velocity: new Vector3(),
    radius: 1,
  };
  let worker: Worker | undefined,
    baked: ReturnType<typeof bakeShards> | undefined,
    physicsKey = "",
    warm = false,
    compiled = false;
  let shards: { mesh: Object3D; geometry: BufferGeometry }[] = [];
  /** Breaks `renderer` off the main thread and swaps in the new shards when they arrive. */
  const shatter = (physics: ShatterJob["physics"]) => {
    worker?.terminate();
    const request = { ...job, physics };
    worker = new Worker(new URL("./shatter-worker.ts", import.meta.url), {
      type: "module",
    });
    worker.onmessage = ({ data }: MessageEvent<ShatterResult>) => {
      worker?.terminate();
      worker = undefined;
      shards.forEach(({ mesh, geometry }) => {
        shardGroup.remove(mesh);
        geometry.dispose();
      });
      shards = data.shards.map((shard) => {
        const geometry = new BufferGeometry();
        shard.attributes.forEach(([name, array, size]) =>
          geometry.setAttribute(name, new BufferAttribute(array, size)),
        );
        const mesh = withShadow(new Mesh(geometry, material), shadowMaterial);
        shardGroup.add(mesh);
        return { mesh, geometry };
      });
      baked = bakeShards(
        data.shards.map((shard, i) => ({
          geometry: shards[i].geometry,
          delay: shard.delay,
          position: new Vector3().fromArray(shard.position),
          velocity: new Vector3().fromArray(shard.velocity),
          spin: new Vector3().fromArray(shard.spin),
        })),
        titleObstacles(request),
        physicsOptions(request),
        data.track,
      );
      live = undefined;
      warm = true;
      traceStartup("Shards ready");
      // Compiling skips hidden objects. The next update hides the shards again.
      shardGroup.visible = true;
      compile(shardGroup).then(() => {
        compiled = true;
      });
    };
    worker.postMessage(request);
  };
  return {
    root,
    /**
     * Poses everything for choreography time `t`, re-simulating only when a motion setting changes.
     * `cursor` and `press` are world points on the ground. Returns true while live shards are moving.
     */
    update(
      t: number,
      settings: GroundSettings,
      delta = 0,
      cursor?: Vector3,
      press?: Vector3,
    ) {
      if (poseKey !== String(settings.windup)) {
        poseKey = String(settings.windup);
        pose = tagPose(settings.windup, strike, tagTravel);
        physicsKey = "";
      }
      const key = [
        settings.explosion,
        settings.gravity,
        settings.bounce,
        settings.friction,
        settings.shardCollisions,
      ].join();
      if (physicsKey !== key) {
        physicsKey = key;
        shatter({
          windup: settings.windup,
          explosion: settings.explosion,
          gravity: settings.gravity,
          bounce: settings.bounce,
          friction: settings.friction,
          shardCollisions: settings.shardCollisions,
        });
      }
      if (!baked || t - impactTime < duration - 1e-3) live = last = undefined;
      else live ??= baked.live();
      if (live && cursor) {
        const point = root.worldToLocal(cursor.clone());
        if (last)
          pusher.velocity
            .subVectors(point, last)
            .divideScalar(Math.max(delta, 1 / 60))
            .clampLength(0, 14);
        else pusher.velocity.set(0, 0, 0);
        pusher.center.copy(point);
        pusher.radius = settings.cursorSize;
        last = point;
      } else last = undefined;
      if (live && press)
        live.kick(root.worldToLocal(press.clone()), settings.cursorSize * 4, 1);
      live?.advance(Math.min(delta, 0.05), cursor && pusher);
      root.scale.setScalar(
        startScale +
          (endScale - startScale) * ease(t, impactTime + 0.1, impactTime + 1.2),
      );
      // Floating a little above the floor lets the shadow and the refraction read as glass.
      baseY ??= root.position.y;
      root.position.y = baseY + settings.lift * root.scale.x;
      opening.forEach(({ mesh, travel }, i) => {
        mesh.position.x = offset.x + travel * glide(t, i, opening.length);
      });
      const now = pose!(t);
      tag.position.x = pivot + now.x;
      tag.rotation.y = now.lean;
      tag.scale.set(1 + now.squash, 1, 1 - now.squash * 0.6);
      intact.visible = t < impactTime;
      // New shards draw once at a speck's size before the strike so their first real frame doesn't stall.
      shardGroup.visible = !intact.visible || warm;
      warm = false;
      if (shardGroup.visible)
        shards.forEach(({ mesh }, i) => {
          mesh.scale.setScalar(intact.visible ? 1e-4 : 1);
          if (live) live.pose(i, mesh.position, mesh.quaternion);
          else baked?.sample(t - impactTime, i, mesh.position, mesh.quaternion);
        });
      return live?.awake() ?? false;
    },
    /** True once the first shards have arrived and compiled. */
    get shattered() {
      return compiled;
    },
    dispose() {
      worker?.terminate();
      [...geometries, ...shards.map(({ geometry }) => geometry)].forEach(
        (geometry) => geometry.dispose(),
      );
      shadowMaterial.dispose();
    },
  };
}
