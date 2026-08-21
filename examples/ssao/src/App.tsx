import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, SSAO } from "@react-three/postprocessing";
import { useControls } from "leva";
import { type SSAOEffect } from "postprocessing";
import { useEffect, useMemo, useRef } from "react";

type BlobData = {
  position: [number, number, number];
  scale: number;
  shape: "sphere" | "box";
};

function useCluster(count: number): BlobData[] {
  return useMemo(
    () =>
      Array.from({ length: count }, () => ({
        position: [
          (Math.random() - 0.5) * 7,
          Math.random() * 2.4,
          (Math.random() - 0.5) * 7,
        ] as [number, number, number],
        scale: 0.35 + Math.random() * 0.55,
        shape: Math.random() > 0.4 ? "sphere" : "box",
      })),
    [count],
  );
}

function Blob({ position, scale, shape }: BlobData) {
  return (
    <mesh position={position} scale={scale}>
      {shape === "sphere" ? (
        <sphereGeometry args={[0.6, 32, 32]} />
      ) : (
        <boxGeometry args={[0.9, 0.9, 0.9]} />
      )}
      <meshStandardMaterial color="#d8d8d8" roughness={1} metalness={0} />
    </mesh>
  );
}

function AmbientOcclusion({
  enabled,
  intensity,
  radius,
  bias,
  luminanceInfluence,
  samples,
  rings,
}: {
  enabled: boolean;
  intensity: number;
  radius: number;
  bias: number;
  luminanceInfluence: number;
  samples: number;
  rings: number;
}) {
  const ref = useRef<SSAOEffect>(null);

  useEffect(() => {
    const effect = ref.current;
    if (!effect) return;
    // Toggle via opacity rather than unmounting: EffectComposer renders a
    // black screen if enableNormalPass is on but zero Effect children remain.
    effect.blendMode.setOpacity(enabled ? 1 : 0);
    effect.intensity = intensity;
    effect.radius = radius;
    effect.samples = samples;
    effect.rings = rings;
    // postprocessing's type declaration for luminanceInfluence is wrong (says
    // boolean, actually a 0..1 number) — see SSAOEffect's own JSDoc above it.
    // @ts-expect-error
    effect.luminanceInfluence = luminanceInfluence;
    effect.ssaoMaterial.bias = bias;
  }, [enabled, intensity, radius, bias, luminanceInfluence, samples, rings]);

  return <SSAO ref={ref} />;
}

export default function App() {
  const cluster = useCluster(100);

  const {
    enabled,
    intensity,
    radius,
    bias,
    luminanceInfluence,
    samples,
    rings,
  } = useControls("Postprocessing - SSAO", {
    enabled: { value: true },
    intensity: { value: 1.5, min: 0, max: 8, step: 0.1 },
    radius: { value: 0.05, min: 0.01, max: 1, step: 0.01 },
    bias: { value: 0.03, min: 0, max: 0.2, step: 0.005 },
    luminanceInfluence: { value: 0.2, min: 0, max: 1, step: 0.01 },
    samples: { value: 30, min: 1, max: 64, step: 1 },
    rings: { value: 4, min: 1, max: 16, step: 1 },
  });

  return (
    <Canvas camera={{ position: [5, 4, 7], fov: 50 }}>
      <color attach="background" args={["#e7e7ea"]} />
      <ambientLight intensity={0.9 * Math.PI} />
      <directionalLight position={[4, 8, 4]} intensity={0.7 * Math.PI} />

      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#d8d8d8" roughness={1} />
      </mesh>

      {cluster.map((blob, i) => (
        <Blob key={i} {...blob} />
      ))}

      <EffectComposer enableNormalPass>
        <AmbientOcclusion
          enabled={enabled}
          intensity={intensity}
          radius={radius}
          bias={bias}
          luminanceInfluence={luminanceInfluence}
          samples={samples}
          rings={rings}
        />
      </EffectComposer>

      <OrbitControls autoRotate autoRotateSpeed={0.4} />
    </Canvas>
  );
}
