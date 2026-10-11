import { Environment, Lightformer, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, LensDistortion } from "@react-three/postprocessing";
import { useControls } from "leva";
import { Lattice } from "./Lattice";

const BACKGROUND = "#0b0d12";

function Effects() {
  const { distortion, principalPoint, focalLength, skew } = useControls(
    "Postprocessing - LensDistortion",
    {
      distortion: { value: [0.4, 0.4], min: -1, max: 1, step: 0.01 },
      principalPoint: { value: [0, 0], min: -0.5, max: 0.5, step: 0.01 },
      focalLength: { value: [0.55, 0.55], min: 0.2, max: 2, step: 0.01 },
      skew: { value: 0, min: -1, max: 1, step: 0.01 },
    },
  );

  return (
    <EffectComposer>
      <LensDistortion
        distortion={distortion}
        principalPoint={principalPoint}
        focalLength={focalLength}
        skew={skew}
      />
    </EffectComposer>
  );
}

export default function App() {
  return (
    <Canvas camera={{ position: [0, 0, 15], fov: 50 }}>
      <color attach="background" args={[BACKGROUND]} />
      <fog attach="fog" args={[BACKGROUND, 8, 22]} />
      <ambientLight intensity={0.2 * Math.PI} />
      <Environment resolution={256}>
        <Lightformer intensity={4} position={[0, 5, -5]} scale={[10, 2, 1]} />
        <Lightformer
          form="ring"
          intensity={3}
          color="#7fd6ff"
          position={[-5, 2, 3]}
          scale={4}
        />
        <Lightformer
          intensity={2}
          color="#ff7fd1"
          position={[5, -2, 3]}
          rotation-y={-Math.PI / 2}
          scale={[3, 8, 1]}
        />
      </Environment>

      <Lattice />
      <Effects />

      <OrbitControls enablePan={false} minDistance={2} maxDistance={18} />
    </Canvas>
  );
}
