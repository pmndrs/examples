import { Damper } from "@pmndrs/klipp";
import { useKlipp } from "@pmndrs/klipp/react";
import { Vector3Damper } from "@pmndrs/klipp/three";
import { useFrame } from "@react-three/fiber";
import {
  Bloom,
  DepthOfField,
  EffectComposer,
  ToneMapping,
  Vignette,
} from "@react-three/postprocessing";
import { ToneMappingMode, type DepthOfFieldEffect } from "postprocessing";
import { useEffect, useRef, useState, type RefObject } from "react";
import { Vector3 } from "three";

import { useTownNodes } from "../model";

import { diveDamping } from "../cameras/dive";

import type { Focus } from "./focus";
import { SpeedLinesEffect } from "./SpeedLinesEffect";

const linesFadeOut = 0.2;
const focusDamping = 0.5;

/** A light finish, depth of field as `focus` says, and speed lines around the edges as `speed` goes from `0` to `1`. */
export function Effects({ focus, speed }: { focus: Focus; speed: number }) {
  const depthOfField = useFocus(focus);
  const speedLines = useSpeedLines(speed);

  return (
    <EffectComposer multisampling={4}>
      <DepthOfField ref={depthOfField} target={[0, 0, 0]} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <Bloom intensity={0.2} mipmapBlur={true} />
      <Vignette offset={0.5} darkness={0.3} />
      <primitive object={speedLines} />
    </EffectComposer>
  );
}

/** Eases depth of field to `focus`, so moving from one section to the next blurs and refocuses gradually. */
function useFocus(focus: Focus): RefObject<DepthOfFieldEffect | null> {
  const klipp = useKlipp();
  const { tram } = useTownNodes();
  const depthOfField = useRef<DepthOfFieldEffect>(null);
  const eased = useRef({
    blur: { damper: new Damper(), value: 0 },
    range: { damper: new Damper(), value: focus.range },
    point: { damper: new Vector3Damper(), value: new Vector3() },
    target: new Vector3(),
  });

  useFrame((_, dt) => {
    const effect = depthOfField.current;
    if (!effect) return;
    const { blur, range, point, target } = eased.current;
    if (focus.on === "tram") tram.getWorldPosition(target);
    else if (klipp.shot.hasLookAtTarget)
      target.fromArray(klipp.shot.lookAtTarget);
    point.damper.update(point.value, target, focusDamping, dt);
    effect.target?.copy(point.value);
    blur.value = blur.damper.update(blur.value, focus.blur, focusDamping, dt);
    effect.bokehScale = blur.value;
    range.value = range.damper.update(
      range.value,
      focus.range,
      focusDamping,
      dt,
    );
    effect.cocMaterial.focusRange = range.value;
  });

  return depthOfField;
}

/** The speed lines, eased to `speed`. */
function useSpeedLines(speed: number): SpeedLinesEffect {
  const [effect] = useState(() => new SpeedLinesEffect());
  const amount = useRef({ damper: new Damper(), value: 0 });

  useEffect(() => () => effect.dispose(), [effect]);

  useFrame((_, dt) => {
    // Damped like the dive's dolly on the way in, so the lines come with the camera's drop, then gone quickly.
    const { damper } = amount.current;
    const time = speed > amount.current.value ? diveDamping : linesFadeOut;
    amount.current.value = damper.update(amount.current.value, speed, time, dt);
    effect.setAmount(amount.current.value);
  });

  return effect;
}
