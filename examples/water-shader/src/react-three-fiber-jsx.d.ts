import type { ThreeElement, ThreeElements } from "@react-three/fiber";
import type { Water } from "three-stdlib";

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
    interface IntrinsicElements {
      water: ThreeElement<typeof Water>;
    }
  }
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
    interface IntrinsicElements {
      water: ThreeElement<typeof Water>;
    }
  }
}

declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
    interface IntrinsicElements {
      water: ThreeElement<typeof Water>;
    }
  }
}
