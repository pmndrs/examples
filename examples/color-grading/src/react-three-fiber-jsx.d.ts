import type { ThreeElement, ThreeElements } from "@react-three/fiber";
import type { LUTPass } from "three-stdlib";

// LUTPass's constructor parameters are typed as required, but the JSX usage
// below never passes `args`, so make it optional here (matching the original
// JSX, which omits it).
type LUTPassElement = Omit<ThreeElement<typeof LUTPass>, "args"> & {
  args?: ConstructorParameters<typeof LUTPass>;
};

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
    interface IntrinsicElements {
      lUTPass: LUTPassElement;
    }
  }
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
    interface IntrinsicElements {
      lUTPass: LUTPassElement;
    }
  }
}

declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
    interface IntrinsicElements {
      lUTPass: LUTPassElement;
    }
  }
}
