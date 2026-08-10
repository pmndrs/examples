import { useState } from "react";
import * as THREE from "three";
import { Canvas, type ThreeElements } from "@react-three/fiber";
import { OrbitControls, TransformControls, useCursor } from "@react-three/drei";
import { useControls } from "leva";
import { create } from "zustand";

type Store = {
  target: THREE.Object3D | null;
  setTarget: (target: THREE.Object3D | null) => void;
};

const useStore = create<Store>((set) => ({
  target: null,
  setTarget: (target) => set({ target }),
}));

function Box(props: ThreeElements["mesh"]) {
  const setTarget = useStore((state) => state.setTarget);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);
  return (
    <mesh
      {...props}
      onClick={(e) => setTarget(e.object)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <boxGeometry />
      <meshNormalMaterial />
    </mesh>
  );
}

type TransformMode = "translate" | "rotate" | "scale";

export default function App() {
  const { target, setTarget } = useStore();
  const { mode } = useControls({
    mode: {
      value: "translate" as TransformMode,
      options: ["translate", "rotate", "scale"] as TransformMode[],
    },
  });
  return (
    <Canvas dpr={[1, 2]} onPointerMissed={() => setTarget(null)}>
      <Box position={[2, 2, 0]} />
      <Box />
      {target && <TransformControls object={target} mode={mode} />}
      <OrbitControls makeDefault />
    </Canvas>
  );
}
