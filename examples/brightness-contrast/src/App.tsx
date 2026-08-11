import { CameraControls, Stage } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import {
  BrightnessContrast,
  EffectComposer,
} from "@react-three/postprocessing";
import { useControls } from "leva";
import { Suspense } from "react";
import Model from "./Model";

export default function App() {
  const { brightness, contrast } = useControls({
    brightness: { value: 0, min: -1, max: 1, step: 0.01 },
    contrast: { value: 0.2, min: -1, max: 1, step: 0.01 },
  });

  return (
    <Canvas shadows dpr={[1, 2]} camera={{ fov: 50 }}>
      <color attach="background" args={["#303035"]} />
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
          <BrightnessContrast brightness={brightness} contrast={contrast} />
        </EffectComposer>
      </Suspense>
      <CameraControls makeDefault />
    </Canvas>
  );
}
