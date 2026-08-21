import { CameraControls, Stage } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Noise } from "@react-three/postprocessing";
import { useControls } from "leva";
import { BlendFunction } from "postprocessing";
import { Suspense } from "react";
import Model from "./Model";

export default function App() {
  const { opacity, premultiply } = useControls({
    opacity: { value: 1, min: 0, max: 1, step: 0.01 },
    premultiply: { value: true, label: "premultiply" },
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
          <Noise
            premultiply={premultiply}
            blendFunction={BlendFunction.ADD}
            opacity={opacity}
          />
        </EffectComposer>
      </Suspense>
      <CameraControls makeDefault />
    </Canvas>
  );
}
