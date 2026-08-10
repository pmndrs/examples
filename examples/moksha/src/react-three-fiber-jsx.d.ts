import type { ThreeElement, ThreeElements } from "@react-three/fiber";
import type { CustomMaterial } from "./components/CustomMaterial";

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
    interface IntrinsicElements {
      customMaterial: ThreeElement<typeof CustomMaterial>;
    }
  }
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
    interface IntrinsicElements {
      customMaterial: ThreeElement<typeof CustomMaterial>;
    }
  }
}

declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
    interface IntrinsicElements {
      customMaterial: ThreeElement<typeof CustomMaterial>;
    }
  }
}
