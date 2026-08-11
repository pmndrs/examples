import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { CameraControls, Stage } from "@react-three/drei";
import { EffectComposer, Grid } from "@react-three/postprocessing";
import { useControls } from "leva";
import Model from "./Model";

export default function App() {
  const { scale } = useControls({
    scale: { value: 0.5, min: 0.1, max: 4, step: 0.1 },
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
          <Grid scale={scale} />
        </EffectComposer>
      </Suspense>
      <CameraControls makeDefault />
    </Canvas>
  );
}
