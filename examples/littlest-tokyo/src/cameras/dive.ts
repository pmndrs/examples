import type { Vec3 } from "../model";

import { overviewPosition } from "./overview";

// From where the hero's camera stands, in over the front roofs, straight down into the alley's bend and out of it
// next to the cat. Starting at the hero's camera, the first scroll already moves along the path.
export const divePath: Vec3[] = [
  overviewPosition,
  [1.8, 3.6, 1],
  [1, 3.5, 0.5],
  [0.63, 1.2, 0.4],
  [0.65, -0.35, 0.4],
  [0.75, -0.5, 2],
  [1.2, -0.5, 2.2],
];
export const diveEnd = divePath.length - 1;
/** How quickly the camera and everything that goes with its drop catch up with the scroll. */
export const diveDamping = 0.75;

// Knot where the camera has come in from the hero's spot.
const arrived = 2;

// Knots where the drop starts and lands.
const dropFrom = 1.3;
const dropTo = 4;

// Knot from which the camera has reached the cat.
const catFrom = 5;

// Knots between which the path runs straight down: past the top's turn, before the bend at the bottom.
const fallFrom = 2;
const fallTo = 4;
const fallEdge = 0.3;

const smoothstep = (from: number, to: number, value: number) => {
  const t = Math.min(Math.max((value - from) / (to - from), 0), 1);
  return t * t * (3 - 2 * t);
};

/** How far in from the hero's spot the dive is at `progress`: `0` there, `1` from where the dive proper starts. */
export const arrivalAt = (progress: number): number =>
  smoothstep(0, arrived, progress * diveEnd);

/** How far into the drop the dive is at `progress`: `0` outside it, rising to `1` halfway down. */
export function dropAt(progress: number): number {
  const drop = Math.min(
    Math.max((progress * diveEnd - dropFrom) / (dropTo - dropFrom), 0),
    1,
  );
  return Math.sin(drop * Math.PI);
}

/** `1` while the dive falls straight down at `progress`, `0` before it and from the bend at the bottom on. */
export function fallAt(progress: number): number {
  const knot = progress * diveEnd;
  return (
    smoothstep(fallFrom, fallFrom + fallEdge, knot) *
    (1 - smoothstep(fallTo - fallEdge, fallTo, knot))
  );
}

/** Whether the dive has reached the cat at `progress`. */
export const atCat = (progress: number): boolean =>
  progress * diveEnd >= catFrom;
