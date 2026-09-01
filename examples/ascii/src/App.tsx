import { Environment, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { ASCII, EffectComposer } from "@react-three/postprocessing";
import { useControls } from "leva";
import { BlendFunction, type Effect } from "postprocessing";
import { Suspense, useEffect, useState } from "react";
import Model from "./Model";

const blendFunctions = {
  NORMAL: BlendFunction.NORMAL,
  MULTIPLY: BlendFunction.MULTIPLY,
};

export default function App() {
  const [effect, setEffect] = useState<Effect | null>(null);

  const {
    characters,
    cellSize,
    fontSize,
    color,
    invert,
    opacity,
    blendFunction,
  } = useControls("Postprocessing - ASCII", {
    characters: {
      value: " .:,'-^=*+?!|0#X%WM@",
      options: [" .:,'-^=*+?!|0#X%WM@", " ░▒▓█", " 0123456789", " .oO0"],
    },
    cellSize: { value: 16, min: 4, max: 32, step: 1 },
    fontSize: { value: 54, min: 20, max: 120, step: 1 },
    color: { value: "#ffffff" },
    invert: { value: false },
    opacity: {
      value: 0.98,
      min: 0,
      max: 1,
      step: 0.01,
      label: "opacity",
    },
    blendFunction: { value: "MULTIPLY", options: Object.keys(blendFunctions) },
  });

  useEffect(() => {
    if (!effect) return;
    effect.blendMode.setOpacity(opacity);
    effect.blendMode.blendFunction =
      blendFunctions[blendFunction as keyof typeof blendFunctions];
  }, [
    effect,
    opacity,
    blendFunction,
    characters,
    cellSize,
    fontSize,
    color,
    invert,
  ]);

  return (
    <Canvas shadows camera={{ position: [2.35, 1.2, 1.25], fov: 45 }}>
      <ambientLight intensity={0.6 * Math.PI} />
      <directionalLight
        position={[4, 6, 4]}
        intensity={1.2 * Math.PI}
        castShadow
      />

      <Suspense fallback={null}>
        <Model />
        <Environment preset="dawn" background backgroundBlurriness={1} />
      </Suspense>

      <EffectComposer>
        <ASCII
          ref={setEffect as never}
          characters={characters}
          cellSize={cellSize}
          fontSize={fontSize}
          color={color}
          invert={invert}
        />
      </EffectComposer>

      <OrbitControls />
    </Canvas>
  );
}
