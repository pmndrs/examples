import { useFrame, useThree } from "@react-three/fiber";
import {
  Autofocus,
  Bloom,
  BrightnessContrast,
  ChromaticAberration,
  HueSaturation,
  Noise,
  Vignette,
} from "@react-three/postprocessing";
import { useControls } from "leva";
import { useMemo, useState } from "react";
import { Vector3 } from "three";

export function ColorAndEffects() {
  const {
    chromaticAberration,
    bloom,
    vignette,
    hue,
    saturation,
    brightness,
    contrast,
    grain,
  } = useControls("Color & Effects", {
    chromaticAberration: {
      value: 0.05,
      min: 0,
      max: 1,
      step: 0.01,
      label: "Chromatic Aberration",
    },
    bloom: { value: 1, min: 0, max: 5, step: 0.05, label: "Bloom" },
    vignette: { value: 0.65, min: 0, max: 1, step: 0.01, label: "Vignette" },
    hue: {
      value: 0,
      min: -Math.PI,
      max: Math.PI,
      step: 0.01,
      label: "Hue Shift",
    },
    saturation: {
      value: 0.2,
      min: -1,
      max: 1,
      step: 0.01,
      label: "Saturation",
    },
    brightness: {
      value: 0,
      min: -0.75,
      max: 0.75,
      step: 0.01,
      label: "Brightness",
    },
    contrast: {
      value: 0,
      min: -0.75,
      max: 0.75,
      step: 0.01,
      label: "Contrast",
    },
    grain: { value: 0.4, min: 0, max: 1, step: 0.01, label: "Grain" },
  });

  return (
    <>
      <ChromaticAberration
        offset={[chromaticAberration * 0.01, chromaticAberration * 0.01]}
      />
      <Bloom intensity={bloom} mipmapBlur />
      <Vignette darkness={vignette} offset={0.4 * Math.pow(1 - vignette, 2)} />
      <HueSaturation hue={hue} saturation={saturation} />
      <BrightnessContrast brightness={brightness} contrast={contrast} />
      <Noise opacity={grain} premultiply />
    </>
  );
}

export function FocusEffect() {
  const { enabled, autoFocus, focusDistance, focusRange, bokehScale } =
    useControls("Focus", {
      enabled: { value: true, label: "Depth of Field" },
      autoFocus: { value: true, label: "Autofocus" },
      focusDistance: {
        value: 5,
        min: 0.1,
        max: 100,
        step: 0.1,
        label: "Focus Distance",
        render: (get) => !get("Focus.autoFocus"),
      },
      focusRange: {
        value: 20,
        min: 0.5,
        max: 200,
        step: 0.5,
        label: "Focus Range",
      },
      bokehScale: {
        value: 4.46,
        min: 0,
        max: 10,
        step: 0.1,
        label: "Bokeh Scale",
      },
    });

  const camera = useThree((state) => state.camera);
  const [manualTarget] = useState(() => new Vector3());
  const direction = useMemo(() => new Vector3(), []);

  useFrame(() => {
    if (autoFocus) return;
    camera.getWorldDirection(direction);
    manualTarget
      .copy(camera.position)
      .addScaledVector(direction, focusDistance);
  });

  return (
    <Autofocus
      bokehScale={enabled ? bokehScale : 0}
      focusRange={focusRange}
      target={autoFocus ? undefined : manualTarget}
    />
  );
}
