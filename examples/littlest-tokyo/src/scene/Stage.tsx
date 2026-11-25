import { Environment } from "@react-three/drei";

/** Dawn light with a warm sun and soft shadows. */
export function Stage() {
  return (
    <>
      <Environment
        preset="dawn"
        background
        environmentIntensity={2}
        backgroundBlurriness={0.5}
      />
      <directionalLight
        position={[5, 8, 4]}
        color={0xfff0ad}
        intensity={3}
        castShadow
        shadow-mapSize={2048}
        shadow-bias={-0.0005}
        shadow-normalBias={0.02}
      >
        <orthographicCamera
          attach="shadow-camera"
          args={[-5, 5, 5, -5, 0.5, 30]}
        />
      </directionalLight>
    </>
  );
}
