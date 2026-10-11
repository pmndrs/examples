import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  EffectComposer,
  Linocut,
  type LinocutEffect,
  ToneMapping,
} from "@react-three/postprocessing";
import { useControls } from "leva";
import { ToneMappingMode } from "postprocessing";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Boat, Sea } from "./Ocean";

const HORIZON = "#e9e4d8";
const MOON = new THREE.Vector3(-14, 16, -90);

function Sky() {
  const geometry = useMemo(() => {
    const geometry = new THREE.SphereGeometry(300, 32, 24);
    const position = geometry.getAttribute("position");
    const colors = new Float32Array(position.count * 3);
    const horizon = new THREE.Color(HORIZON);
    const zenith = new THREE.Color("#5d6f86");
    const color = new THREE.Color();
    for (let v = 0; v < position.count; v++) {
      const h = Math.max(position.getY(v) / 300, 0);
      color.lerpColors(horizon, zenith, Math.min(h * 2, 1));
      color.toArray(colors, v * 3);
    }
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geometry;
  }, []);

  return (
    <>
      <mesh geometry={geometry}>
        <meshBasicMaterial vertexColors side={THREE.BackSide} fog={false} />
      </mesh>
      <mesh position={MOON}>
        <sphereGeometry args={[7, 48, 32]} />
        <meshBasicMaterial color="#fffaf0" fog={false} toneMapped={false} />
      </mesh>
    </>
  );
}

function Effects() {
  const { enabled, opacity, scale, noiseScale, rotation, followMoon, center } =
    useControls("Postprocessing - Linocut", {
      enabled: true,
      opacity: { value: 1, min: 0, max: 1, step: 0.01 },
      scale: { value: 0.85, min: 0, max: 1, step: 0.01 },
      noiseScale: { value: 0.1, min: 0, max: 1, step: 0.01 },
      rotation: { value: 0, min: -Math.PI, max: Math.PI, step: 0.01 },
      followMoon: { value: true, label: "center on moon" },
      center: {
        value: [0.5, 0.5],
        min: 0,
        max: 1,
        step: 0.01,
        render: (get) => !get("Postprocessing - Linocut.followMoon"),
      },
    });

  // The line pattern swirls around `center`, in screen space - keeping it on
  // the moon makes the carved lines ring out from it as the camera moves.
  const effect = useRef<LinocutEffect>(null);
  const projected = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera }) => {
    if (!followMoon || !effect.current) return;
    projected.copy(MOON).project(camera);
    effect.current.center.set(projected.x * 0.5 + 0.5, projected.y * 0.5 + 0.5);
  });

  return (
    <EffectComposer>
      {enabled ? (
        <Linocut
          ref={effect}
          opacity={opacity}
          scale={scale}
          noiseScale={noiseScale}
          rotation={rotation}
          center={followMoon ? undefined : (center as [number, number])}
        />
      ) : (
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      )}
    </EffectComposer>
  );
}

export default function App() {
  return (
    <Canvas camera={{ position: [0, 3, 14], fov: 50 }}>
      <fog attach="fog" args={[HORIZON, 40, 160]} />
      <hemisphereLight args={["#f2efe6", "#5d6f86", 0.9 * Math.PI]} />
      <directionalLight
        position={MOON}
        intensity={1.6 * Math.PI}
        color="#fff6e6"
      />

      <Sky />
      <Sea />
      <Boat x={3} z={2} />
      <Effects />

      <OrbitControls
        target={[0, 4, -20]}
        enablePan={false}
        minDistance={20}
        maxDistance={45}
        minPolarAngle={Math.PI / 2.6}
        maxPolarAngle={Math.PI / 1.9}
      />
    </Canvas>
  );
}
