import type { ThreeElement, ThreeElements } from "@react-three/fiber";
import type {
  MeshLineGeometry,
  MeshLineMaterial,
  PointsRepresentation,
} from "meshline";
import type { LayerMaterialProps } from "./materials/layerMaterial";

// meshline types the `points` field as the *stored* value (`Float32Array |
// number[]`), but assigning to it forwards to `setPoints`, which takes any
// `PointsRepresentation` — `THREE.Vector3[]` included.
type MeshLineGeometryElement = Omit<
  ThreeElement<typeof MeshLineGeometry>,
  "points"
> & {
  points?: PointsRepresentation;
};

// meshline's own `MeshLineMaterialParameters` marks `resolution` as required,
// which makes `ThreeElement`'s derived `args` tuple required too. At runtime
// the constructor tolerates no parameters at all (it forwards them to
// `Material.setValues`, which no-ops on `undefined`), so `args` is optional
// here just like every other three.js JSX intrinsic.
type MeshLineMaterialElement = Omit<
  ThreeElement<typeof MeshLineMaterial>,
  "args"
> & {
  args?: ConstructorParameters<typeof MeshLineMaterial>;
};

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
    interface IntrinsicElements {
      layerMaterial: LayerMaterialProps;
      meshLineGeometry: MeshLineGeometryElement;
      meshLineMaterial: MeshLineMaterialElement;
    }
  }
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
    interface IntrinsicElements {
      layerMaterial: LayerMaterialProps;
      meshLineGeometry: MeshLineGeometryElement;
      meshLineMaterial: MeshLineMaterialElement;
    }
  }
}

declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
    interface IntrinsicElements {
      layerMaterial: LayerMaterialProps;
      meshLineGeometry: MeshLineGeometryElement;
      meshLineMaterial: MeshLineMaterialElement;
    }
  }
}
