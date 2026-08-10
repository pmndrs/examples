import { useRef } from "react";
import type * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { WaveMaterial } from "./WaveMaterial";
import { easing } from "maath";

function ShaderPlane() {
  const ref = useRef<InstanceType<typeof WaveMaterial>>(null!);
  const { viewport, size } = useThree();
  useFrame((state, delta) => {
    ref.current.time += delta;
    // damp3 is typed for Vector3, but both pointer and state.pointer are
    // Vector2 here — it only ever reads/writes their shared x/y at runtime.
    easing.damp3(
      ref.current.pointer as unknown as THREE.Vector3,
      state.pointer as unknown as THREE.Vector3,
      0.2,
      delta,
    );
  });
  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry />
      <waveMaterial
        ref={ref}
        key={WaveMaterial.key}
        resolution={[size.width * viewport.dpr, size.height * viewport.dpr]}
      />
    </mesh>
  );
}

export default function App() {
  return (
    <Canvas>
      <ShaderPlane />
    </Canvas>
  );
}
