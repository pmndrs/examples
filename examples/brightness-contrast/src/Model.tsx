import { useRef } from "react";
import * as THREE from "three";
import { type GLTF } from "three-stdlib";
import { type ThreeElements } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";

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
        material={nodes.Suzanne.material}
        position={[0, 0.19, -0.04]}
      />
    </group>
  );
}

useGLTF.preload(suzanneModel);
