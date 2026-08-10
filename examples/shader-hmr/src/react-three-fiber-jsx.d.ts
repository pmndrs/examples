import type { ThreeElements } from "@react-three/fiber";
import type { WaveMaterialProps } from "./WaveMaterial";

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
    interface IntrinsicElements {
      waveMaterial: WaveMaterialProps;
    }
  }
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
    interface IntrinsicElements {
      waveMaterial: WaveMaterialProps;
    }
  }
}

declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
    interface IntrinsicElements {
      waveMaterial: WaveMaterialProps;
    }
  }
}
