import { useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, type ThreeElements } from "@react-three/fiber";
import {
  SoftShadows,
  Float,
  CameraControls,
  Sky,
  type SkyProps,
  PerformanceMonitor,
} from "@react-three/drei";
import { useControls } from "leva";
import { Perf } from "r3f-perf";
import { easing } from "maath";
import { Model as Room } from "./Room";

function Light() {
  const ref = useRef<THREE.Group>(null!);
  useFrame((state, delta) => {
    easing.dampE(
      ref.current.rotation,
      [(state.pointer.y * Math.PI) / 50, (state.pointer.x * Math.PI) / 20, 0],
      0.2,
      delta,
    );
  });
  return (
    <group ref={ref}>
      <directionalLight
        position={[5, 5, -8]}
        castShadow
        intensity={5 * Math.PI}
        shadow-mapSize={2048}
        shadow-bias={-0.001}
      >
        <orthographicCamera
          attach="shadow-camera"
          args={[-8.5, 8.5, 8.5, -8.5, 0.1, 20]}
        />
      </directionalLight>
    </group>
  );
}

// SkyProps doesn't declare `scale`, but Sky forwards unrecognized props to the
// underlying <primitive> (a three-stdlib Sky mesh), which does accept it.
const skyProps: SkyProps & Pick<ThreeElements["primitive"], "scale"> = {
  inclination: 0.52,
  scale: 20,
};

export default function App() {
  const [bad, set] = useState(false);
  const { debug, enabled, samples, ...config } = useControls({
    debug: true,
    enabled: true,
    size: { value: 35, min: 0, max: 100, step: 0.1 },
    focus: { value: 0.5, min: 0, max: 2, step: 0.1 },
    samples: { value: 16, min: 1, max: 40, step: 1 },
  });
  return (
    <Canvas shadows camera={{ position: [5, 2, 10], fov: 50 }}>
      {debug && <Perf position="top-left" />}
      <PerformanceMonitor onDecline={() => set(true)} />
      {enabled && (
        <SoftShadows
          {...config}
          samples={bad ? Math.min(6, samples) : samples}
        />
      )}
      <CameraControls makeDefault />
      <color attach="background" args={["#d0d0d0"]} />
      <fog attach="fog" args={["#d0d0d0", 8, 35]} />
      <ambientLight intensity={0.4 * Math.PI} />
      <Light />
      <Room scale={0.5} position={[0, -1, 0]} />
      <Sphere />
      <Sphere position={[2, 4, -8]} scale={0.9} />
      <Sphere position={[-2, 2, -8]} scale={0.8} />
      <Sky {...skyProps} />
    </Canvas>
  );
}

function Sphere({
  color = "hotpink",
  floatIntensity = 15,
  position = [0, 5, -8],
  scale = 1,
}: {
  color?: string;
  floatIntensity?: number;
  position?: ThreeElements["mesh"]["position"];
  scale?: ThreeElements["mesh"]["scale"];
}) {
  return (
    <Float floatIntensity={floatIntensity}>
      <mesh castShadow position={position} scale={scale}>
        <sphereGeometry />
        <meshBasicMaterial
          color={color}
          // MeshBasicMaterial doesn't type `roughness` (it's unlit and ignores the
          // value), but the original example sets it, so keep it via drei's own shape.
          {...({
            roughness: 1,
          } as unknown as ThreeElements["meshBasicMaterial"])}
        />
      </mesh>
    </Float>
  );
}
