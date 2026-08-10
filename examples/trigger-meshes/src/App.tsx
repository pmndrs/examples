import {
  Physics,
  useBox,
  usePlane,
  useSphere,
  type CollideEvent,
  type PlaneProps,
  type Triplet,
} from "@react-three/cannon";
import { Canvas, type CameraProps } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useState } from "react";

function BoxTrigger({
  onCollide,
  size,
  position,
}: {
  onCollide: (e: CollideEvent) => void;
  size: Triplet;
  position: Triplet;
}) {
  const [ref] = useBox(() => ({
    isTrigger: true,
    args: size,
    position,
    onCollide,
  }));
  return (
    <mesh ref={ref} position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial wireframe color="green" />
    </mesh>
  );
}

function Ball() {
  const [ref] = useSphere(() => ({
    mass: 1,
    position: [0, 20, 0],
    args: [1],
  }));
  return (
    <mesh castShadow receiveShadow ref={ref}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshLambertMaterial color="white" />
    </mesh>
  );
}

function Plane(props: PlaneProps) {
  const [ref] = usePlane(() => ({ type: "Static", ...props }));
  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <shadowMaterial color="#171717" />
    </mesh>
  );
}

export default () => {
  const [bg, setbg] = useState("#171720");
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={
        {
          position: [-10, 15, 5],
          // `material` is not part of CameraProps; kept as-is (unknown, then
          // narrowed) to match the upstream source verbatim.
          material: { restitution: 10 },
          fov: 50,
        } as unknown as CameraProps
      }
    >
      <OrbitControls />
      <fog attach="fog" args={[bg, 10, 50]} />
      <color attach="background" args={[bg]} />
      <ambientLight intensity={0.1 * Math.PI} />
      <spotLight
        position={[10, 10, 10]}
        angle={0.5}
        intensity={Math.PI}
        decay={0}
        castShadow
        penumbra={1}
      />
      <Physics>
        <BoxTrigger
          onCollide={(e) => {
            console.log("Collision event on BoxTrigger", e);
            setbg("#fe4365");
          }}
          position={[0, 5, 0]}
          size={[4, 1, 4]}
        />
        <Ball />
        <Plane rotation={[-Math.PI / 2, 0, 0]} />
      </Physics>
    </Canvas>
  );
};
