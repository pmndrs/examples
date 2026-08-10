import * as THREE from "three";
import { type GLTF } from "three-stdlib";
import { useRef } from "react";
import { useFrame, type ThreeElements } from "@react-three/fiber";
import { useGLTF, PivotControls, Environment } from "@react-three/drei";

import shoeModel from "./shoe-draco.glb?url";

export default function App(props: ThreeElements["group"]) {
  return (
    <group {...props}>
      <ambientLight intensity={0.2 * Math.PI} />
      <spotLight
        intensity={0.5 * Math.PI}
        decay={0}
        angle={0.1}
        penumbra={1}
        position={[10, 15, 10]}
      />
      <PivotControls depthTest={false} anchor={[0, 0, 0]}>
        <Shoe />
      </PivotControls>
      <Environment preset="city" />
    </group>
  );
}

type GLTFResult = GLTF & {
  nodes: {
    shoe: THREE.Mesh;
    shoe_1: THREE.Mesh;
    shoe_2: THREE.Mesh;
    shoe_3: THREE.Mesh;
    shoe_4: THREE.Mesh;
    shoe_5: THREE.Mesh;
    shoe_6: THREE.Mesh;
    shoe_7: THREE.Mesh;
  };
  materials: {
    laces: THREE.MeshStandardMaterial;
    mesh: THREE.MeshStandardMaterial;
    caps: THREE.MeshStandardMaterial;
    inner: THREE.MeshStandardMaterial;
    sole: THREE.MeshStandardMaterial;
    stripes: THREE.MeshStandardMaterial;
    band: THREE.MeshStandardMaterial;
    patch: THREE.MeshStandardMaterial;
  };
};

function Shoe() {
  const ref = useRef<THREE.Group>(null!);
  const { nodes, materials } = useGLTF(shoeModel) as unknown as GLTFResult;
  useFrame((state) => {
    const t = state.clock.getElapsedTime() * 2;
    ref.current.rotation.set(
      Math.cos(t / 4) / 8,
      Math.sin(t / 4) / 8,
      -0.2 - (1 + Math.sin(t / 1.5)) / 20,
    );
    ref.current.position.y = (1 + Math.sin(t / 4)) / 10;
  });
  return (
    <group ref={ref}>
      <mesh
        receiveShadow
        castShadow
        geometry={nodes.shoe.geometry}
        material={materials.laces}
        material-color="white"
      />
      <mesh
        receiveShadow
        castShadow
        geometry={nodes.shoe_1.geometry}
        material={materials.mesh}
        material-color="skyblue"
      />
      <mesh
        receiveShadow
        castShadow
        geometry={nodes.shoe_2.geometry}
        material={materials.caps}
        material-color="skyblue"
      />
      <mesh
        receiveShadow
        castShadow
        geometry={nodes.shoe_3.geometry}
        material={materials.inner}
        material-color="orange"
      />
      <mesh
        receiveShadow
        castShadow
        geometry={nodes.shoe_4.geometry}
        material={materials.sole}
        material-color="white"
      />
      <mesh
        receiveShadow
        castShadow
        geometry={nodes.shoe_5.geometry}
        material={materials.stripes}
        material-color="lightblue"
      />
      <mesh
        receiveShadow
        castShadow
        geometry={nodes.shoe_6.geometry}
        material={materials.band}
        material-color="lightblue"
      />
      <mesh
        receiveShadow
        castShadow
        geometry={nodes.shoe_7.geometry}
        material={materials.patch}
        material-color="orange"
      />
    </group>
  );
}
