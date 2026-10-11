import {
  Backdrop,
  ContactShadows,
  Float,
  OrbitControls,
  RoundedBox,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import {
  EffectComposer,
  Halftone,
  HalftoneShape,
} from "@react-three/postprocessing";
import { useControls } from "leva";

function Shapes() {
  return (
    <>
      <Float speed={1.4} rotationIntensity={0.6} floatIntensity={0.6}>
        <mesh position={[0, 1.4, 0]} castShadow>
          <torusKnotGeometry args={[0.8, 0.28, 200, 32]} />
          <meshStandardMaterial color="#e63946" roughness={0.3} />
        </mesh>
      </Float>
      <Float speed={1.8} floatIntensity={0.8}>
        <mesh position={[-2.4, 0.9, 0.6]} castShadow>
          <sphereGeometry args={[0.75, 64, 64]} />
          <meshStandardMaterial color="#ffd23f" roughness={0.25} />
        </mesh>
      </Float>
      <Float speed={1.2} rotationIntensity={1.2}>
        <RoundedBox
          args={[1.2, 1.2, 1.2]}
          radius={0.2}
          smoothness={6}
          position={[2.4, 0.9, 0.4]}
          castShadow
        >
          <meshStandardMaterial color="#1d7fd1" roughness={0.3} />
        </RoundedBox>
      </Float>
      <Float speed={2} rotationIntensity={0.8} floatIntensity={0.5}>
        <mesh position={[-1.2, 0.5, 1.9]} rotation={[0.4, 0, 0.8]} castShadow>
          <capsuleGeometry args={[0.3, 0.8, 16, 32]} />
          <meshStandardMaterial color="#e5398f" roughness={0.3} />
        </mesh>
      </Float>
      <Float speed={1.6} rotationIntensity={1}>
        <mesh position={[1.3, 0.45, 2]} rotation={[1.2, 0, 0]} castShadow>
          <torusGeometry args={[0.45, 0.17, 32, 64]} />
          <meshStandardMaterial color="#2ec27e" roughness={0.3} />
        </mesh>
      </Float>
    </>
  );
}

function Effects() {
  const { shape, radius, rotateR, rotateG, rotateB, scatter, greyscale } =
    useControls("Postprocessing - Halftone", {
      shape: {
        value: HalftoneShape.Dot,
        options: {
          Dot: HalftoneShape.Dot,
          Ellipse: HalftoneShape.Ellipse,
          Line: HalftoneShape.Line,
          Square: HalftoneShape.Square,
        },
      },
      radius: { value: 6, min: 1, max: 20, step: 0.5 },
      rotateR: { value: Math.PI / 12, min: 0, max: Math.PI, step: 0.01 },
      rotateG: { value: (Math.PI / 12) * 2, min: 0, max: Math.PI, step: 0.01 },
      rotateB: { value: (Math.PI / 12) * 3, min: 0, max: Math.PI, step: 0.01 },
      scatter: { value: 0, min: 0, max: 1, step: 0.01 },
      greyscale: false,
    });

  return (
    <EffectComposer>
      <Halftone
        shape={shape}
        radius={radius}
        rotateR={rotateR}
        rotateG={rotateG}
        rotateB={rotateB}
        scatter={scatter}
        greyscale={greyscale}
      />
    </EffectComposer>
  );
}

export default function App() {
  return (
    <Canvas shadows camera={{ position: [0, 3, 8], fov: 40 }}>
      <color attach="background" args={["#f4ead5"]} />
      <ambientLight intensity={0.4 * Math.PI} />
      <directionalLight
        position={[4, 6, 5]}
        intensity={1.6 * Math.PI}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      <Backdrop
        receiveShadow
        floor={2}
        segments={40}
        scale={[20, 6, 6]}
        position={[0, -0.2, -2.5]}
      >
        <meshStandardMaterial color="#f4ead5" roughness={1} />
      </Backdrop>
      <ContactShadows position-y={-0.19} opacity={0.5} scale={12} blur={2} />
      <Shapes />
      <Effects />

      <OrbitControls
        target={[0, 0.9, 0]}
        enablePan={false}
        minDistance={5}
        maxDistance={12}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.1}
      />
    </Canvas>
  );
}
