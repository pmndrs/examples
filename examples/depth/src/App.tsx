import { Instance, Instances, OrbitControls } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { Depth, EffectComposer } from "@react-three/postprocessing";
import { useControls } from "leva";
import { BlendFunction } from "postprocessing";
import { useEffect, useMemo } from "react";

const TREE_COUNT = 400;

type TreeData = {
  position: [number, number, number];
  scale: number;
  color: string;
};

const FOLIAGE = ["#2f6b3a", "#3c7d45", "#4a8c4f", "#28593a"];

function useForest(count: number): TreeData[] {
  return useMemo(
    () =>
      Array.from({ length: count }, () => {
        const distance = 3 + Math.sqrt(Math.random()) * 45;
        const angle = (Math.random() - 0.5) * Math.PI * 1.2;
        return {
          position: [
            Math.sin(angle) * distance,
            0,
            -Math.cos(angle) * distance,
          ],
          scale: 0.7 + Math.random() * 0.8,
          color: FOLIAGE[Math.floor(Math.random() * FOLIAGE.length)],
        };
      }),
    [count],
  );
}

function Forest() {
  const trees = useForest(TREE_COUNT);

  return (
    <>
      <Instances limit={TREE_COUNT}>
        <coneGeometry args={[0.9, 2.6, 8]} />
        <meshStandardMaterial flatShading />
        {trees.map(({ position: [x, , z], scale, color }, i) => (
          <Instance
            key={i}
            position={[x, (0.6 + 1.3) * scale, z]}
            scale={scale}
            color={color}
          />
        ))}
      </Instances>
      <Instances limit={TREE_COUNT}>
        <cylinderGeometry args={[0.15, 0.2, 1.2, 6]} />
        <meshStandardMaterial color="#6b4a2f" />
        {trees.map(({ position: [x, , z], scale }, i) => (
          <Instance key={i} position={[x, 0.6 * scale, z]} scale={scale} />
        ))}
      </Instances>
    </>
  );
}

// The depth buffer holds raw, non-linear perspective depth, so how much of
// the [0, 1] range the scene spreads across is set by the camera's near and
// far planes - not by the effect.
function CameraPlanes({ near, far }: { near: number; far: number }) {
  const camera = useThree((state) => state.camera);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    camera.near = near;
    camera.far = far;
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, near, far, invalidate]);

  return null;
}

export default function App() {
  const { inverted, opacity } = useControls("Postprocessing - Depth", {
    inverted: { value: true },
    opacity: { value: 1, min: 0, max: 1, step: 0.01 },
  });
  const { near, far } = useControls("Camera", {
    near: { value: 4, min: 0.1, max: 10, step: 0.1 },
    far: { value: 200, min: 15, max: 200, step: 1 },
  });

  return (
    <Canvas camera={{ position: [0, 2.5, 8], fov: 50 }}>
      <color attach="background" args={["#bcd7e6"]} />
      <hemisphereLight args={["#e8f4ff", "#4a5a3a", 0.8 * Math.PI]} />
      <directionalLight position={[5, 10, 4]} intensity={0.8 * Math.PI} />
      <CameraPlanes near={near} far={far} />

      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#7d9a5a" />
      </mesh>
      <Forest />

      <EffectComposer>
        {/* Depth defaults to SRC, which ignores opacity - NORMAL mixes it
            over the scene instead. */}
        <Depth
          blendFunction={BlendFunction.NORMAL}
          inverted={inverted}
          opacity={opacity}
        />
      </EffectComposer>

      <OrbitControls
        target={[0, 1.5, -6]}
        minDistance={6}
        maxDistance={20}
        maxPolarAngle={Math.PI / 2.1}
      />
    </Canvas>
  );
}
