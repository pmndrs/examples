import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, type ThreeElements } from "@react-three/fiber";
import { Extrude, OrbitControls } from "@react-three/drei";
import { useSprings, type SpringValue } from "@react-spring/core";
import { a } from "@react-spring/three";
import { useControls } from "leva";

import Lights from "./Lights";

function Frame({
  rot,
  depth = 0.3,
  ...props
}: {
  rot: SpringValue<number>;
  depth?: number;
} & ThreeElements["group"]) {
  const shape = useMemo(() => {
    const frame = new THREE.Shape();
    frame.moveTo(-8, -3);
    frame.lineTo(8, -3);
    frame.lineTo(8, 3);
    frame.lineTo(-8, 3);

    const hole = new THREE.Path();
    hole.moveTo(-5, -2);
    hole.lineTo(5, -2);
    hole.lineTo(5, 2);
    hole.lineTo(-5, 2);
    frame.holes.push(hole);

    return frame;
  }, []);

  const extrudeSettings = useMemo(
    () => ({ steps: 1, depth, bevelEnabled: false }),
    [depth],
  );

  return (
    <a.group {...props} rotation-z={rot}>
      <Extrude args={[shape, extrudeSettings]} castShadow receiveShadow>
        <meshStandardMaterial
          color="#999"
          roughness={0.7}
          shadowSide={THREE.FrontSide}
        />
      </Extrude>
    </a.group>
  );
}

function Floater({
  isLaunching,
  ...props
}: { isLaunching?: boolean } & ThreeElements["mesh"]) {
  const randomDelay = useMemo(() => Math.random() * 100, []);
  const direction = useMemo(
    () => new THREE.Vector3(Math.random(), Math.random(), Math.random()),
    [],
  );

  const ref = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    ref.current.rotation.x += direction.x / 140;
    ref.current.rotation.y += direction.y / 140;
    ref.current.rotation.z += direction.z / 140;
    ref.current.position.y +=
      Math.sin(randomDelay + clock.getElapsedTime() / 2) / 400;
  });

  return (
    <a.mesh {...props} castShadow receiveShadow ref={ref}>
      <boxGeometry args={[0.5, 1, 0.5]} />
      <meshStandardMaterial color="#333" roughness={0.7} />
    </a.mesh>
  );
}

function Frames() {
  const [springs] = useSprings(40, (i) => ({
    loop: true,
    from: { theta: 0 },
    to: async (next) => {
      for (;;) {
        await next({ theta: -Math.PI / 2 - 0.004 * (i * i) - i * 0.06 });
        await next({ theta: 0 });
      }
    },
    config: {
      mass: 100,
      tension: 400,
      friction: 400,
    },
    delay: 1000 + i * 12 + i,
  }));

  return springs.map((spring, i) => (
    <Frame
      key={i}
      depth={0.5}
      scale={[0.6, 1, 1]}
      position={[0, 0, 3 - i * 0.5]}
      rot={spring.theta}
    />
  ));
}

const floaters: ({ isLaunching?: boolean } & ThreeElements["mesh"])[] = [
  { scale: [0.3, 0.3, 0.3], position: [1.2, -1, -3], rotation: [2, 0.3, 0.5] },
  { scale: [0.3, 0.3, 0.3], position: [-1, 1, -4], rotation: [2, 0.3, 0.5] },
  { scale: [0.6, 0.6, 0.6], position: [0.8, 0, -6], rotation: [0.5, 0.3, 0.5] },
  { position: [-1.5, 0.1, -6], rotation: [-2, 3, 1] },
  { position: [0, 1, -2], rotation: [-2, 3, 1] },
  { position: [0, -1, -4], rotation: [-2, 3, 1] },
  { position: [1, 0, 0], rotation: [1, 4, 1] },
  { position: [-1.2, 0, 1], rotation: [1, 4, 1] },
];

function Floaters() {
  const [launching, setLaunching] = useState<number | false>(false);
  const group = useRef<THREE.Group>(null!);

  useFrame(({ pointer }) => {
    group.current.position.x = THREE.MathUtils.lerp(
      group.current.position.x,
      pointer.x / 10,
      0.06,
    );
    group.current.position.y = THREE.MathUtils.lerp(
      group.current.position.y,
      -pointer.y / 16,
      0.05,
    );
  });

  return (
    <group ref={group}>
      {floaters.map((floater, i) => (
        <Floater
          key={i}
          onClick={() => setLaunching(i)}
          isLaunching={launching === i}
          {...floater}
        />
      ))}
    </group>
  );
}

export default function Scene() {
  const { orbitControls } = useControls({
    orbitControls: { value: false, label: "Orbit Controls" },
  });

  return (
    <>
      <Lights />
      <Frames />
      <Floaters />
      {orbitControls && <OrbitControls />}
    </>
  );
}
