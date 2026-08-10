// Hand-written types for the vendored `realism-effects` v2 bundle (`v2.js`).
// Only the two exports this example imports are declared here.
import { Effect, EffectComposer, Pass } from "postprocessing";
import { Camera, Scene, Texture } from "three";

export class VelocityDepthNormalPass extends Pass {
  constructor(scene: Scene, camera: Camera);
  get texture(): Texture;
  get depthTexture(): Texture;
}

export interface SSGIOptions {
  mode?: "ssgi" | "ssr" | "ssdgi";
  distance?: number;
  thickness?: number;
  denoiseIterations?: number;
  denoiseKernel?: number;
  denoiseDiffuse?: number;
  denoiseSpecular?: number;
  radius?: number;
  phi?: number;
  lumaPhi?: number;
  depthPhi?: number;
  normalPhi?: number;
  roughnessPhi?: number;
  specularPhi?: number;
  envBlur?: number;
  importanceSampling?: boolean;
  steps?: number;
  refineSteps?: number;
  spp?: number;
  resolutionScale?: number;
  missedRays?: boolean;
  outputTexture?: Texture | null;
  velocityDepthNormalPass?: VelocityDepthNormalPass;
}

export class SSGIEffect extends Effect {
  constructor(
    composer: EffectComposer,
    scene: Scene,
    camera: Camera,
    options?: SSGIOptions,
  );
}
