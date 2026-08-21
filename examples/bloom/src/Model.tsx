import { useGLTF } from "@react-three/drei";
import { type ThreeElements } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { type GLTF } from "three-stdlib";

import suzanneModel from "./suzanne.gltf?url";

type GLTFResult = GLTF & {
  nodes: {
    Suzanne: THREE.Mesh;
  };
};

export default function Model(props: ThreeElements["group"]) {
  const group = useRef<THREE.Group>(null!);
  const { nodes } = useGLTF(suzanneModel) as unknown as GLTFResult;

  return (
    <group ref={group} {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Suzanne.geometry}
        position={[0, 0.19, -0.04]}
      >
        <meshPhysicalMaterial
          clearcoat={1}
          clearcoatRoughness={0.1}
          reflectivity={0.2}
          roughness={0.1}
          color="#929292"
        />
      </mesh>
    </group>
  );
}

useGLTF.preload(suzanneModel);
