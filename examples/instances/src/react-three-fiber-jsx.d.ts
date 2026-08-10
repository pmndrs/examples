import type { ThreeElements, ThreeElement } from "@react-three/fiber";
import type { MeshEdgesMaterial } from "./App";

type MeshEdgesMaterialElement = ThreeElement<typeof MeshEdgesMaterial>;

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
    interface IntrinsicElements {
      meshEdgesMaterial: MeshEdgesMaterialElement;
    }
  }
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
    interface IntrinsicElements {
      meshEdgesMaterial: MeshEdgesMaterialElement;
    }
  }
}

declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
    interface IntrinsicElements {
      meshEdgesMaterial: MeshEdgesMaterialElement;
    }
  }
}
