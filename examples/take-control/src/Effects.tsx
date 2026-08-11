import { Circle } from "@react-three/drei";
import {
  EffectComposer,
  GodRays,
  HueSaturation,
  Noise,
  Vignette,
} from "@react-three/postprocessing";
import { useControls } from "leva";
import { BlendFunction } from "postprocessing";
import { useState } from "react";
import type { Mesh } from "three";

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
    hue: { value: 0, min: -1, max: 1 },
    saturation: { value: 0, min: -1, max: 1 },
  });
  const { noiseOpacity } = useControls("Postprocessing - Noise", {
    noiseOpacity: { value: 0.5, min: 0, max: 1, label: "Opacity" },
  });
  const { exposure, decay, blur } = useControls("Postprocessing - GodRays", {
    exposure: { value: 0.34, min: 0, max: 1 },
    decay: { value: 0.9, min: 0, max: 1 },
    blur: { value: false },
  });

  return (
    <>
      <Sun onReady={setSun} />
      {sun && (
        <EffectComposer multisampling={0} autoClear={false}>
          <HueSaturation hue={hue} saturation={saturation} />
          <GodRays sun={sun} exposure={exposure} decay={decay} blur={blur} />
          <Noise
            opacity={noiseOpacity}
            premultiply
            blendFunction={BlendFunction.ADD}
          />
          <Vignette />
        </EffectComposer>
      )}
    </>
  );
}
