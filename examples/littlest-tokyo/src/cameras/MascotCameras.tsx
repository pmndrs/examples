import { Aim, Body, VirtualCamera } from "@pmndrs/klipp/react";
import { Euler, Quaternion } from "three";

import { useTownNodes, type Vec3 } from "../model";

// Square to the town's front, looking 60° down at the stall. The composer slides the camera and keeps this direction.
const tilt = Math.PI / 3;
const distance = 1;
const view = new Quaternion().setFromEuler(new Euler(-tilt, 0, 0));
// Where the sliding camera settles over the middle of the mascot's run, so the turning one starts in the same spot.
const position: Vec3 = [
  1.42,
  -0.98 + Math.sin(tilt) * distance,
  2.2 + Math.cos(tilt) * distance,
];

/** Turns after the mascot from where the sliding camera starts. */
export function TurningCamera({ live }: { live: boolean }) {
  const { mascot } = useTownNodes();
  return (
    <VirtualCamera
      name="mascot-turn"
      priority={20}
      active={live}
      initialState={{ position, quaternion: view, fov: 40 }}
    >
      <Aim.RotationComposer target={mascot} damping={0.2} />
    </VirtualCamera>
  );
}

/** Slides after the mascot without turning. */
export function SlidingCamera({ live }: { live: boolean }) {
  const { mascot } = useTownNodes();
  return (
    <VirtualCamera
      name="mascot-slide"
      priority={20}
      active={live}
      initialState={{ position, quaternion: view, fov: 40 }}
    >
      <Body.PositionComposer
        target={mascot}
        cameraDistance={distance}
        damping={0.2}
      />
    </VirtualCamera>
  );
}
