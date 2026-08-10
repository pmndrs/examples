import { useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, type ThreeElements } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import {
  Selection,
  Select,
  EffectComposer,
  Outline,
} from "@react-three/postprocessing";

function Box(props: ThreeElements["mesh"]) {
  const ref = useRef<THREE.Mesh>(null!);
  const [hovered, hover] = useState<boolean | null>(null);
  console.log(hovered);
  useFrame(
    (state, delta) =>
      (ref.current.rotation.x = ref.current.rotation.y += delta),
  );
  return (
    <Select enabled={hovered ?? undefined}>
      <mesh
        ref={ref}
        {...props}
        onPointerOver={() => hover(true)}
        onPointerOut={() => hover(false)}
      >
        <boxGeometry />
        <meshStandardMaterial color="orange" />
      </mesh>
    </Select>
  );
}

export default function App() {
  return (
    <Canvas dpr={[1, 2]}>
      <ambientLight intensity={0.5 * Math.PI} />
      <spotLight
        position={[10, 10, 10]}
        intensity={Math.PI}
        decay={0}
        angle={0.15}
        penumbra={1}
      />
      <pointLight position={[-10, -10, -10]} intensity={Math.PI} decay={0} />
      <Selection>
        <EffectComposer multisampling={8} autoClear={false}>
          <Outline
            blur
            // `postprocessing`'s OutlineEffect constructor types visibleEdgeColor
            // as number, but it forwards straight into `new THREE.Color(...)`,
            // which also accepts a color name string like "white".
            visibleEdgeColor={"white" as unknown as number}
            edgeStrength={100}
            width={1000}
          />
        </EffectComposer>
        <Box position={[-1, 0, 0]} />
        <Box position={[1, 0, 0]} />
      </Selection>
      <OrbitControls />
    </Canvas>
  );
}
