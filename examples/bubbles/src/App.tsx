import {
  Html,
  Icosahedron,
  MeshDistortMaterial,
  useCubeTexture,
  useTexture,
} from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Bloom,
  BrightnessContrast,
  DepthOfField,
  EffectComposer,
  Noise,
  Vignette,
} from "@react-three/postprocessing";
import { Suspense, useRef, useState } from "react";
import * as THREE from "three";

function MainSphere({ material }: { material: THREE.Material }) {
  const main = useRef<THREE.Mesh>(null!);
  // the main sphere rotates following the pointer position
  useFrame(({ clock, pointer }) => {
    main.current.rotation.z = clock.getElapsedTime();
    main.current.rotation.y = THREE.MathUtils.lerp(
      main.current.rotation.y,
      pointer.x * Math.PI,
      0.1,
    );
    main.current.rotation.x = THREE.MathUtils.lerp(
      main.current.rotation.x,
      pointer.y * Math.PI,
      0.1,
    );
  });
  return (
    <Icosahedron
      args={[1, 12]}
      ref={main}
      material={material}
      position={[0, 0, 0]}
    />
  );
}

const initialPositions: [number, number, number][] = [
  [-4, 20, -12],
  [-10, 12, -4],
  [-11, -12, -23],
  [-16, -6, -10],
  [12, -2, -3],
  [13, 4, -12],
  [14, -2, -23],
  [8, 10, -20],
];

function Instances({ material }: { material: THREE.Material }) {
  const sphereRefs = useRef<(THREE.Mesh | null)[]>([]);
  // smaller spheres drift upward and tumble
  useFrame(() => {
    sphereRefs.current.forEach((el) => {
      if (!el) return;
      el.position.y += 0.02;
      if (el.position.y > 19) el.position.y = -18;
      el.rotation.x += 0.06;
      el.rotation.y += 0.06;
      el.rotation.z += 0.02;
    });
  });
  return (
    <>
      <MainSphere material={material} />
      {initialPositions.map((pos, i) => (
        <Icosahedron
          key={i}
          args={[1, 4]}
          position={pos}
          material={material}
          ref={(ref) => {
            sphereRefs.current[i] = ref;
          }}
        />
      ))}
    </>
  );
}

function Scene() {
  const bumpMap = useTexture("/bump.jpg");
  const envMap = useCubeTexture(
    ["px.png", "nx.png", "py.png", "ny.png", "pz.png", "nz.png"],
    { path: "/cube/" },
  );
  // material is created once and shared by every sphere instance
  const [material, setMaterial] = useState<THREE.Material | null>(null);

  return (
    <>
      <MeshDistortMaterial
        ref={setMaterial}
        envMap={envMap}
        envMapIntensity={3}
        bumpMap={bumpMap}
        color="#1a1919"
        roughness={0.1}
        metalness={1}
        bumpScale={0.1}
        clearcoat={1}
        clearcoatRoughness={1}
        radius={1}
        distort={0.4}
      />
      {material && <Instances material={material} />}
    </>
  );
}

export default function App() {
  return (
    <Canvas
      camera={{ position: [0, 0, 3] }}
      gl={{
        powerPreference: "high-performance",
        alpha: false,
        antialias: false,
        stencil: false,
        depth: false,
      }}
    >
      <color attach="background" args={["#252525"]} />
      <fog attach="fog" args={["#161616", 8, 30]} />
      <Suspense fallback={<Html center>Loading.</Html>}>
        <Scene />
      </Suspense>
      <EffectComposer>
        <DepthOfField
          focusDistance={0}
          focalLength={0.02}
          bokehScale={2}
          resolutionY={480}
        />
        <Bloom
          mipmapBlur
          luminanceThreshold={0}
          luminanceSmoothing={0.3}
          intensity={5}
        />
        <BrightnessContrast contrast={0.2} />
        <Noise opacity={0.02} />
        <Vignette offset={0.1} darkness={1.1} />
      </EffectComposer>
    </Canvas>
  );
}
