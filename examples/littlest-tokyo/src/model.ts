import { useGLTF } from "@react-three/drei";
import type { Object3D } from "three";

import townUrl from "./models/littlest-tokyo.glb?url";

export { townUrl };

export type Vec3 = [number, number, number];

/** The middle of the town, a little above the street. */
export const center: Vec3 = [0, 0.5, 0];

/** The tram's body, which the others of `tramParts` move with. */
export const tramNode = "Object675";
export const tramParts = [tramNode, "Object680", "Object681"];

/** The parts of the town the shots follow: the tram, the mascot, and one of the birds on the roof. */
export function useTownNodes(): {
  tram: Object3D;
  mascot: Object3D;
  bird: Object3D;
} {
  const { nodes } = useGLTF(townUrl);
  return { tram: nodes[tramNode], mascot: nodes.body, bird: nodes.bbody_09 };
}
