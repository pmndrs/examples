import type { ThreeElements } from "@react-three/fiber";
import type { GrassMaterialProps } from "./GrassMaterial";

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
    interface IntrinsicElements {
      grassMaterial: GrassMaterialProps;
    }
  }
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
    interface IntrinsicElements {
      grassMaterial: GrassMaterialProps;
    }
  }
}

declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
    interface IntrinsicElements {
      grassMaterial: GrassMaterialProps;
    }
  }
}
