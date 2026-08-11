import {
  ContactShadows,
  Environment,
  Float,
  OrbitControls,
} from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Vignette } from "@react-three/postprocessing";
import { useControls } from "leva";
import { BlendFunction } from "postprocessing";
import { useRef } from "react";
import type { Mesh } from "three";

function Knot() {
  const ref = useRef<Mesh>(null!);
  useFrame((_, delta) => {
    ref.current.rotation.x += delta * 0.15;
    ref.current.rotation.y += delta * 0.2;
  });
  return (
    <Float speed={1.5} floatIntensity={0.3} rotationIntensity={0}>
      <mesh ref={ref} castShadow>
        <torusKnotGeometry args={[0.9, 0.28, 200, 32]} />
        <meshPhysicalMaterial
          color="#be7912"
          roughness={0.2}
          metalness={0.85}
        />
      </mesh>
    </Float>
  );
}

export default function App() {
  const { offset, darkness, eskil, blendFunction } = useControls("Vignette", {
    offset: { value: 0.4, min: 0, max: 1, step: 0.01 },
    darkness: { value: 0.9, min: 0, max: 1, step: 0.01 },
    eskil: false,
    blendFunction: {
      value: "NORMAL" as const,
      options: ["NORMAL", "MULTIPLY"] as const,
    },
  });

  return (
    <Canvas shadows camera={{ position: [7, 1.4, 7], fov: 32 }}>
      <color attach="background" args={["#3a3630"]} />
      <ambientLight intensity={0.35 * Math.PI} />
      <directionalLight
        position={[4, 6, 3]}
        intensity={1.4 * Math.PI}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <Knot />
      <ContactShadows
        position={[0, -1.75, 0]}
        opacity={0.75}
        scale={20}
        blur={2.4}
        far={4}
      />
      <Environment preset="studio" />
      <OrbitControls target={[0, 0, 0]} />
      <EffectComposer>
        <Vignette
          eskil={eskil}
          offset={offset}
          darkness={darkness}
          blendFunction={BlendFunction[blendFunction]}
        />
      </EffectComposer>
    </Canvas>
  );
}
