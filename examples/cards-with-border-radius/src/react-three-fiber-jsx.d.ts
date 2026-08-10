import type { ThreeElements } from "@react-three/fiber";
import type { BentPlaneGeometry } from "./util";

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
    interface IntrinsicElements {
      bentPlaneGeometry: Omit<ThreeElements["planeGeometry"], "args"> & {
        args?: ConstructorParameters<typeof BentPlaneGeometry>;
      };
      meshSineMaterial: ThreeElements["meshBasicMaterial"];
    }
  }
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
    interface IntrinsicElements {
      bentPlaneGeometry: Omit<ThreeElements["planeGeometry"], "args"> & {
        args?: ConstructorParameters<typeof BentPlaneGeometry>;
      };
      meshSineMaterial: ThreeElements["meshBasicMaterial"];
    }
  }
}

declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
    interface IntrinsicElements {
      bentPlaneGeometry: Omit<ThreeElements["planeGeometry"], "args"> & {
        args?: ConstructorParameters<typeof BentPlaneGeometry>;
      };
      meshSineMaterial: ThreeElements["meshBasicMaterial"];
    }
  }
}
