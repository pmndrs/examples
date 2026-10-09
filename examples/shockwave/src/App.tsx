import { Grid, OrbitControls } from "@react-three/drei";
import { Canvas, type ThreeEvent } from "@react-three/fiber";
import { EffectComposer, ShockWave } from "@react-three/postprocessing";
import { button, useControls } from "leva";
import { type ShockWaveEffect } from "postprocessing";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const FIELD = 7;
const SPACING = 1.4;
const COLORS = ["#ff5e5b", "#ffd23f", "#3bceac", "#0ead69", "#4d9de0"];

type BlockData = {
  position: [number, number, number];
  height: number;
  color: string;
};

function useBlocks(): BlockData[] {
  return useMemo(() => {
    const blocks: BlockData[] = [];
    for (let x = 0; x < FIELD; x++) {
      for (let z = 0; z < FIELD; z++) {
        const height = 0.4 + Math.random() * 1.2;
        blocks.push({
          position: [
            (x - (FIELD - 1) / 2) * SPACING,
            height / 2,
            (z - (FIELD - 1) / 2) * SPACING,
          ],
          height,
          color: COLORS[(x + z) % COLORS.length],
        });
      }
    }
    return blocks;
  }, []);
}

function randomEpicenter(): [number, number, number] {
  const extent = ((FIELD - 1) / 2) * SPACING;
  return [
    (Math.random() * 2 - 1) * extent,
    0,
    (Math.random() * 2 - 1) * extent,
  ];
}

function Scene() {
  const blocks = useBlocks();
  const effect = useRef<ShockWaveEffect>(null);
  // A fresh object per shot, so firing twice at the same point still
  // re-runs the explode effect below.
  const [shot, setShot] = useState<{
    position: [number, number, number];
  } | null>(null);

  const fire = useCallback(
    (position: [number, number, number]) => setShot({ position }),
    [],
  );

  // ShockWave applies `position` in a layout effect, so by the time this
  // runs the epicenter is already where the wave should start.
  useEffect(() => {
    if (shot) effect.current?.explode();
  }, [shot]);

  const { speed, maxRadius, waveSize, amplitude, auto } = useControls(
    "Postprocessing - ShockWave",
    {
      speed: { value: 1.25, min: 0.1, max: 5, step: 0.05 },
      maxRadius: { value: 1, min: 0.1, max: 3, step: 0.05 },
      waveSize: { value: 0.2, min: 0.01, max: 1, step: 0.01 },
      amplitude: { value: 0.05, min: 0, max: 0.3, step: 0.005 },
      auto: { value: true, label: "auto fire" },
      explode: button(() => fire(randomEpicenter())),
    },
    [fire],
  );

  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => fire(randomEpicenter()), 2000);
    return () => clearInterval(id);
  }, [auto, fire]);

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    // Ignore the click that ends an orbit drag.
    if (e.delta > 4) return;
    e.stopPropagation();
    fire([e.point.x, e.point.y, e.point.z]);
  };

  return (
    <>
      <group onClick={onClick}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[40, 40]} />
          <meshStandardMaterial color="#1b1d24" />
        </mesh>
        {blocks.map(({ position, height, color }, i) => (
          <mesh key={i} position={position}>
            <boxGeometry args={[0.9, height, 0.9]} />
            <meshStandardMaterial color={color} roughness={0.5} />
          </mesh>
        ))}
      </group>
      <Grid
        position={[0, 0.001, 0]}
        args={[40, 40]}
        cellSize={0.35}
        cellColor="#3a3f4d"
        sectionSize={SPACING}
        sectionColor="#5b6273"
        fadeDistance={30}
        infiniteGrid
      />

      <EffectComposer>
        <ShockWave
          ref={effect}
          position={shot?.position}
          speed={speed}
          maxRadius={maxRadius}
          waveSize={waveSize}
          amplitude={amplitude}
        />
      </EffectComposer>
    </>
  );
}

export default function App() {
  return (
    <Canvas camera={{ position: [0, 7, 10], fov: 45 }}>
      <color attach="background" args={["#1b1d24"]} />
      <ambientLight intensity={0.4 * Math.PI} />
      <directionalLight position={[5, 10, 5]} intensity={0.9 * Math.PI} />
      <Scene />
      <OrbitControls maxPolarAngle={Math.PI / 2.2} />
    </Canvas>
  );
}
