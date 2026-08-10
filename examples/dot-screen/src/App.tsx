import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Stage } from "@react-three/drei";
import { BlendFunction } from "postprocessing";
import { EffectComposer, DotScreen } from "@react-three/postprocessing";
import { useControls } from "leva";
import Model from "./Model";

export default function App() {
  const { angle, scale } = useControls({
    angle: { value: Math.PI * 0.5, min: 0, max: Math.PI, step: 0.01 },
    scale: { value: 0.3, min: 0.1, max: 3, step: 0.1 },
  });

  return (
    <Canvas shadows dpr={[1, 2]} camera={{ fov: 50 }}>
      <Suspense fallback={null}>
        <Stage preset="rembrandt" intensity={1} environment="city">
          <Model />
        </Stage>
        <EffectComposer>
          <DotScreen
            blendFunction={BlendFunction.NORMAL}
            angle={angle}
            scale={scale}
          />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}
