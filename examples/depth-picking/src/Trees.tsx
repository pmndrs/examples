import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const GROW_TIME = 0.6;
const UP = new THREE.Vector3(0, 1, 0);
const TRUNK = "#6b4a2f";

export type TreeKind = "pine" | "round";

export type TreeData = {
  id: number;
  kind: TreeKind;
  position: THREE.Vector3;
  normal: THREE.Vector3;
  scale: number;
  rotation: number;
  color: string;
};

function easeOutBack(t: number) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
}

function Pine({ color }: { color: string }) {
  return (
    <>
      <mesh position-y={0.4} castShadow>
        <cylinderGeometry args={[0.08, 0.12, 0.8, 5]} />
        <meshStandardMaterial color={TRUNK} flatShading />
      </mesh>
      <mesh position-y={1.1} castShadow>
        <coneGeometry args={[0.6, 1.1, 6]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>
      <mesh position-y={1.65} castShadow>
        <coneGeometry args={[0.42, 0.85, 6]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>
    </>
  );
}

function Round({ color }: { color: string }) {
  return (
    <>
      <mesh position-y={0.45} castShadow>
        <cylinderGeometry args={[0.09, 0.13, 0.9, 5]} />
        <meshStandardMaterial color={TRUNK} flatShading />
      </mesh>
      <mesh position-y={1.25} castShadow>
        <icosahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>
      <mesh position={[0.3, 1.05, 0.15]} castShadow>
        <icosahedronGeometry args={[0.38, 0]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>
    </>
  );
}

function Tree({ kind, position, normal, scale, rotation, color }: TreeData) {
  const ref = useRef<THREE.Group>(null!);
  const age = useRef(0);
  const quaternion = useMemo(
    () => new THREE.Quaternion().setFromUnitVectors(UP, normal),
    [normal],
  );

  useFrame((_, delta) => {
    if (age.current >= GROW_TIME) return;
    age.current = Math.min(age.current + delta, GROW_TIME);
    ref.current.scale.setScalar(scale * easeOutBack(age.current / GROW_TIME));
  });

  return (
    <group position={position} quaternion={quaternion}>
      <group ref={ref} rotation-y={rotation} scale={0}>
        {kind === "pine" ? <Pine color={color} /> : <Round color={color} />}
      </group>
    </group>
  );
}

export function Trees({ trees }: { trees: TreeData[] }) {
  return (
    <>
      {trees.map((tree) => (
        <Tree key={tree.id} {...tree} />
      ))}
    </>
  );
}
