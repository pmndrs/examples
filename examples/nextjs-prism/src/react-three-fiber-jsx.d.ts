import type { ThreeElements } from "@react-three/fiber";
import type { RainbowMaterialProps } from "./components/Rainbow";

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
    interface IntrinsicElements {
      rainbowMaterial: RainbowMaterialProps;
    }
  }
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
    interface IntrinsicElements {
      rainbowMaterial: RainbowMaterialProps;
    }
  }
}

declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
    interface IntrinsicElements {
      rainbowMaterial: RainbowMaterialProps;
    }
  }
}
