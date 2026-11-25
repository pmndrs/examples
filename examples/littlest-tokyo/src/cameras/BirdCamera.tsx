import { Aim, Body, Extension, VirtualCamera } from "@pmndrs/klipp/react";

import { center, useTownNodes, type Vec3 } from "../model";

// Behind the town, far enough that a long lens fills the frame with the birds up on the roof.
const position: Vec3 = [-2, 2.8, -6];
// Held off the town's middle, so the blend to the next shot swings around the town.
const offset: Vec3 = [
  position[0] - center[0],
  position[1] - center[1],
  position[2] - center[2],
];

/** A long lens on the birds, turning a little after them as they move. */
export function BirdCamera({ live }: { live: boolean }) {
  const { bird } = useTownNodes();
  return (
    <VirtualCamera name="bird" priority={20} active={live}>
      <Body.Follow target={center} offset={offset} bindingMode="worldSpace" />
      <Aim.RotationComposer target={bird} damping={0.4} />
      <Extension.Lens fov={10} />
    </VirtualCamera>
  );
}
