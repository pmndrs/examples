import { CameraControls, Stage } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { DepthOfField, EffectComposer } from "@react-three/postprocessing";
import { useControls } from "leva";
import { Suspense } from "react";
import Model from "./Model";

const row = [
  { x: -4, z: 6 },
  { x: -2, z: 3 },
  { x: 0, z: 0 },
  { x: 2, z: -3 },
  { x: 4, z: -6 },
];

export default function App() {
  const { focusDistance, focusRange, bokehScale } = useControls({
    focusDistance: { value: 0.58, min: 0, max: 1, step: 0.01 },
    focusRange: { value: 0.1, min: 0, max: 1, step: 0.01 },
    bokehScale: { value: 5, min: 0, max: 10, step: 0.1 },
  });

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ fov: 50, near: 1, far: 20, position: [0, 1.5, 12] }}
    >
      <color attach="background" args={["#111318"]} />
      <Suspense fallback={null}>
        <Stage
          preset="rembrandt"
          intensity={Math.PI}
          environment="city"
          adjustCamera={false}
        >
          {row.map(({ x, z }) => (
            <Model key={z} position={[x, 0, z]} />
          ))}
        </Stage>
        <EffectComposer autoClear={false}>
          <DepthOfField
            focusDistance={focusDistance}
            focusRange={focusRange}
            bokehScale={bokehScale}
          />
        </EffectComposer>
      </Suspense>
      <CameraControls makeDefault />
    </Canvas>
  );
}
