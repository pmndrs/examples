import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  CuboidCollider,
  Physics,
  RigidBody,
  type RapierRigidBody,
} from "@react-three/rapier";
import { useRef } from "react";

export const App = () => (
  <Canvas camera={{ position: [0, 5, 12], fov: 50 }}>
    <ambientLight intensity={0.5 * Math.PI} />
    <pointLight position={[10, 10, 5]} intensity={Math.PI} decay={0} />
    <Physics gravity={[0, -30, 0]}>
      <Ball />
      <Paddle />
      <Enemy color="orange" position={[2.75, 1.5, 0]} />
      <Enemy color="hotpink" position={[-2.75, 3.5, 0]} />
    </Physics>
  </Canvas>
);

function Ball() {
  const ref = useRef<RapierRigidBody>(null!);
  const { viewport } = useThree();
  const onCollisionEnter = () => (
    ref.current.setTranslation({ x: 0, y: 0, z: 0 }, true),
    ref.current.setLinvel({ x: 0, y: 10, z: 0 }, true)
  );
  return (
    <>
      <RigidBody ref={ref} colliders="ball" mass={1}>
        <mesh>
          <sphereGeometry args={[0.75, 32, 32]} />
          <meshStandardMaterial />
        </mesh>
      </RigidBody>
      <RigidBody
        type="fixed"
        colliders={false}
        position={[0, -viewport.height, 0]}
        restitution={2.1}
        onCollisionEnter={onCollisionEnter}
      >
        <CuboidCollider args={[30, 2, 30]} />
      </RigidBody>
    </>
  );
}

const Enemy = ({
  position,
  color,
}: {
  position: [number, number, number];
  color: string;
}) => (
  <RigidBody
    colliders="cuboid"
    type="fixed"
    position={position}
    restitution={2.1}
  >
    <mesh>
      <boxGeometry args={[2.5, 1, 1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  </RigidBody>
);

function Paddle({
  euler = new THREE.Euler(),
  quaternion = new THREE.Quaternion(),
}: {
  euler?: THREE.Euler;
  quaternion?: THREE.Quaternion;
}) {
  const ref = useRef<RapierRigidBody>(null!);
  useFrame(({ pointer, viewport }) => {
    ref.current.setTranslation(
      {
        x: (pointer.x * viewport.width) / 2,
        y: -viewport.height / 3,
        z: 0,
      },
      true,
    );
    ref.current.setRotation(
      quaternion.setFromEuler(euler.set(0, 0, (pointer.x * Math.PI) / 10)),
      true,
    );
  });
  return (
    <RigidBody ref={ref} colliders="cuboid" type="fixed" restitution={2.1}>
      <mesh>
        <boxGeometry args={[4, 1, 1]} />
        <meshStandardMaterial color="lightblue" />
      </mesh>
    </RigidBody>
  );
}
