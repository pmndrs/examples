import { CameraControls, Stage } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, HueSaturation } from "@react-three/postprocessing";
import { useControls } from "leva";
import { Suspense } from "react";
import Model from "./Model";

export default function App() {
  const { hue, saturation } = useControls({
    hue: { value: Math.PI, min: 0, max: Math.PI * 2, step: 0.01 },
    saturation: { value: 0.4, min: -1, max: 1, step: 0.01 },
  });

  return (
    <Canvas shadows dpr={[1, 2]} camera={{ fov: 50 }}>
      <color attach="background" args={["#111318"]} />
      <Suspense fallback={null}>
        <Stage
          preset="rembrandt"
          intensity={Math.PI}
          environment="city"
          adjustCamera={false}
        >
          <Model />
        </Stage>
        <EffectComposer autoClear={false}>
          <HueSaturation hue={hue} saturation={saturation} />
        </EffectComposer>
      </Suspense>
      <CameraControls makeDefault />
    </Canvas>
  );
}
