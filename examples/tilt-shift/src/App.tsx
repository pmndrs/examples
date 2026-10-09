import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import {
  EffectComposer,
  TiltShift,
  TiltShift2,
} from "@react-three/postprocessing";
import { folder, useControls } from "leva";
import { BlendFunction, KernelSize } from "postprocessing";
import { Cars } from "./Cars";
import { Town } from "./Town";

const SKY = "#cfe6f3";

function Effects() {
  const {
    enabled,
    effect,
    offset,
    rotation,
    focusArea,
    feather,
    kernelSize,
    blur,
    taper,
    start,
    end,
    samples,
  } = useControls("Postprocessing", {
    enabled: true,
    effect: { value: "TiltShift", options: ["TiltShift", "TiltShift2"] },
    TiltShift: folder(
      {
        offset: { value: 0, min: -0.5, max: 0.5, step: 0.01 },
        rotation: { value: 0, min: -Math.PI / 2, max: Math.PI / 2 },
        focusArea: { value: 0.35, min: 0, max: 1, step: 0.01 },
        feather: { value: 0.3, min: 0, max: 1, step: 0.01 },
        kernelSize: {
          value: KernelSize.LARGE,
          options: {
            "Very small": KernelSize.VERY_SMALL,
            Small: KernelSize.SMALL,
            Medium: KernelSize.MEDIUM,
            Large: KernelSize.LARGE,
            "Very large": KernelSize.VERY_LARGE,
            Huge: KernelSize.HUGE,
          },
        },
      },
      { render: (get) => get("Postprocessing.effect") === "TiltShift" },
    ),
    TiltShift2: folder(
      {
        blur: { value: 0.25, min: 0, max: 1, step: 0.01 },
        taper: { value: 0.5, min: 0, max: 1, step: 0.01 },
        start: { value: [0, 0.5], min: 0, max: 1, step: 0.01 },
        end: { value: [1, 0.5], min: 0, max: 1, step: 0.01 },
        samples: { value: 10, min: 1, max: 50, step: 1 },
      },
      { render: (get) => get("Postprocessing.effect") === "TiltShift2" },
    ),
  });

  if (!enabled) return null;

  return (
    <EffectComposer>
      {effect === "TiltShift" ? (
        // The wrapper defaults to ADD, but the effect outputs the whole
        // image, not just the blur - added on top it doubles the scene.
        <TiltShift
          blendFunction={BlendFunction.NORMAL}
          offset={offset}
          rotation={rotation}
          focusArea={focusArea}
          feather={feather}
          kernelSize={kernelSize}
        />
      ) : (
        <TiltShift2
          blur={blur}
          taper={taper}
          start={start as [number, number]}
          end={end as [number, number]}
          samples={samples}
        />
      )}
    </EffectComposer>
  );
}

export default function App() {
  return (
    <Canvas shadows camera={{ position: [24, 22, 24], fov: 30 }}>
      <color attach="background" args={[SKY]} />
      <fog attach="fog" args={[SKY, 50, 90]} />
      <hemisphereLight args={["#d6ecff", "#6b7f45", 0.5 * Math.PI]} />
      <directionalLight
        position={[14, 20, 8]}
        intensity={1.1 * Math.PI}
        color="#fff1d6"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0005}
      >
        <orthographicCamera
          attach="shadow-camera"
          args={[-30, 30, 30, -30, 1, 80]}
        />
      </directionalLight>

      <Town />
      <Cars />
      <Effects />

      <OrbitControls
        autoRotate
        autoRotateSpeed={0.3}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 3}
        minDistance={20}
        maxDistance={55}
      />
    </Canvas>
  );
}
