import { Canvas } from "@react-three/fiber";
import {
  AccumulativeShadows,
  RandomizedLight,
  ContactShadows,
  OrbitControls,
  Environment,
  RoundedBox,
} from "@react-three/drei";
import { useControls } from "leva";

function AccumulativeSection() {
  const { frames, color, opacity } = useControls("AccumulativeShadows", {
    frames: { value: 100, min: 2, max: 200, step: 1 },
    color: "#316d39",
    opacity: { value: 0.8, min: 0, max: 1, step: 0.01 },
  });

  return (
    <group position={[-2, 0, 0]}>
      <RoundedBox args={[1, 1, 1]} position={[0, 0.5, 0]} radius={0.1} smoothness={4} castShadow>
        <meshStandardMaterial color="#e74c3c" />
      </RoundedBox>

      <mesh position={[0, 1.2, 0.8]} castShadow>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial color="#3498db" />
      </mesh>

      <AccumulativeShadows
        temporal
        frames={frames}
        color={color}
        colorBlend={2}
        opacity={opacity}
        scale={6}
        position={[0, 0.01, 0]}
      >
        <RandomizedLight
          amount={8}
          radius={4}
          ambient={0.5}
          intensity={Math.PI}
          position={[5, 5, -5]}
          bias={0.001}
        />
      </AccumulativeShadows>
    </group>
  );
}

function ContactSection() {
  const { blur, opacity, far } = useControls("ContactShadows", {
    blur: { value: 2.5, min: 0, max: 10, step: 0.1 },
    opacity: { value: 0.75, min: 0, max: 1, step: 0.01 },
    far: { value: 3, min: 0.5, max: 10, step: 0.1 },
  });

  return (
    <group position={[2, 0, 0]}>
      <RoundedBox args={[1, 1, 1]} position={[0, 0.5, 0]} radius={0.1} smoothness={4}>
        <meshStandardMaterial color="#9b59b6" />
      </RoundedBox>

      <mesh position={[0, 1.2, 0.8]}>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial color="#f39c12" />
      </mesh>

      <ContactShadows
        position={[0, 0.01, 0]}
        scale={6}
        blur={blur}
        opacity={opacity}
        far={far}
      />
    </group>
  );
}

export default function App() {
  return (
    <Canvas shadows camera={{ position: [0, 4, 8], fov: 45 }}>
      <AccumulativeSection />
      <ContactSection />

      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#fafafa" />
      </mesh>

      <Environment preset="city" />
      <OrbitControls makeDefault />
    </Canvas>
  );
}
