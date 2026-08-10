import * as THREE from "three";
import React, { useRef } from "react";
import { useLoader, useFrame } from "@react-three/fiber";
import {
  GLTFLoader,
  type GLTF,
} from "three/examples/jsm/loaders/GLTFLoader.js";
import useStore, { type Data } from "../store";

import spacedroneModel from "./spacedrone.gltf?url";

type GLTFResult = GLTF & {
  nodes: {
    Sphere_DroneGlowmat_0: THREE.Mesh;
    Sphere_Body_0: THREE.Mesh;
  };
  materials: {
    DroneGlowmat: THREE.MeshStandardMaterial;
  };
};

export default function Enemies() {
  const enemies = useStore((state) => state.enemies);
  return enemies.map((data, i) => <Drone key={i} data={data} />);
}

const box = new THREE.Box3();
box.setFromCenterAndSize(
  new THREE.Vector3(0, 0, 1),
  new THREE.Vector3(3, 3, 3),
);
const glowMaterial = new THREE.MeshBasicMaterial({
  color: new THREE.Color("lightblue"),
});
const bodyMaterial = new THREE.MeshPhongMaterial({
  color: new THREE.Color("black"),
});

const Drone = React.memo(({ data }: { data: Data }) => {
  const { clock } = useStore((state) => state.mutation);
  const { nodes, materials } = useLoader(
    GLTFLoader,
    spacedroneModel,
  ) as unknown as GLTFResult;
  const ref = useRef<THREE.Group>(null!);

  useFrame(() => {
    const r = Math.cos((clock.getElapsedTime() / 2) * data.speed) * Math.PI;
    ref.current.position.copy(data.offset);
    ref.current.rotation.set(r, r, r);
  });

  return (
    <group ref={ref} scale={[5, 5, 5]}>
      <mesh
        position={[0, 0, 50]}
        rotation={[Math.PI / 2, 0, 0]}
        material={glowMaterial}
      >
        <cylinderGeometry args={[0.25, 0.25, 100, 4]} />
      </mesh>
      <mesh
        name="Sphere_DroneGlowmat_0"
        geometry={nodes.Sphere_DroneGlowmat_0.geometry}
        material={materials.DroneGlowmat}
      />
      <mesh
        name="Sphere_Body_0"
        geometry={nodes.Sphere_Body_0.geometry}
        material={bodyMaterial}
      />
    </group>
  );
});
