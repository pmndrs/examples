import { Backdrop, Float, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { ColorDepth, EffectComposer } from "@react-three/postprocessing";
import { useControls } from "leva";
import { useRef } from "react";
import * as THREE from "three";

type LightData = {
  color: string;
  radius: number;
  height: number;
  speed: number;
  offset: number;
};

const LIGHTS: LightData[] = [
  { color: "#ff3d7f", radius: 3.5, height: 2.5, speed: 0.35, offset: 0 },
  { color: "#3dd9ff", radius: 4, height: 1.5, speed: -0.25, offset: 2.1 },
  { color: "#ffb23d", radius: 3, height: 3.5, speed: 0.2, offset: 4.2 },
];

type BallData = {
  position: [number, number, number];
  radius: number;
};

const BALLS: BallData[] = [
  { position: [0, 1.4, 0], radius: 1.2 },
  { position: [-2.4, 0.8, 0.8], radius: 0.7 },
  { position: [2.3, 0.9, 0.6], radius: 0.8 },
  { position: [1.1, 0.45, 2], radius: 0.45 },
  { position: [-1, 0.35, 2.2], radius: 0.35 },
];

function OrbitingLight({ color, radius, height, speed, offset }: LightData) {
  const ref = useRef<THREE.PointLight>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed + offset;
    ref.current.position.set(
      Math.cos(t) * radius,
      height,
      Math.sin(t) * radius + 1,
    );
  });

  return <pointLight ref={ref} color={color} intensity={25} />;
}

export default function App() {
  const { bits } = useControls("Postprocessing - ColorDepth", {
    bits: { value: 9, min: 1, max: 24, step: 1 },
  });

  return (
    <Canvas camera={{ position: [0, 3, 8], fov: 45 }}>
      <color attach="background" args={["#f2f2f2"]} />
      <ambientLight intensity={0.1 * Math.PI} />
      {LIGHTS.map((light, i) => (
        <OrbitingLight key={i} {...light} />
      ))}

      <Backdrop
        receiveShadow={false}
        floor={2}
        segments={40}
        scale={[24, 8, 8]}
        position={[0, 0, -3]}
      >
        <meshStandardMaterial color="#f2f2f2" roughness={1} />
      </Backdrop>

      {BALLS.map(({ position, radius }, i) => (
        <Float key={i} speed={1.5} floatIntensity={0.4} rotationIntensity={0}>
          <mesh position={position}>
            <sphereGeometry args={[radius, 64, 64]} />
            <meshStandardMaterial color="#ffffff" roughness={0.4} />
          </mesh>
        </Float>
      ))}

      <EffectComposer>
        <ColorDepth bits={bits} />
      </EffectComposer>

      <OrbitControls
        target={[0, 1, 0]}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.1}
        enablePan={false}
        enableZoom={false}
      />
    </Canvas>
  );
}
