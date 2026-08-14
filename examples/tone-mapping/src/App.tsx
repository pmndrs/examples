import { CameraControls, Stage } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, ToneMapping } from "@react-three/postprocessing";
import { useControls } from "leva";
import { ToneMappingMode } from "postprocessing";
import { Suspense } from "react";
import Model from "./Model";

const modes = {
  Linear: ToneMappingMode.LINEAR,
  Reinhard: ToneMappingMode.REINHARD,
  "Reinhard 2": ToneMappingMode.REINHARD2,
  "Reinhard 2 (adaptive)": ToneMappingMode.REINHARD2_ADAPTIVE,
  Uncharted2: ToneMappingMode.UNCHARTED2,
  Cineon: ToneMappingMode.CINEON,
  "ACES Filmic": ToneMappingMode.ACES_FILMIC,
  AGX: ToneMappingMode.AGX,
  Neutral: ToneMappingMode.NEUTRAL,
};

export default function App() {
  const { mode, middleGrey, whitePoint } = useControls({
    mode: { value: ToneMappingMode.REINHARD2_ADAPTIVE, options: modes },
    middleGrey: { value: 0.6, min: 0, max: 1, step: 0.01 },
    whitePoint: { value: 16, min: 0, max: 64, step: 1 },
  });

  return (
    <Canvas shadows dpr={[1, 2]} camera={{ fov: 50 }}>
      <color attach="background" args={["#303035"]} />
      <Suspense fallback={null}>
        <Stage
          preset="rembrandt"
          intensity={Math.PI}
          environment={{
            preset: "city",
            background: true,
            backgroundBlurriness: 0.65,
          }}
          adjustCamera={false}
        >
          <Model />
        </Stage>
        <EffectComposer>
          <ToneMapping
            mode={mode}
            middleGrey={middleGrey}
            whitePoint={whitePoint}
          />
        </EffectComposer>
      </Suspense>
      <CameraControls makeDefault />
    </Canvas>
  );
}
