import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { CameraControls, Stage } from "@react-three/drei";
import {
  ChromaticAberration,
  EffectComposer,
} from "@react-three/postprocessing";
import { useControls } from "leva";
import Model from "./Model";

export default function App() {
  const { offset } = useControls({
    offset: { value: [0.02, 0.002] },
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
          <ChromaticAberration offset={offset} />
        </EffectComposer>
      </Suspense>
      <CameraControls makeDefault />
    </Canvas>
  );
}
