import type { ThreeElement, ThreeElements } from "@react-three/fiber";
import type { MeshLineGeometry, MeshLineMaterial } from "meshline";

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
      meshLineGeometry: ThreeElement<typeof MeshLineGeometry>;
      meshLineMaterial: MeshLineMaterialElement;
    }
  }
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
    interface IntrinsicElements {
      meshLineGeometry: ThreeElement<typeof MeshLineGeometry>;
      meshLineMaterial: MeshLineMaterialElement;
    }
  }
}

declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
    interface IntrinsicElements {
      meshLineGeometry: ThreeElement<typeof MeshLineGeometry>;
      meshLineMaterial: MeshLineMaterialElement;
    }
  }
}
