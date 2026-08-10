import * as THREE from "three";
import { useRef, useState, type ReactNode } from "react";
import { useCursor, useGLTF } from "@react-three/drei";
import { type ThreeElements } from "@react-three/fiber";
import { type GLTF } from "three-stdlib";

import model from "./draco.glb?url";

const bottleMaterial = new THREE.MeshPhysicalMaterial({
  color: "#efefef",
  transmission: 1,
  roughness: 0.35,
  thickness: 500,
  envMapIntensity: 4,
});

const capMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color("white"),
});

type GLTFResult = GLTF & {
  nodes: {
    Untitled018: THREE.Mesh;
    Untitled018_1: THREE.Mesh;
    Untitled078: THREE.Mesh;
    Untitled078_1: THREE.Mesh;
    Untitled064: THREE.Mesh;
    Untitled064_1: THREE.Mesh;
    Untitled052: THREE.Mesh;
    Untitled052_1: THREE.Mesh;
    Untitled072: THREE.Mesh;
    Untitled072_1: THREE.Mesh;
    Untitled007: THREE.Mesh;
    Untitled007_1: THREE.Mesh;
  };
};

type NodeName = keyof GLTFResult["nodes"];

function Bottle({
  glas,
  cap,
  children,
  ...props
}: {
  glas: NodeName;
  cap: NodeName;
  children?: ReactNode;
} & ThreeElements["group"]) {
  const ref = useRef<THREE.Group>(null!);
  const { nodes } = useGLTF(model) as unknown as GLTFResult;
  const [hovered, set] = useState(false);
  useCursor(hovered);
  return (
    <group
      rotation={[Math.PI / 2, 0, 3]}
      {...props}
      onPointerOver={(e) => set(true)}
      onPointerOut={() => set(false)}
    >
      <group ref={ref}>
        <mesh
          castShadow
          geometry={nodes[glas].geometry}
          material={bottleMaterial}
        />
        <mesh
          castShadow
          geometry={nodes[cap].geometry}
          material={capMaterial}
        />
      </group>
    </group>
  );
}

export default function Bottles(props: ThreeElements["group"]) {
  return (
    <group {...props} dispose={null} scale={[0.1, 0.1, 0.1]}>
      <Bottle position={[140, 0, 0]} glas="Untitled018" cap="Untitled018_1" />
      <Bottle position={[80, 0, 0]} glas="Untitled078" cap="Untitled078_1" />
      <Bottle position={[-2, 0, 0]} glas="Untitled064" cap="Untitled064_1" />
      <Bottle position={[-90, 0, 0]} glas="Untitled052" cap="Untitled052_1" />
      <Bottle position={[-140, 0, 0]} glas="Untitled072" cap="Untitled072_1" />
      <Bottle position={[-180, 0, 0]} glas="Untitled007" cap="Untitled007_1" />
    </group>
  );
}
