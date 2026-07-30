export const LIBRARY_LABELS: Record<string, string> = {
  "@pmndrs/assets": "Assets",
  "@pmndrs/branding": "Branding",
  "@react-spring/core": "React Spring",
  "@react-spring/three": "React Spring",
  "@react-spring/web": "React Spring",
  "@react-three/cannon": "Cannon",
  "@react-three/csg": "CSG",
  "@react-three/drei": "Drei",
  "@react-three/fiber": "R3F",
  "@react-three/flex": "Flex",
  "@react-three/postprocessing": "Postprocessing",
  "@react-three/rapier": "Rapier",
  "@use-gesture/react": "useGesture",
  ecctrl: "Ecctrl",
  jotai: "Jotai",
  lamina: "Lamina",
  leva: "Leva",
  maath: "Maath",
  meshline: "Meshline",
  valtio: "Valtio",
  zustand: "Zustand",
};

export function getLibraryLabel(library: string) {
  return LIBRARY_LABELS[library] ?? library;
}
