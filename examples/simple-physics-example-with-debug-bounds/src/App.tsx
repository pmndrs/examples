import React, { useState, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Physics,
  Debug,
  usePlane,
  useCompoundBody,
  type PlaneProps,
  type BodyProps,
} from "@react-three/cannon";

function Plane(props: PlaneProps) {
  const [ref] = usePlane(() => ({ type: "Static", ...props }));
  return (
    <mesh receiveShadow ref={ref}>
      <planeGeometry args={[8, 8]} />
      <meshStandardMaterial color="#ffb385" />
    </mesh>
  );
}

function CompoundBody(props: BodyProps) {
  const [ref] = useCompoundBody(() => ({
    mass: 12,
    ...props,
    shapes: [
      {
        type: "Box",
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        args: [1, 1, 1],
      },
      {
        type: "Sphere",
        position: [1, 0, 0],
        rotation: [0, 0, 0],
        args: [0.65],
      },
    ],
  }));
  return (
    <group ref={ref}>
      <mesh receiveShadow castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshNormalMaterial />
      </mesh>
      <mesh receiveShadow castShadow position={[1, 0, 0]}>
        <sphereGeometry args={[0.65, 16, 16]} />
        <meshNormalMaterial />
      </mesh>
    </group>
  );
}

// Mounts its children after `seconds` of *scene* time. A wall-clock
// setTimeout lands whenever the machine gets there; counting through
// useFrame keeps the two-second entrance exact at any refresh rate.
function MountAfter({
  seconds,
  children,
}: {
  seconds: number;
  children: React.ReactNode;
}) {
  const [flag, set] = useState(false);
  const elapsed = useRef(0);
  useFrame((_, delta) => {
    if (!flag && (elapsed.current += delta) >= seconds) set(true);
  });
  return flag ? <>{children}</> : null;
}

export default function () {
  return (
    <Canvas
      dpr={[1, 2]}
      shadows
      gl={{ alpha: false }}
      camera={{ position: [-2, 1, 7], fov: 50 }}
    >
      <color attach="background" args={["#f6d186"]} />
      <hemisphereLight intensity={Math.PI} />
      <spotLight
        position={[5, 5, 5]}
        angle={0.75}
        decay={0}
        penumbra={1}
        intensity={Math.PI}
        castShadow
        shadow-mapSize-width={1028}
        shadow-mapSize-height={1028}
      />
      <Physics iterations={6}>
        <Debug scale={1.1} color="black">
          <Plane rotation={[-Math.PI / 2, 0, 0]} />
          <CompoundBody position={[1.5, 5, 0.5]} rotation={[1.25, 0, 0]} />
          <CompoundBody position={[2.5, 3, 0.25]} rotation={[1.25, -1.25, 0]} />
          {/* A third body makes its entrance after 2 seconds */}
          <MountAfter seconds={2}>
            <CompoundBody
              position={[2.5, 4, 0.25]}
              rotation={[1.25, -1.25, 0]}
            />
          </MountAfter>
        </Debug>
      </Physics>
    </Canvas>
  );
}
