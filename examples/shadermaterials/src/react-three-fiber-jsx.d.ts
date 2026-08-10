import type { ThreeElements } from "@react-three/fiber";
import type { ImageFadeMaterialProps } from "./App";

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
    interface IntrinsicElements {
      imageFadeMaterial: ImageFadeMaterialProps;
    }
  }
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
    interface IntrinsicElements {
      imageFadeMaterial: ImageFadeMaterialProps;
    }
  }
}

declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
    interface IntrinsicElements {
      imageFadeMaterial: ImageFadeMaterialProps;
    }
  }
}
