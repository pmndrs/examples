import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { ColorAverage, EffectComposer } from "@react-three/postprocessing";
import { useControls } from "leva";
import niceColors from "nice-color-palettes";
import { type ColorAverageEffect } from "postprocessing";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const palette = niceColors[3];

type BallData = {
  position: [number, number, number];
  scale: number;
  color: string;
  speed: number;
  offset: number;
};

function useBalls(count: number): BallData[] {
  return useMemo(
    () =>
      Array.from({ length: count }, () => ({
        position: [
          (Math.random() - 0.5) * 9,
          (Math.random() - 0.5) * 5.5,
          (Math.random() - 0.5) * 6,
        ],
        scale: 0.4 + Math.random() * 0.7,
        color: palette[Math.floor(Math.random() * palette.length)],
        speed: 0.4 + Math.random() * 0.6,
        offset: Math.random() * Math.PI * 2,
      })),
    [count],
  );
}

function Ball({ position, scale, color, speed, offset }: BallData) {
  const ref = useRef<THREE.Mesh>(null!);
  const baseY = position[1];

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    ref.current.position.y = baseY + Math.sin(t * speed + offset) * 0.5;
  });

  return (
    <mesh ref={ref} position={position} scale={scale} castShadow receiveShadow>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color={color} roughness={0.25} metalness={0.4} />
    </mesh>
  );
}

function Balls() {
  const balls = useBalls(45);
  return (
    <>
      {balls.map((ball, i) => (
        <Ball key={i} {...ball} />
      ))}
    </>
  );
}

export default function App() {
  const { opacity } = useControls("Postprocessing - ColorAverage", {
    opacity: { value: 1, min: 0, max: 1, step: 0.01 },
  });
  const effectRef = useRef<ColorAverageEffect>(null);

  useEffect(() => {
    effectRef.current?.blendMode.setOpacity(opacity);
  }, [opacity]);

  return (
    <Canvas shadows camera={{ position: [0, 0, 12], fov: 50 }}>
      <color attach="background" args={["#111318"]} />
      <ambientLight intensity={0.7 * Math.PI} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.2 * Math.PI}
        castShadow
      />
      <pointLight
        position={[-6, -3, 4]}
        intensity={0.3 * 4 * Math.PI}
        color="#ffffff"
      />
      <Balls />
      <EffectComposer>
        <ColorAverage ref={effectRef} />
      </EffectComposer>
      <OrbitControls autoRotate autoRotateSpeed={0.6} enableZoom={false} />
    </Canvas>
  );
}
