import {
  Aim,
  Body,
  Extension,
  Noise,
  VirtualCamera,
} from "@pmndrs/klipp/react";
import type { SplineDollyBodyThree } from "@pmndrs/klipp/three";
import { useRef } from "react";

import type { Vec3 } from "../model";
import { center } from "../model";

import { arrivalAt, diveDamping, diveEnd, divePath, dropAt } from "./dive";
import { overviewOrbit } from "./overview";
import { useArrival } from "./useArrival";

// Starts on the town's middle like the hero's camera, so the dive takes over its shot.
const looks: { position: number; lookAt: Vec3 }[] = [
  { position: 0, lookAt: center },
  { position: 1, lookAt: [0, 2.5, 0] },
  { position: 2, lookAt: [0.5, -0.35, 0.54] },
  { position: 3, lookAt: [0.6, -0.35, 0.9] },
  { position: 4, lookAt: [0.65, -1.35, 3.75] },
  { position: 5, lookAt: [1.48, -0.62, 1.9] },
  { position: 6, lookAt: [1.48, -0.62, 1.9] },
];
const tension = [0, 0, 0, 0.2, 0, 0.5, 0];
// Banks into the left turn over the roofs, level again where the path drops straight down.
const bank = [
  { position: 0, roll: 0 },
  { position: 1, roll: -12 },
  { position: 2, roll: 0 },
];

// The view opens up from the hero's lens on the way in, widens and shakes on the way down and settles at the bottom.
const fov = 70;
const dropFov = 110;
const shakeAmplitude: Vec3 = [1.5, 1.5, 0.8];
const shakeFrequency: Vec3 = [4, 4, 4];

/**
 * Flies in from the hero's shot, dives into the alley and rides it out to the cat as `progress` goes from `0` to `1`.
 * While `finishing`, `onArrive` tells when the camera has caught up with `progress`.
 */
export function DiveCamera({
  live,
  progress,
  finishing,
  onArrive,
}: {
  live: boolean;
  progress: number;
  finishing: boolean;
  onArrive: () => void;
}) {
  const dolly = useRef<SplineDollyBodyThree>(null);
  useArrival(dolly, finishing, onArrive);
  const drop = dropAt(progress);
  const lensFov =
    overviewOrbit.fov +
    (fov - overviewOrbit.fov) * arrivalAt(progress) +
    (dropFov - fov) * drop;
  return (
    <VirtualCamera
      name="dive"
      priority={20}
      active={live}
      initialState={{ fov: overviewOrbit.fov }}
    >
      {/* A target, so the blend from the hero's orbit arcs around the town as that orbit's spherical hint asks. */}
      <Body.SplineDolly
        ref={dolly}
        spline={divePath}
        tension={tension}
        target={center}
        positionUnits="knot"
        position={progress * diveEnd}
        damping={diveDamping}
      />
      <Aim.SplineDollyLookAtTargets targets={looks} easing={0.5} />
      <Extension.SplineRoll points={bank} easing={0.5} />
      <Extension.Lens fov={lensFov} fovDamping={diveDamping} />
      <Noise.BasicMultiChannelPerlin
        rotationAmplitude={shakeAmplitude}
        rotationFrequency={shakeFrequency}
        amplitudeGain={drop}
        amplitudeDamping={diveDamping}
      />
    </VirtualCamera>
  );
}
