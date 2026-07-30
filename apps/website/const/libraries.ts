export const LIBRARY_LABELS: Record<string, string> = {
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

// npm downloads from 2026-06-29 through 2026-07-28.
// Source: https://api.npmjs.org/downloads/point/last-month/{package}
const LIBRARY_NPM_DOWNLOADS: Record<string, number> = {
  "@react-spring/core": 24_298_919,
  "@react-spring/three": 8_064_965,
  "@react-spring/web": 20_981_002,
  "@react-three/cannon": 64_715,
  "@react-three/csg": 41_802,
  "@react-three/drei": 14_305_752,
  "@react-three/fiber": 17_291_426,
  "@react-three/flex": 9_569,
  "@react-three/postprocessing": 2_758_076,
  "@react-three/rapier": 401_719,
  "@use-gesture/react": 22_884_422,
  ecctrl: 20_411,
  jotai: 22_913_049,
  lamina: 10_580,
  leva: 3_320_650,
  maath: 16_624_068,
  meshline: 12_935_529,
  valtio: 7_673_025,
  zustand: 184_699_865,
};

export function getLibraryLabel(library: string) {
  return LIBRARY_LABELS[library] ?? library;
}

export function getLibraryPopularity(library: string) {
  return LIBRARY_NPM_DOWNLOADS[library] ?? 0;
}
