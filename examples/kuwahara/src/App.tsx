import {
  ContactShadows,
  Environment,
  OrbitControls,
  useGLTF,
} from "@react-three/drei";
import { Canvas, type ThreeElements } from "@react-three/fiber";
import {
  EffectComposer,
  EffectGroup,
  Kuwahara,
  ToneMapping,
} from "@react-three/postprocessing";
import { useControls } from "leva";
import { ToneMappingMode } from "postprocessing";
import { Suspense } from "react";
import appleUrl from "./models/food_apple_01-transformed.glb?url";
import lemonUrl from "./models/lemon-transformed.glb?url";

// Poly Haven scans, in metres, with their origin at the base.
function Fruit({ url, ...props }: { url: string } & ThreeElements["group"]) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} {...props} />;
}

function Effects() {
  const { enabled, opacity, radius, sectorCount } = useControls(
    "Postprocessing - Kuwahara",
    {
      enabled: true,
      opacity: { value: 1, min: 0, max: 1, step: 0.01 },
      radius: { value: 10, min: 1, max: 15, step: 1 },
      sectorCount: { value: 4, min: 2, max: 12, step: 1 },
    },
  );

  return (
    <EffectComposer>
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <EffectGroup enabled={enabled}>
        <Kuwahara opacity={opacity} radius={radius} sectorCount={sectorCount} />
      </EffectGroup>
    </EffectComposer>
  );
}

export default function App() {
  return (
    <Canvas camera={{ position: [0, 0.1, 0.36], fov: 30, near: 0.01 }}>
      <color attach="background" args={["#5b6b52"]} />
      <ambientLight intensity={0.5 * Math.PI} />
      <directionalLight position={[-0.5, 1, 0.6]} intensity={Math.PI} />

      <Suspense fallback={null}>
        <Environment preset="park" />
        <Fruit url={appleUrl} position={[-0.05, 0, 0]} rotation-y={0.8} />
        {/* Lying on its side, raised by its radius to rest on the floor. */}
        <Fruit
          url={lemonUrl}
          position={[0.06, 0.034, 0.03]}
          rotation={[Math.PI / 2, 0, 0.5]}
        />
      </Suspense>
      <ContactShadows opacity={0.5} scale={1.5} blur={1} far={0.2} />
      <Effects />

      <OrbitControls
        target={[0, 0.04, 0]}
        enablePan={false}
        minDistance={0.2}
        maxDistance={0.8}
        maxPolarAngle={Math.PI / 2.1}
      />
    </Canvas>
  );
}

useGLTF.preload(appleUrl);
useGLTF.preload(lemonUrl);
