import { MathUtils } from "three";

import type { Vec3 } from "../model";
import { center } from "../model";

/** An orbit round the town, in degrees: it sways `sway` either side of `horizontal`. */
export type Orbit = {
  radius: number;
  horizontal: number;
  vertical: number;
  sway: number;
  fov: number;
};

/** The hero's orbit. */
export const overviewOrbit: Orbit = {
  radius: 9.5,
  horizontal: -32,
  vertical: 12,
  sway: 12,
  fov: 40,
};

/** The closing shot's: the hero's view from further out and higher up, wide enough for the whole town. */
export const outroOrbit: Orbit = {
  radius: 13,
  horizontal: -32,
  vertical: 30,
  sway: 12,
  fov: 35,
};

const h = MathUtils.degToRad(overviewOrbit.horizontal);
const v = MathUtils.degToRad(overviewOrbit.vertical);

/** Where the hero's camera stands in the middle of its sway. */
export const overviewPosition: Vec3 = [
  center[0] - overviewOrbit.radius * Math.cos(v) * Math.sin(h),
  center[1] + overviewOrbit.radius * Math.sin(v),
  center[2] + overviewOrbit.radius * Math.cos(v) * Math.cos(h),
];
