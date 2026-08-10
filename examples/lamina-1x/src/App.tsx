import { useRef, type ComponentRef } from "react";
import { Canvas, useFrame, type ThreeElements } from "@react-three/fiber";
import { useGLTF, Bounds, Edges } from "@react-three/drei";
// use ↓ "DebugLayerMaterial as LayerMaterial" ↓ here for integrated leva debug panels
import { LayerMaterial, Depth, Fresnel } from "lamina";
import { useControls } from "leva";
import { type GLTF } from "three-stdlib";
import * as THREE from "three";

import cursorModel from "./cursor.glb?url";

type GLTFResult = GLTF & {
  nodes: { Cube: THREE.Mesh };
};

// lamina's Depth layers get an `origin` accessor defined at runtime (see
// lamina's Abstract base class), but the published types don't declare it.
type DepthLayer = { origin: THREE.Vector3 };

export const App = () => (
  <Canvas
    orthographic
    dpr={[1, 2]}
    camera={{ position: [0, 0, 10], zoom: 200 }}
  >
    <group rotation={[Math.PI / 5, -Math.PI / 5, Math.PI / 2]}>
      <Bounds fit clip observe margin={1.25}>
        <Cursor scale={[0.5, 1, 0.5]} />
      </Bounds>
      <gridHelper
        args={[10, 40, "#101010", "#050505"]}
        position={[-0.25, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
      />
    </group>
  </Canvas>
);

function Cursor(props: ThreeElements["mesh"]) {
  const ref = useRef<ComponentRef<typeof LayerMaterial>>(null!);
  const { nodes } = useGLTF(cursorModel) as unknown as GLTFResult;
  const { gradient } = useControls({
    gradient: { value: 0.7, min: 0, max: 1 },
  });

  // Animate gradient
  useFrame((state) => {
    const sin = Math.sin(state.clock.elapsedTime / 2);
    const cos = Math.cos(state.clock.elapsedTime / 2);
    const layers = ref.current.layers as unknown as DepthLayer[];
    layers[0].origin.set(cos / 2, 0, 0);
    layers[1].origin.set(cos, sin, cos);
    layers[2].origin.set(sin, cos, sin);
    layers[3].origin.set(cos, sin, cos);
  });

  return (
    <mesh {...props} geometry={nodes.Cube.geometry}>
      <LayerMaterial ref={ref} toneMapped={false}>
        <Depth
          colorA="#ff0080"
          colorB="black"
          alpha={1}
          mode="normal"
          near={0.5 * gradient}
          far={0.5}
          origin={[0, 0, 0]}
        />
        <Depth
          colorA="blue"
          colorB="#f7b955"
          alpha={1}
          mode="add"
          near={2 * gradient}
          far={2}
          origin={[0, 1, 1]}
        />
        <Depth
          colorA="green"
          colorB="#f7b955"
          alpha={1}
          mode="add"
          near={3 * gradient}
          far={3}
          origin={[0, 1, -1]}
        />
        <Depth
          colorA="white"
          colorB="red"
          alpha={1}
          mode="overlay"
          near={1.5 * gradient}
          far={1.5}
          origin={[1, -1, -1]}
        />
        <Fresnel
          mode="add"
          color="white"
          intensity={0.5}
          power={1.5}
          bias={0.05}
        />
      </LayerMaterial>
      <Edges color="white" />
    </mesh>
  );
}
