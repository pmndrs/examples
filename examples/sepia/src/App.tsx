import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Stage } from "@react-three/drei";
import { EffectComposer, Sepia } from "@react-three/postprocessing";
import { useControls } from "leva";
import Model from "./Model";

export default function App() {
  const { intensity } = useControls({
    intensity: { value: 1.5, min: 0, max: 3, step: 0.01 },
  });

  return (
    <Canvas shadows dpr={[1, 2]} camera={{ fov: 50 }}>
      <Suspense fallback={null}>
        <Stage preset="rembrandt" intensity={1} environment="city">
          <Model />
        </Stage>
        <EffectComposer>
          <Sepia intensity={intensity} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}
