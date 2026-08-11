import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import Effects from "./Effects";
import Scene from "./Scene";

export default function App() {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 0, 3], far: 1000, fov: 70 }}
      gl={{
        powerPreference: "high-performance",
        alpha: false,
        antialias: false,
        stencil: false,
      }}
    >
      <color attach="background" args={["#121212"]} />
      <Effects />
      <Suspense fallback={<Html center>Loading.</Html>}>
        <Scene />
      </Suspense>
    </Canvas>
  );
}
