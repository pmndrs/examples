import { type ComponentProps } from "react";
import * as THREE from "three";
import { type GLTF } from "three-stdlib";
import { Canvas, type ThreeElements } from "@react-three/fiber";
import {
  useGLTF,
  PresentationControls as PresentationControlsImpl,
  Environment,
  ContactShadows,
  Html,
} from "@react-three/drei";

import watchModel from "./watch-v1.glb?url";

type GLTFResult = GLTF & {
  nodes: {
    Object005_glass_0: THREE.Mesh;
    Object006_watch_0: THREE.Mesh;
  };
  materials: {
    glass: THREE.MeshStandardMaterial;
    watch: THREE.MeshStandardMaterial;
  };
};

// The installed @react-three/drei types dropped the legacy react-spring
// `config` prop and the object form of `snap` that this example still
// passes; widen the prop type locally instead of changing the values.
type PresentationControlsProps = Omit<
  ComponentProps<typeof PresentationControlsImpl>,
  "snap"
> & {
  config?: { mass?: number; tension?: number };
  snap?: boolean | number | { mass?: number; tension?: number };
};
const PresentationControls = PresentationControlsImpl as unknown as (
  props: PresentationControlsProps,
) => ReturnType<typeof PresentationControlsImpl>;

export default function App() {
  return (
    <Canvas shadows camera={{ position: [0, 0, 10], fov: 25 }}>
      <ambientLight intensity={0.5 * Math.PI} />
      <spotLight
        position={[10, 10, 10]}
        intensity={Math.PI}
        decay={0}
        angle={0.15}
        penumbra={1}
        shadow-mapSize={2048}
        castShadow
      />
      <PresentationControls
        global
        config={{ mass: 2, tension: 500 }}
        snap={{ mass: 4, tension: 1500 }}
        rotation={[0, 0.3, 0]}
        polar={[-Math.PI / 3, Math.PI / 3]}
        azimuth={[-Math.PI / 1.4, Math.PI / 2]}
      >
        <Watch
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.25, 0]}
          scale={0.003}
        />
      </PresentationControls>
      <ContactShadows
        position={[0, -1.4, 0]}
        opacity={0.75}
        scale={10}
        blur={3}
        far={4}
      />
      <Environment preset="city" />
    </Canvas>
  );
}

function Watch(props: ThreeElements["group"]) {
  const { nodes, materials } = useGLTF(watchModel) as unknown as GLTFResult;
  return (
    <group {...props} dispose={null}>
      <mesh
        geometry={nodes.Object005_glass_0.geometry}
        material={materials.glass}
      >
        <Html
          scale={100}
          rotation={[Math.PI / 2, 0, 0]}
          position={[180, -350, 50]}
          transform
          occlude
        >
          <div className="annotation">
            6.550 $ <span style={{ fontSize: "1.5em" }}>🥲</span>
          </div>
        </Html>
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Object006_watch_0.geometry}
        material={materials.watch}
      />
    </group>
  );
}
