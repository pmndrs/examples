import { BlendHints } from "@pmndrs/klipp";
import { Extension, KlippControls, useKlipp } from "@pmndrs/klipp/react";
import { useState } from "react";

import { center } from "../model";

const eased = { damping: 0.15 };

/** The viewer's own camera. It comes on in the shot on screen, with its lens, so taking control starts from there. */
export function FreeLookCamera({ live }: { live: boolean }) {
  const klipp = useKlipp();
  const [wasLive, setWasLive] = useState(live);
  const [fov, setFov] = useState(klipp.shot.fov);

  if (live !== wasLive) {
    setWasLive(live);
    if (live) setFov(klipp.shot.fov);
  }

  return (
    <KlippControls
      name="free-look"
      priority={100}
      active={live}
      hints={BlendHints.inheritPosition}
      target={center}
      distance={6}
      horizontal={eased}
      vertical={eased}
      zoom={eased}
      pan={eased}
      blendThreshold={0}
    >
      <Extension.Lens fov={fov} />
    </KlippControls>
  );
}
