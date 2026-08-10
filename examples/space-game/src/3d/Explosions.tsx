import * as THREE from "three";
import React, { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import useStore, { audio, playAudio } from "../store";

function make(color: string, speed: number) {
  return {
    ref: React.createRef<THREE.InstancedMesh>(),
    color,
    data: new Array(20)
      .fill(undefined)
      .map(() => [
        new THREE.Vector3(),
        new THREE.Vector3(
          -1 + Math.random() * 2,
          -1 + Math.random() * 2,
          -1 + Math.random() * 2,
        )
          .normalize()
          .multiplyScalar(speed * 0.75),
      ]),
  };
}

export default function Explosions() {
  const explosions = useStore((state) => state.explosions);
  return explosions.map(({ guid, offset, scale }) => (
    <Explosion key={guid} position={offset} scale={scale * 0.75} />
  ));
}

function Explosion({
  position,
  scale,
}: {
  position: THREE.Vector3;
  scale: number;
}) {
  const group = useRef<THREE.Group>(null!);
  const { dummy } = useStore((state) => state.mutation);
  const particles = useMemo(
    () => [make("white", 0.8), make("orange", 0.6)],
    [],
  );

  useEffect(() => void playAudio(new Audio(audio.mp3.explosion), 0.5), []);

  useFrame(() => {
    particles.forEach(({ data }, type) => {
      const mesh = group.current.children[type] as THREE.InstancedMesh<
        THREE.BufferGeometry,
        THREE.MeshBasicMaterial
      >;
      data.forEach(([vec, normal], i) => {
        vec.add(normal);
        dummy.position.copy(vec);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      });
      mesh.material.opacity -= 0.025;
      mesh.instanceMatrix.needsUpdate = true;
    });
  });

  return (
    <group ref={group} position={position} scale={[scale, scale, scale]}>
      {particles.map(({ color, data }, index) => (
        <instancedMesh
          key={index}
          args={[null!, null!, data.length]}
          frustumCulled={false}
        >
          <dodecahedronGeometry args={[10, 0]} />
          <meshBasicMaterial color={color} transparent opacity={1} fog={true} />
        </instancedMesh>
      ))}
    </group>
  );
}
