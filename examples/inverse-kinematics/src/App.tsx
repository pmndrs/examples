import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import Scene from "./Scene";

export default function App() {
  return (
    <Canvas
      camera={{
        fov: 55,
        near: 0.001,
        far: 5000,
        position: [0.9728517749133652, 1.1044765132727201, 0.7316689528482836],
      }}
    >
      <color attach="background" args={["#ffffff"]} />
      <fogExp2 attach="fog" args={["#ffffff", 0.17]} />

      <ambientLight intensity={8} />

      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  );
}
