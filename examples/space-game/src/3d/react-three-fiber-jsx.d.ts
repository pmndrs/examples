import type { ThreeElements } from "@react-three/fiber";
import type { UnrealBloomPass } from "three-stdlib";

// UnrealBloomPass is declared with four required constructor arguments, but it
// is mounted here without `args` (drei's <Effects> sizes it), so `args` is
// typed as an unstructured tuple rather than `ConstructorParameters<typeof X>`.
type PassElement<T> = Partial<T> & {
  args?: unknown[];
  attach?: string;
  attachArray?: string;
};

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
    interface IntrinsicElements {
      unrealBloomPass: PassElement<UnrealBloomPass>;
    }
  }
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
    interface IntrinsicElements {
      unrealBloomPass: PassElement<UnrealBloomPass>;
    }
  }
}

declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
    interface IntrinsicElements {
      unrealBloomPass: PassElement<UnrealBloomPass>;
    }
  }
}
