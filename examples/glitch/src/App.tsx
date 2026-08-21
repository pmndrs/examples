import { CameraControls, Stage } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import {
  ChromaticAberration,
  EffectComposer,
  Glitch,
} from "@react-three/postprocessing";
import { useControls } from "leva";
import { Suspense } from "react";
import Model from "./Model";

export default function App() {
  const { active, strength, delay, duration, columns, ratio } = useControls({
    active: true,
    strength: { value: [0.1, 0.3], min: 0, max: 1, step: 0.01 },
    delay: { value: [0.5, 1], min: 0, max: 10, step: 0.1 },
    duration: { value: [0.6, 2], min: 0, max: 5, step: 0.1 },
    columns: { value: 0.05, min: 0, max: 1, step: 0.001 },
    ratio: { value: 0.55, min: 0, max: 1, step: 0.01 },
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
          <Glitch
            active={active}
            strength={strength as never}
            delay={delay as never}
            duration={duration as never}
            columns={columns}
            ratio={ratio}
          />
          <ChromaticAberration offset={[0.001, 0.001]} />
        </EffectComposer>
      </Suspense>
      <CameraControls makeDefault />
    </Canvas>
  );
}
