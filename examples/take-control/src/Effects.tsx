import { useState } from "react";
import type { Mesh } from "three";
import { BlendFunction } from "postprocessing";
import {
  EffectComposer,
  GodRays,
  HueSaturation,
  Noise,
  Vignette,
} from "@react-three/postprocessing";
import { Circle } from "@react-three/drei";
import { useControls } from "leva";

function Sun({ onReady }: { onReady: (sun: Mesh) => void }) {
  const { sunColor } = useControls({
    sunColor: { value: "#FF0000", label: "sun color" },
  });

  return (
    <Circle args={[10, 10]} ref={onReady} position={[0, 0, -16]}>
      <meshBasicMaterial color={sunColor} />
    </Circle>
  );
}

export default function Effects() {
  const [sun, setSun] = useState<Mesh | null>(null);

  const { hue, saturation } = useControls("Postprocessing - HueSaturation", {
    hue: { value: 3.11, min: 0, max: Math.PI * 2 },
    saturation: { value: 2.05, min: 0, max: Math.PI * 2 },
  });
  const { noiseOpacity } = useControls("Postprocessing - Noise", {
    noiseOpacity: { value: 0.47, min: 0, max: 1, label: "Opacity" },
  });
  const { exposure, decay, blur } = useControls("Postprocessing - GodRays", {
    exposure: { value: 0.34, min: 0, max: 1 },
    decay: { value: 0.9, min: 0, max: 1, step: 0.1 },
    blur: { value: false },
  });

  return (
    <>
      <Sun onReady={setSun} />
      {sun && (
        <EffectComposer multisampling={0} autoClear={false}>
          <GodRays sun={sun} exposure={exposure} decay={decay} blur={blur} />
          <Noise
            opacity={noiseOpacity}
            premultiply
            blendFunction={BlendFunction.ADD}
          />
          <HueSaturation hue={hue} saturation={saturation} />
          <Vignette />
        </EffectComposer>
      )}
    </>
  );
}
