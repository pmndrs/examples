import type { ThreeElement, ThreeElements } from "@react-three/fiber";
import type { PortalMaterial } from "./App";

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
    interface IntrinsicElements {
      portalMaterial: ThreeElement<typeof PortalMaterial>;
    }
  }
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
    interface IntrinsicElements {
      portalMaterial: ThreeElement<typeof PortalMaterial>;
    }
  }
}

declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
    interface IntrinsicElements {
      portalMaterial: ThreeElement<typeof PortalMaterial>;
    }
  }
}
