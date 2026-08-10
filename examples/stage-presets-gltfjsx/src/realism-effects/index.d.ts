// Hand-written types for the vendored `realism-effects` bundle (`index.js`),
// which ships no declarations of its own. Only the symbols this example
// imports are declared here.
import type { Camera, Scene } from "three";
import { Effect, EffectComposer, Pass } from "postprocessing";

/** Options accepted by {@link SSGIEffect}; every one of them is optional. */
export interface SSGIOptions {
  /** maximum distance a SSGI ray can travel to find what it reflects */
  distance: number;
  /** maximum depth difference between a ray and the particular depth at its screen position */
  thickness: number;
  /** maximum roughness a texel can have to have SSGI calculated for it */
  maxRoughness: number;
  /** a value between 0 and 1 to set how much the last frame's SSGI should be blended in */
  blend: number;
  /** how many times the denoise filter runs */
  denoiseIterations: number;
  /** the kernel (~ number of neighboring pixels) to take into account when denoising a pixel */
  denoiseKernel: number;
  /** diffuse luminance factor of the denoiser */
  denoiseDiffuse: number;
  /** specular luminance factor of the denoiser */
  denoiseSpecular: number;
  rings: number;
  samples: number;
  radius: number;
  phi: number;
  lumaPhi: number;
  /** depth factor of the denoiser */
  depthPhi: number;
  /** normals factor of the denoiser */
  normalPhi: number;
  /** roughness factor of the denoiser */
  roughnessPhi: number;
  specularPhi: number;
  diffusePhi: number;
  /** higher values sample lower mipmaps of the environment map */
  envBlur: number;
  /** whether to use importance sampling for the environment map */
  importanceSampling: boolean;
  /** number of steps a SSGI ray can maximally do to find an object it intersected */
  steps: number;
  /** number of refinement steps once a ray intersected something */
  refineSteps: number;
  /** number of samples per pixel */
  spp: number;
  /** whether there should still be SSGI for rays that missed */
  missedRays: boolean;
  /** resolution of the SSGI effect, 0.5 meaning half resolution */
  resolutionScale: number;
  diffuseOnly: boolean;
  specularOnly: boolean;
}

/** Options accepted by {@link TRAAEffect}. */
export interface TRAAOptions {
  blend: number;
  dilation: boolean;
  logTransform: boolean;
  neighborhoodClampRadius: number;
  neighborhoodClamp: boolean;
}

/** Options accepted by {@link MotionBlurEffect}. */
export interface MotionBlurOptions {
  intensity: number;
  jitter: number;
  samples: number;
}

/** Renders velocity, depth and normals of the scene into a single buffer. */
export class VelocityDepthNormalPass extends Pass {
  constructor(scene: Scene, camera: Camera, renderDepth?: boolean);
}

/** Screen space global illumination. */
export class SSGIEffect extends Effect {
  constructor(
    composer: EffectComposer,
    scene: Scene,
    camera: Camera,
    velocityDepthNormalPass: VelocityDepthNormalPass,
    options?: Partial<SSGIOptions>,
  );
}

/** Temporal reprojection anti-aliasing. */
export class TRAAEffect extends Effect {
  constructor(
    scene: Scene,
    camera: Camera,
    velocityDepthNormalPass: VelocityDepthNormalPass,
    options?: Partial<TRAAOptions>,
  );
}

/** Per-object motion blur driven by the velocity buffer. */
export class MotionBlurEffect extends Effect {
  constructor(
    velocityPass: VelocityDepthNormalPass,
    options?: Partial<MotionBlurOptions>,
  );
}
