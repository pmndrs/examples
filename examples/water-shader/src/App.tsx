import * as THREE from "three";
import React, { Suspense, useRef, useMemo, type ComponentProps } from "react";
import {
  Canvas,
  extend,
  useLoader,
  useFrame,
  type ThreeElements,
} from "@react-three/fiber";
import { OrbitControls, Sky as SkyImpl } from "@react-three/drei";
import { Water } from "three-stdlib";

import waterNormalsImg from "./waternormals.jpeg";

extend({ Water });

// The installed @react-three/drei Sky types don't include `scale`, even
// though the component spreads unmatched props onto the underlying
// `<primitive>`; widen the prop type locally instead of changing the value.
type SkyProps = ComponentProps<typeof SkyImpl> & {
  scale?: ThreeElements["primitive"]["scale"];
};
const Sky = SkyImpl as unknown as (
  props: SkyProps,
) => ReturnType<typeof SkyImpl>;

function Ocean() {
  const ref = useRef<Water>(null!);
  // `WebGLRenderer#encoding` and `WaterOptions#format` were both removed
  // from three.js / three-stdlib (superseded by `colorSpace`); the option
  // was already a no-op at this three.js version, so it is dropped here.
  const waterNormals = useLoader(THREE.TextureLoader, waterNormalsImg);
  waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;
  const geom = useMemo(() => new THREE.PlaneGeometry(10000, 10000), []);
  const config = useMemo(
    () => ({
      textureWidth: 512,
      textureHeight: 512,
      waterNormals,
      sunDirection: new THREE.Vector3(),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 3.7,
      fog: false,
    }),
    [waterNormals],
  );
  useFrame(
    (state, delta) => (ref.current.material.uniforms.time.value += delta),
  );
  return <water ref={ref} args={[geom, config]} rotation-x={-Math.PI / 2} />;
}

function Box() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((state, delta) => {
    ref.current.position.y = 10 + Math.sin(state.clock.elapsedTime) * 20;
    ref.current.rotation.x =
      ref.current.rotation.y =
      ref.current.rotation.z +=
        delta;
  });
  return (
    <mesh ref={ref} scale={20}>
      <boxGeometry />
      <meshStandardMaterial />
    </mesh>
  );
}

export default function App() {
  return (
    <Canvas camera={{ position: [0, 5, 100], fov: 55, near: 1, far: 20000 }}>
      <pointLight position={[100, 100, 100]} intensity={Math.PI} decay={0} />
      <pointLight position={[-100, -100, -100]} intensity={Math.PI} decay={0} />
      <Suspense fallback={null}>
        <Ocean />
        <Box />
      </Suspense>
      <Sky scale={1000} sunPosition={[500, 150, -1000]} turbidity={0.1} />
      <OrbitControls />
    </Canvas>
  );
}
