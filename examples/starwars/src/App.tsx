import * as THREE from "three";
import { useLayoutEffect } from "react";
import { Canvas, useFrame, type ThreeElements } from "@react-three/fiber";
import { useGLTF, Float, Preload } from "@react-three/drei";
import { type GLTF } from "three-stdlib";
import { Effects } from "./Effects";

import hallModel from "./hall-transformed.glb?url";
import probeModel from "./probe-transformed.glb?url";
import darthModel from "./darth-transformed.glb?url";

type ProbeGLTF = GLTF & {
  materials: {
    Material_26: THREE.MeshStandardMaterial;
    light: THREE.MeshStandardMaterial;
  };
};

export default function App() {
  return (
    <Canvas
      gl={{ antialias: false, stencil: false }}
      camera={{ position: [5, 0, 0], fov: 80 }}
    >
      <ambientLight intensity={0.6 * Math.PI} />
      <spotLight
        angle={0.12}
        penumbra={0.1}
        position={[10, 0, -10]}
        intensity={40 * Math.PI}
        decay={0}
        onUpdate={(self) => {
          self.target.position.set(-10, 0, 0);
          self.target.updateMatrixWorld();
        }}
      />
      <Hall position={[0, 0.98, 0]} />
      <Darth position={[-3, -0.39, 0.2]} rotation={[0, 2, 0]} scale={0.006} />
      <Float>
        <Probe
          position={[-1.75, 0.25, -0.85]}
          scale={0.025}
          rotation={[0, Math.PI / 2, 0]}
        />
      </Float>
      <Effects />
      <Rig from={-Math.PI / 2} to={Math.PI / 2.66} />
      <Preload all />
    </Canvas>
  );
}

function Rig(_props: { from: number; to: number }) {
  return useFrame((state) => {
    state.camera.position.lerp(
      { x: 0, y: -state.pointer.y / 4, z: state.pointer.x / 2 },
      0.1,
    );
    state.camera.lookAt(-1, 0, 0);
  });
}

function Hall({ ...props }: Omit<ThreeElements["primitive"], "object">) {
  const { scene } = useGLTF(hallModel);
  return <primitive object={scene} {...props} />;
}

function Probe({ ...props }: Omit<ThreeElements["primitive"], "object">) {
  const { scene, materials } = useGLTF(probeModel) as unknown as ProbeGLTF;
  useLayoutEffect(() => {
    Object.values(materials).forEach((material) => (material.roughness = 0));
    Object.assign(materials.light, {
      color: new THREE.Color("#ff2060"),
      emissive: new THREE.Color(1, 0, 0),
      emissiveIntensity: 2,
      toneMapped: false,
    });
  }, []);
  return <primitive object={scene} {...props} />;
}

function Darth({ ...props }: Omit<ThreeElements["primitive"], "object">) {
  const { scene, materials } = useGLTF(darthModel);
  useLayoutEffect(() => {
    Object.assign(materials.Sabel_svart, {
      color: new THREE.Color("#ff2060"),
      emissive: new THREE.Color(1, 0, 0),
      emissiveIntensity: 2,
      toneMapped: false,
    });
  }, []);
  return <primitive object={scene} {...props} />;
}
