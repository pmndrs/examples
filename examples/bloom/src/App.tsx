import { CameraControls, Stage } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { useControls } from "leva";
import { Suspense, useRef } from "react";
import * as THREE from "three";
import Model from "./Model";

function MovingLight() {
  const light = useRef<THREE.PointLight>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.4;
    light.current.position.set(
      Math.sin(t) * 3,
      1.5 + Math.sin(t * 1.3),
      Math.cos(t) * 3,
    );
  });

  return (
    <pointLight
      ref={light}
      color="#4dd8ff"
      intensity={4 * Math.PI}
      distance={12}
      decay={2}
    />
  );
}

export default function App() {
  const { intensity, luminanceThreshold, luminanceSmoothing, mipmapBlur } =
    useControls("Postprocessing - Bloom", {
      intensity: { value: 5, min: 0, max: 20, step: 0.1 },
      luminanceThreshold: { value: 0.5, min: 0, max: 1, step: 0.01 },
      luminanceSmoothing: { value: 0.5, min: 0, max: 1, step: 0.01 },
      mipmapBlur: true,
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
        <MovingLight />
        <EffectComposer enableNormalPass>
          <Bloom
            intensity={intensity}
            luminanceThreshold={luminanceThreshold}
            luminanceSmoothing={luminanceSmoothing}
            mipmapBlur={mipmapBlur}
          />
        </EffectComposer>
      </Suspense>
      <CameraControls makeDefault />
    </Canvas>
  );
}
