import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { CameraControls, Stage } from "@react-three/drei";
import { EffectComposer, Scanline } from "@react-three/postprocessing";
import { useControls } from "leva";
import Model from "./Model";

export default function App() {
  const { density } = useControls({
    density: { value: 1.25, min: 0, max: 10, step: 0.25 },
  });

  return (
    <Canvas shadows dpr={[1, 2]} camera={{ fov: 50 }}>
      <Suspense fallback={null}>
        <Stage
          preset="rembrandt"
          intensity={Math.PI}
          environment="city"
          adjustCamera={false}
        >
          <Model />
        </Stage>
        <EffectComposer>
          <Scanline density={density} />
        </EffectComposer>
      </Suspense>
      <CameraControls makeDefault />
    </Canvas>
  );
}
