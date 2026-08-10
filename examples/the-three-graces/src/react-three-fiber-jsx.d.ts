import type { ThreeElement, ThreeElements } from "@react-three/fiber";
import type { RoundedPlaneGeometry } from "maath/geometry";

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
    interface IntrinsicElements {
      roundedPlaneGeometry: ThreeElement<typeof RoundedPlaneGeometry>;
    }
  }
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
    interface IntrinsicElements {
      roundedPlaneGeometry: ThreeElement<typeof RoundedPlaneGeometry>;
    }
  }
}

declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
    interface IntrinsicElements {
      roundedPlaneGeometry: ThreeElement<typeof RoundedPlaneGeometry>;
    }
  }
}
