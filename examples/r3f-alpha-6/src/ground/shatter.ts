import { Shape, Vector3, type ShapeJSON } from "three/webgpu";
import { fractureGlyph, random, sitOnGround } from "../fracture";
import { glide, impactTime, tagPose } from "./choreography";
import { bakeShards } from "./shard-physics";
import type { Obstacle } from "./shard-world";
import type { GroundSettings } from "./settings";

type Box = { min: number[]; max: number[] };

/** Everything needed to break `renderer` and bake its fall, in the title's em units. */
export type ShatterJob = {
  shapes: ShapeJSON[];
  offset: number[];
  word: Box;
  seed: number;
  cells: number;
  depth: number;
  duration: number;
  opening: (Box & { travel: number })[];
  tag: Box & { strike: number; travel: number };
  /** A column of ground the shards must stay out of, so the copy printed there stays readable. */
  clear?: Box;
  physics: Pick<
    GroundSettings,
    | "windup"
    | "explosion"
    | "gravity"
    | "bounce"
    | "friction"
    | "shardCollisions"
  >;
};

export type ShatterResult = {
  shards: {
    attributes: [string, Float32Array, number][];
    position: number[];
    velocity: number[];
    spin: number[];
    delay: number;
  }[];
  track: Float32Array;
};

/** The remaining letters and the keep-clear column as obstacles. `<Canvas` glides toward `/>` while `/>` springs back from the strike. */
export function titleObstacles({
  opening,
  tag,
  clear,
  physics,
}: ShatterJob): Obstacle[] {
  const pose = tagPose(physics.windup, tag.strike, tag.travel);
  const box = ({ min, max }: Box) => ({
    min: new Vector3().fromArray(min),
    max: new Vector3().fromArray(max),
  });
  return [
    ...opening.map(({ travel, ...bounds }, i) => ({
      ...box(bounds),
      offset: (time: number) =>
        travel * glide(time + impactTime, i, opening.length),
    })),
    { ...box(tag), offset: (time: number) => pose(time + impactTime).x },
    ...(clear ? [{ ...box(clear), offset: () => 0 }] : []),
  ];
}

export function physicsOptions({ duration, physics }: ShatterJob) {
  return {
    duration,
    gravity: physics.gravity,
    bounce: physics.bounce,
    friction: physics.friction,
    collide: physics.shardCollisions,
  };
}

/**
 * Fractures `renderer` around the strike and bakes the fall. It runs in a worker so the scene can start
 * while it works. Pieces nearest the strike leave first and fly hardest, and most spray back behind the
 * title so the copy in front stays readable.
 */
export function shatterTitle(job: ShatterJob): ShatterResult {
  const { physics } = job;
  const offset = new Vector3().fromArray(job.offset);
  const [left, right] = [job.word.min[0], job.word.max[0]];
  const rng = random(job.seed * 31 + 7);
  const shards = fractureGlyph(
    job.shapes.map((json) => new Shape().fromJSON(json)),
    job.seed,
    { cells: job.cells, depth: job.depth, impact: [1, 0.45] },
  ).map((piece) => {
    const geometry = sitOnGround(
      piece.geometry.translate(
        piece.center.x + offset.x,
        piece.center.y + offset.y,
        piece.center.z,
      ),
    );
    const position = geometry.boundingBox!.getCenter(new Vector3());
    geometry.translate(-position.x, -position.y, -position.z);
    // 1 at the strike, 0 at the far end of the word.
    const near = Math.max(
      0,
      Math.min(1, 1 - (right - position.x) / (right - left)),
    );
    return {
      geometry,
      position,
      spin: piece.spin.clone().multiplyScalar(physics.explosion),
      velocity: new Vector3(
        -(0.4 + 2.4 * near * rng()),
        2.2 + (1 + 2.4 * near) * rng(),
        rng() < 0.75 ? -(0.6 + 2 * rng()) : 0.3 + 0.9 * rng(),
      ).multiplyScalar(physics.explosion),
      delay: (1 - near) * 0.08 + rng() * 0.02,
    };
  });
  const { track } = bakeShards(
    shards,
    titleObstacles(job),
    physicsOptions(job),
  );
  return {
    track,
    shards: shards.map(({ geometry, position, velocity, spin, delay }) => ({
      attributes: Object.entries(geometry.attributes).map(
        ([name, attribute]) => [
          name,
          attribute.array as Float32Array,
          attribute.itemSize,
        ],
      ),
      position: position.toArray(),
      velocity: velocity.toArray(),
      spin: spin.toArray(),
      delay,
    })),
  };
}
