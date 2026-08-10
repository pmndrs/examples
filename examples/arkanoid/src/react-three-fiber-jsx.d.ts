import type { ThreeElement, ThreeElements } from "@react-three/fiber";
import type { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import type { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import type { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import type { FilmPass } from "three/examples/jsm/postprocessing/FilmPass.js";
import type { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

// RenderPass, UnrealBloomPass, FilmPass and ShaderPass are constructed here
// with argument counts/placeholders (e.g. `undefined` for a required
// Vector2, or more args than the constructor declares) that don't line up
// with their declared constructor signatures, so `args` is typed as an
// unstructured tuple rather than `ConstructorParameters<typeof X>`.
type PassElement<T> = Partial<T> & {
  args?: unknown[];
  attach?: string;
  attachArray?: string;
};

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
    interface IntrinsicElements {
      effectComposer: ThreeElement<typeof EffectComposer>;
      renderPass: PassElement<RenderPass>;
      unrealBloomPass: PassElement<UnrealBloomPass>;
      filmPass: PassElement<FilmPass>;
      shaderPass: PassElement<ShaderPass>;
    }
  }
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
    interface IntrinsicElements {
      effectComposer: ThreeElement<typeof EffectComposer>;
      renderPass: PassElement<RenderPass>;
      unrealBloomPass: PassElement<UnrealBloomPass>;
      filmPass: PassElement<FilmPass>;
      shaderPass: PassElement<ShaderPass>;
    }
  }
}

declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
    interface IntrinsicElements {
      effectComposer: ThreeElement<typeof EffectComposer>;
      renderPass: PassElement<RenderPass>;
      unrealBloomPass: PassElement<UnrealBloomPass>;
      filmPass: PassElement<FilmPass>;
      shaderPass: PassElement<ShaderPass>;
    }
  }
}
