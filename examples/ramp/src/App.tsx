import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, type ThreeElements } from "@react-three/fiber";
import { ASCII, Bloom, EffectComposer } from "@react-three/postprocessing";
import { useControls } from "leva";
import { BlendFunction } from "postprocessing";
import { useRef, useState } from "react";
import * as THREE from "three";
import { RampEffect } from "./RampEffect";

function colorNormalize(color: {
  r: number;
  g: number;
  b: number;
}): [number, number, number, number] {
  return [color.r / 255, color.g / 255, color.b / 255, 1];
}

function Effects() {
  const leva = useControls({
    rampType: {
      value: 0,
      options: { Linear: 0, Radial: 1, "Linear (Mirrored)": 2 },
    },
    opacity: { value: 1, min: 0, max: 1, label: "Opacity" },
    rampMask: { value: true },
    rampStart: {
      value: { x: 0.45, y: 0.5 },
      step: 0.01,
      min: 0.0,
      max: 1.0,
      joystick: "invertY",
    },
    rampEnd: {
      value: { x: 0.55, y: 0.5 },
      step: 0.01,
      min: 0.0,
      max: 1.0,
      joystick: "invertY",
    },
    rampBias: { value: 0.5, max: 1, min: 0 },
    rampGain: { value: 0.5, max: 1, min: 0 },
    blendFunction: {
      value: BlendFunction.NORMAL,
      options: {
        Multiply: BlendFunction.MULTIPLY,
        Normal: BlendFunction.NORMAL,
        Overlay: BlendFunction.OVERLAY,
        Screen: BlendFunction.SCREEN,
      },
      label: "Blend",
    },
    effect: {
      value: "ascii",
      options: { ASCII: "ascii", Bloom: "bloom", None: "none" },
      label: "Effect",
    },
    Color1: { value: { r: 0, g: 0, b: 0 }, render: (get) => !get("rampMask") },
    Color2: {
      value: { r: 255, g: 255, b: 255 },
      render: (get) => !get("rampMask"),
    },
    rampInvert: { value: false },
  });

  return (
    <EffectComposer>
      {leva.effect === "ascii" && <ASCII />}
      {leva.effect === "bloom" && (
        <Bloom luminanceThreshold={0.1} luminanceSmoothing={0.15} mipmapBlur />
      )}
      <RampEffect
        {...leva}
        rampStart={[leva.rampStart.x, leva.rampStart.y]}
        rampEnd={[leva.rampEnd.x, leva.rampEnd.y]}
        startColor={colorNormalize(leva.Color1)}
        endColor={colorNormalize(leva.Color2)}
      />
    </EffectComposer>
  );
}

function Box(props: ThreeElements["mesh"]) {
  const ref = useRef<THREE.Mesh>(null!);
  const [hovered, hover] = useState(false);
  const [clicked, click] = useState(false);

  useFrame((_, delta) => (ref.current.rotation.x += delta));

  return (
    <mesh
      {...props}
      ref={ref}
      scale={clicked ? 1.5 : 1}
      onClick={() => click(!clicked)}
      onPointerOver={() => hover(true)}
      onPointerOut={() => hover(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? "hotpink" : "orange"} />
    </mesh>
  );
}

export default function App() {
  return (
    <Canvas>
      <color attach="background" args={["black"]} />
      <ambientLight intensity={0.5 * Math.PI} />
      <spotLight
        position={[10, 10, 10]}
        angle={0.15}
        penumbra={1}
        intensity={Math.PI}
      />
      <pointLight position={[-10, -10, -10]} intensity={4 * Math.PI} />
      <Box position={[-1.2, 0, 0]} />
      <Box position={[1.2, 0, 0]} />
      <Box position={[-3.6, 0, 0]} />
      <Box position={[3.6, 0, 0]} />
      <Box position={[-1.2, 2.4, 0]} />
      <Box position={[1.2, 2.4, 0]} />
      <Box position={[-3.6, 2.4, 0]} />
      <Box position={[3.6, 2.4, 0]} />
      <Box position={[-1.2, -2.4, 0]} />
      <Box position={[1.2, -2.4, 0]} />
      <Box position={[-3.6, -2.4, 0]} />
      <Box position={[3.6, -2.4, 0]} />
      <OrbitControls />
      <Effects />
    </Canvas>
  );
}
