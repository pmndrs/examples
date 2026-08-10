import type { ThreeElement, ThreeElements } from "@react-three/fiber";
import type { UnrealBloomPass } from "three-stdlib";

// UnrealBloomPass's constructor parameters are typed as required, but the
// implementation falls back to defaults when they're omitted, so `args` is
// safe to leave optional here (matching the original JSX, which omits it).
type UnrealBloomPassElement = Omit<
  ThreeElement<typeof UnrealBloomPass>,
  "args"
> & {
  args?: ConstructorParameters<typeof UnrealBloomPass>;
};

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
    interface IntrinsicElements {
      unrealBloomPass: UnrealBloomPassElement;
    }
  }
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
    interface IntrinsicElements {
      unrealBloomPass: UnrealBloomPassElement;
    }
  }
}

declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
    interface IntrinsicElements {
      unrealBloomPass: UnrealBloomPassElement;
    }
  }
}
