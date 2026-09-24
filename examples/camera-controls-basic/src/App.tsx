import { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { CameraControls, Environment, RoundedBox } from "@react-three/drei";
import { useControls, button } from "leva";
import type CameraControlsImpl from "camera-controls";

function Scene() {
  const cameraControlsRef = useRef<CameraControlsImpl>(null);

  const { minDistance, maxDistance, polarAngle } = useControls("Limits", {
    minDistance: { value: 2, min: 0, max: 10, step: 0.1 },
    maxDistance: { value: 20, min: 5, max: 50, step: 1 },
    polarAngle: {
      value: Math.PI,
      min: 0,
      max: Math.PI,
      step: 0.01,
      label: "Max polar angle",
    },
  });

  useControls("Transitions", {
    "Reset camera": button(() => {
      cameraControlsRef.current?.reset(true);
    }),
    "Zoom to red box": button(() => {
      cameraControlsRef.current?.setLookAt(3, 2, 5, 2, 0.5, 0, true);
    }),
    "Zoom to blue box": button(() => {
      cameraControlsRef.current?.setLookAt(-3, 2, 5, -2, 0.5, 0, true);
    }),
    "Top-down view": button(() => {
      cameraControlsRef.current?.setLookAt(0, 10, 0.01, 0, 0, 0, true);
    }),
  });

  return (
    <>
      <CameraControls
        ref={cameraControlsRef}
        minDistance={minDistance}
        maxDistance={maxDistance}
        maxPolarAngle={polarAngle}
      />

      <RoundedBox args={[1, 1, 1]} position={[2, 0.5, 0]} radius={0.1}>
        <meshStandardMaterial color="#e74c3c" />
      </RoundedBox>

      <RoundedBox args={[1, 1, 1]} position={[-2, 0.5, 0]} radius={0.1}>
        <meshStandardMaterial color="#3498db" />
      </RoundedBox>

      <RoundedBox args={[1, 2, 1]} position={[0, 1, -2]} radius={0.1}>
        <meshStandardMaterial color="#2ecc71" />
      </RoundedBox>

      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>

      <Environment preset="city" />
    </>
  );
}

export default function App() {
  return (
    <Canvas shadows camera={{ position: [5, 3, 5], fov: 50 }}>
      <Scene />
    </Canvas>
  );
}
