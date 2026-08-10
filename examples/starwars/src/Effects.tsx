import { useLoader } from "@react-three/fiber";
import { EffectComposer, SSR, Bloom, LUT } from "@react-three/postprocessing";
import { useControls } from "leva";
import { LUTCubeLoader, type LookupTexture } from "postprocessing";

import lutTex from "./F-6800-STD.cube?url";

export function Effects() {
  // LUTCubeLoader doesn't type its `loadAsync` result, so useLoader can't infer it.
  const texture = useLoader(LUTCubeLoader, lutTex) as LookupTexture;
  const { enabled, ...props } = useControls({
    enabled: true,
    temporalResolve: true,
    STRETCH_MISSED_RAYS: true,
    USE_MRT: true,
    USE_NORMALMAP: true,
    USE_ROUGHNESSMAP: true,
    ENABLE_JITTERING: true,
    ENABLE_BLUR: true,
    temporalResolveMix: { value: 0.9, min: 0, max: 1 },
    temporalResolveCorrectionMix: { value: 0.4, min: 0, max: 1 },
    maxSamples: { value: 0, min: 0, max: 1 },
    resolutionScale: { value: 1, min: 0, max: 1 },
    blurMix: { value: 0.2, min: 0, max: 1 },
    blurExponent: { value: 10, min: 0, max: 20 },
    blurKernelSize: { value: 1, min: 0, max: 10 },
    rayStep: { value: 0.5, min: 0, max: 1 },
    intensity: { value: 1, min: 0, max: 5 },
    maxRoughness: { value: 1, min: 0, max: 1 },
    jitter: { value: 0.3, min: 0, max: 5 },
    jitterSpread: { value: 0.25, min: 0, max: 1 },
    jitterRough: { value: 0.1, min: 0, max: 1 },
    roughnessFadeOut: { value: 1, min: 0, max: 1 },
    rayFadeOut: { value: 0, min: 0, max: 1 },
    MAX_STEPS: { value: 20, min: 0, max: 20 },
    NUM_BINARY_SEARCH_STEPS: { value: 6, min: 0, max: 10 },
    maxDepthDifference: { value: 10, min: 0, max: 10 },
    maxDepth: { value: 1, min: 0, max: 1 },
    thickness: { value: 10, min: 0, max: 10 },
    ior: { value: 1.45, min: 0, max: 2 },
  });
  // `disableNormalPass` isn't part of EffectComposerProps (normal pass is now
  // opt-in via `enableNormalPass`, off by default) — keep it in a separate
  // object so it still reaches the component exactly like the original prop.
  const composerProps = { disableNormalPass: true };
  return (
    enabled && (
      <EffectComposer {...composerProps}>
        <SSR {...props} />
        <Bloom
          luminanceThreshold={0.5}
          mipmapBlur
          luminanceSmoothing={0}
          intensity={1.5}
        />
        <LUT lut={texture} />
      </EffectComposer>
    )
  );
}
