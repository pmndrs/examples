import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useRef } from "react";
import * as THREE from "three";

const COUNT = 9;
const SPACING = 1.2;
const EXTENT = ((COUNT - 1) * SPACING) / 2;
const NODES = COUNT ** 3;
const RODS = COUNT * COUNT * 3;
const THICKNESS = 0.02;

const offset = (i: number) => i * SPACING - EXTENT;

export function Lattice() {
  const group = useRef<THREE.Group>(null!);
  const nodes = useRef<THREE.InstancedMesh>(null!);
  const rods = useRef<THREE.InstancedMesh>(null!);

  useLayoutEffect(() => {
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();

    let n = 0;
    for (let x = 0; x < COUNT; x++) {
      for (let y = 0; y < COUNT; y++) {
        for (let z = 0; z < COUNT; z++) {
          dummy.position.set(offset(x), offset(y), offset(z));
          dummy.updateMatrix();
          nodes.current.setMatrixAt(n, dummy.matrix);
          // Hue sweeps along one diagonal, lightness along another.
          color.setHSL(
            0.55 + ((x + y) / (2 * COUNT)) * 0.4,
            0.85,
            0.45 + (z / COUNT) * 0.2,
          );
          nodes.current.setColorAt(n++, color);
        }
      }
    }

    // One rod per row along each axis, spanning the whole lattice.
    let r = 0;
    const length = EXTENT * 2;
    for (let a = 0; a < COUNT; a++) {
      for (let b = 0; b < COUNT; b++) {
        dummy.scale.set(length, THICKNESS, THICKNESS);
        dummy.position.set(0, offset(a), offset(b));
        dummy.updateMatrix();
        rods.current.setMatrixAt(r++, dummy.matrix);

        dummy.scale.set(THICKNESS, length, THICKNESS);
        dummy.position.set(offset(a), 0, offset(b));
        dummy.updateMatrix();
        rods.current.setMatrixAt(r++, dummy.matrix);

        dummy.scale.set(THICKNESS, THICKNESS, length);
        dummy.position.set(offset(a), offset(b), 0);
        dummy.updateMatrix();
        rods.current.setMatrixAt(r++, dummy.matrix);
      }
    }

    nodes.current.instanceMatrix.needsUpdate = true;
    nodes.current.instanceColor!.needsUpdate = true;
    rods.current.instanceMatrix.needsUpdate = true;
  }, []);

  useFrame((_, delta) => {
    group.current.rotation.y += delta * 0.08;
    group.current.rotation.x += delta * 0.03;
  });

  return (
    <group ref={group} rotation={[0.2, 0.4, 0]}>
      <instancedMesh ref={nodes} args={[undefined, undefined, NODES]}>
        <sphereGeometry args={[0.09, 24, 16]} />
        <meshStandardMaterial roughness={0.2} metalness={0.1} />
      </instancedMesh>
      <instancedMesh ref={rods} args={[undefined, undefined, RODS]}>
        <boxGeometry />
        <meshStandardMaterial color="#c9d1dc" roughness={0.25} metalness={1} />
      </instancedMesh>
    </group>
  );
}
