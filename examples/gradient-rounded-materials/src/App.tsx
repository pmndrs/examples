import { Canvas } from "@react-three/fiber";
import {
  GradientTexture,
  RoundedBox,
  MeshWobbleMaterial,
  OrbitControls,
  Environment,
  Float,
} from "@react-three/drei";
import { useControls } from "leva";

function GradientBox({ position }: { position: [number, number, number] }) {
  return (
    <Float speed={2} floatIntensity={0.5}>
      <RoundedBox args={[1.5, 1.5, 1.5]} position={position} radius={0.15} smoothness={4}>
        <meshStandardMaterial>
          <GradientTexture
            stops={[0, 0.5, 1]}
            colors={["#e74c3c", "#8e44ad", "#2980b9"]}
          />
        </meshStandardMaterial>
      </RoundedBox>
    </Float>
  );
}

function WobblyBox({ position }: { position: [number, number, number] }) {
  const { speed, factor } = useControls("Wobble", {
    speed: { value: 2, min: 0, max: 10, step: 0.1 },
    factor: { value: 0.4, min: 0, max: 2, step: 0.1 },
  });

  return (
    <mesh position={position}>
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <MeshWobbleMaterial color="#2ecc71" speed={speed} factor={factor} />
    </mesh>
  );
}

function RoundedGradientSphere({
  position,
}: {
  position: [number, number, number];
}) {
  return (
    <Float speed={1.5} floatIntensity={0.3}>
      <mesh position={position}>
        <sphereGeometry args={[0.9, 32, 32]} />
        <meshStandardMaterial>
          <GradientTexture
            stops={[0, 0.4, 0.7, 1]}
            colors={["#f39c12", "#e74c3c", "#9b59b6", "#3498db"]}
          />
        </meshStandardMaterial>
      </mesh>
    </Float>
  );
}

export default function App() {
  return (
    <Canvas camera={{ position: [0, 2, 8], fov: 45 }}>
      <GradientBox position={[-3, 1, 0]} />
      <WobblyBox position={[0, 1, 0]} />
      <RoundedGradientSphere position={[3, 1, 0]} />

      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>

      <Environment preset="city" />
      <OrbitControls makeDefault />
    </Canvas>
  );
}
