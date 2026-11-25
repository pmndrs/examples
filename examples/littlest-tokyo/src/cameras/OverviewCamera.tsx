import { BlendHints } from "@pmndrs/klipp";
import { Aim, Body, VirtualCamera } from "@pmndrs/klipp/react";

import { center } from "../model";

import type { Orbit } from "./overview";

/** A slow sway around the town on `orbit`, for the hero and the closing shot. */
export function OverviewCamera({
  name,
  orbit: { radius, horizontal, vertical, sway, fov },
  live,
}: {
  name: string;
  orbit: Orbit;
  live: boolean;
}) {
  return (
    <VirtualCamera
      name={name}
      priority={10}
      active={live}
      initialState={{ fov }}
      hints={BlendHints.sphericalPosition}
    >
      <Body.OrbitFollow
        target={center}
        radius={radius}
        horizontal={{
          center: horizontal,
          range: [horizontal - sway, horizontal + sway],
          wrap: false,
          autoMove: {
            enabled: true,
            speed: (4 * sway) / 15,
            wait: 0,
            time: 15 / 2,
          },
        }}
        vertical={{ center: vertical }}
      />
      <Aim.HardLookAt target={center} />
    </VirtualCamera>
  );
}
