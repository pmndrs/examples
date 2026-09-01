import { EffectComposer, N8AO } from "@react-three/postprocessing";
import { useControls } from "leva";

export function N8AOEffect() {
  const {
    enabled,
    intensity,
    aoRadius,
    distanceFalloff,
    aoSamples,
    denoiseSamples,
    denoiseRadius,
    color,
    quality,
    screenSpaceRadius,
    halfRes,
    depthAwareUpsampling,
    renderMode,
  } = useControls("Postprocessing - N8AO", {
    enabled: { value: true },
    intensity: { value: 6, min: 0, max: 10, step: 0.1 },
    aoRadius: { value: 6, min: 0.1, max: 10, step: 0.1 },
    distanceFalloff: { value: 1, min: 0, max: 3, step: 0.05 },
    aoSamples: { value: 16, min: 1, max: 64, step: 1 },
    denoiseSamples: { value: 8, min: 1, max: 32, step: 1 },
    denoiseRadius: { value: 12, min: 0, max: 50, step: 1 },
    screenSpaceRadius: { value: true },
    halfRes: { value: false },
    depthAwareUpsampling: { value: true },
    color: { value: "#000000" },
    quality: {
      value: "high",
      options: ["performance", "low", "medium", "high", "ultra"],
    },
    renderMode: {
      value: 3,
      options: {
        Combined: 0,
        "AO Only": 1,
        "Scene Only": 2,
        "Split (Combined)": 3,
        "Split (AO Only)": 4,
      },
    },
  });

  return (
    <EffectComposer>
      <N8AO
        enabled={enabled}
        intensity={intensity}
        aoRadius={aoRadius}
        distanceFalloff={distanceFalloff}
        aoSamples={aoSamples}
        denoiseSamples={denoiseSamples}
        denoiseRadius={denoiseRadius}
        color={color}
        quality={quality as "performance" | "low" | "medium" | "high" | "ultra"}
        screenSpaceRadius={screenSpaceRadius}
        halfRes={halfRes}
        depthAwareUpsampling={depthAwareUpsampling}
        renderMode={renderMode as 0 | 1 | 2 | 3 | 4}
      />
    </EffectComposer>
  );
}
