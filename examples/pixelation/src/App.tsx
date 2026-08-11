import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { CameraControls, Stage } from "@react-three/drei";
import { EffectComposer, Pixelation } from "@react-three/postprocessing";
import { useControls } from "leva";
import Model from "./Model";

export default function App() {
  const { granularity } = useControls({
    granularity: { value: 5, min: 1, max: 30, step: 1 },
  });

  return (
    <Canvas shadows dpr={[1, 2]} camera={{ fov: 50 }}>
      <Suspense fallback={null}>
        <EffectComposer>
          <Pixelation granularity={granularity} />
        </EffectComposer>
        <Stage preset="rembrandt" intensity={Math.PI} environment="city">
          <Model />
        </Stage>
      </Suspense>
      <CameraControls makeDefault />
    </Canvas>
  );
}
