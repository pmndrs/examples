import type { ThreeElements } from "@react-three/fiber";
import type { XFadeMaterialProps } from "./XFadeMaterial";

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
    interface IntrinsicElements {
      xFadeMaterial: XFadeMaterialProps;
    }
  }
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
    interface IntrinsicElements {
      xFadeMaterial: XFadeMaterialProps;
    }
  }
}

declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
    interface IntrinsicElements {
      xFadeMaterial: XFadeMaterialProps;
    }
  }
}
