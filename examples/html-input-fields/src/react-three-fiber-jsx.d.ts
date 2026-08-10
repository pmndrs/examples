import type { ThreeElement, ThreeElements } from "@react-three/fiber";
import type { WaterPass } from "three-stdlib";

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
    interface IntrinsicElements {
      waterPass: ThreeElement<typeof WaterPass>;
    }
  }
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
    interface IntrinsicElements {
      waterPass: ThreeElement<typeof WaterPass>;
    }
  }
}

declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
    interface IntrinsicElements {
      waterPass: ThreeElement<typeof WaterPass>;
    }
  }
}
