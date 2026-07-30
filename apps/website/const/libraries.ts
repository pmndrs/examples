export const LIBRARY_LABELS: Record<string, string> = {
  "@pmndrs/assets": "Assets",
  "@pmndrs/branding": "Branding",
  "@react-spring/core": "React Spring Core",
  "@react-spring/three": "React Spring Three",
  "@react-spring/web": "React Spring Web",
  "@react-three/cannon": "Cannon",
  "@react-three/csg": "CSG",
  "@react-three/drei": "Drei",
  "@react-three/fiber": "R3F",
  "@react-three/flex": "Flex",
  "@react-three/postprocessing": "Postprocessing",
  "@react-three/rapier": "Rapier",
  "@use-gesture/react": "Use Gesture",
  ecctrl: "Ecctrl",
  jotai: "Jotai",
  lamina: "Lamina",
  leva: "Leva",
  maath: "Maath",
  meshline: "Meshline",
  "suspend-react": "Suspend React",
  "three-stdlib": "Three Stdlib",
  "tunnel-rat": "Tunnel Rat",
  "use-asset": "Use Asset",
  valtio: "Valtio",
  zustand: "Zustand",
};

export function getLibraryLabel(library: string) {
  return LIBRARY_LABELS[library] ?? library;
}
