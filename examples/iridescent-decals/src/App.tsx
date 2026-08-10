import * as THREE from "three";
import { type GLTF } from "three-stdlib";
import { type ThreeElements } from "@react-three/fiber";
import { Canvas } from "@react-three/fiber";
import {
  useGLTF,
  useTexture,
  Decal,
  Environment,
  OrbitControls,
  RandomizedLight,
  AccumulativeShadows,
  type DecalProps,
} from "@react-three/drei";

import sticker1 from "./Sticjer_1024x1024@2x.png";
import sticker2 from "./Twemoji_1f600.svg.png";
import sticker3 from "./D64aIWkXoAAFI08.png";
import sticker4 from "./three.png";

// From the poimandres market (https://market.pmnd.rs/), vendored locally since the original CDN is offline.
import bunnyModel from "./assets/bunny.gltf?url";

type GLTFResult = GLTF & {
  nodes: { bunny: THREE.Mesh };
};

export const App = () => (
  <Canvas shadows camera={{ position: [2, 2, 10], fov: 20 }}>
    <ambientLight intensity={Math.PI} />
    <spotLight
      position={[10, 10, 10]}
      intensity={Math.PI}
      decay={0}
      angle={0.15}
      penumbra={1}
    />
    <group position={[0.25, -1, 0]}>
      <Bun />
      <AccumulativeShadows
        temporal
        frames={100}
        scale={12}
        alphaTest={0.85}
        position={[0, 0.04, 0]}
      >
        <RandomizedLight
          amount={8}
          radius={10}
          ambient={0.5}
          position={[2.5, 5, -5]}
          bias={0.001}
        />
      </AccumulativeShadows>
    </group>
    <Environment preset="city" background blur={0.7} />
    <OrbitControls makeDefault />
  </Canvas>
);

function Bun(props: ThreeElements["mesh"]) {
  const { nodes } = useGLTF(bunnyModel) as unknown as GLTFResult;
  return (
    <mesh
      castShadow
      receiveShadow
      geometry={nodes.bunny.geometry}
      {...props}
      dispose={null}
    >
      <meshStandardMaterial color="black" />
      <Sticker
        url={sticker1}
        position={[-0.1, 1.3, 0.55]}
        rotation={Math.PI * 1.2}
        scale={0.45}
      />
      <Sticker
        url={sticker2}
        position={[0.4, 1, 0.55]}
        rotation={Math.PI * 0.9}
        scale={0.3}
      />
      <Sticker
        url={sticker3}
        position={[0, 0.7, 0.85]}
        rotation={Math.PI * 1.2}
        scale={0.35}
      />
      <Sticker
        url={sticker4}
        position={[-0.54, 1.1, 0.57]}
        rotation={-1.2}
        scale={0.2}
      />
    </mesh>
  );
}

function Sticker({ url, ...props }: DecalProps & { url: string }) {
  const emoji = useTexture(url);
  return (
    <Decal /*debug*/ {...props}>
      <meshPhysicalMaterial
        transparent
        polygonOffset
        polygonOffsetFactor={-10}
        map={emoji}
        map-flipY={false}
        map-anisotropy={16}
        iridescence={1}
        iridescenceIOR={1}
        iridescenceThicknessRange={[0, 1400]}
        roughness={1}
        clearcoat={0.5}
        metalness={0.75}
        toneMapped={false}
      />
    </Decal>
  );
}
