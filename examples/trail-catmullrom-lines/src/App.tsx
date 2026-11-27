import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Trail, CatmullRomLine, Float, OrbitControls } from "@react-three/drei";
import { useControls } from "leva";
import * as THREE from "three";

// 3D Spline Points for CatmullRom Curve
const CURVE_POINTS: [number, number, number][] = [
  [-4, 0, 0],
  [-2.5, 2.5, 2],
  [0, 3, -1.5],
  [2.5, 1.5, 2.5],
  [4, -1, 0],
  [2, -3, -2],
  [-1, -2, 1],
  [-3, -1.5, -2],
];

interface MovingOrbProps {
  curve: THREE.CatmullRomCurve3;
  speed: number;
  offset: number;
  trailColor: string;
  orbColor: string;
  trailWidth: number;
  trailLength: number;
}

function MovingOrb({
  curve,
  speed,
  offset,
  trailColor,
  orbColor,
  trailWidth,
  trailLength,
}: MovingOrbProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = (state.clock.getElapsedTime() * speed * 0.15 + offset) % 1;
    const point = curve.getPointAt(t);
    meshRef.current.position.copy(point);
  });

  return (
    <Trail
      width={trailWidth}
      length={trailLength}
      color={trailColor}
      attenuation={(t: number) => t * t}
    >
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.22, 32, 32]} />
        <meshStandardMaterial
          color={orbColor}
          emissive={orbColor}
          emissiveIntensity={2.5}
          roughness={0.2}
          metalness={0.8}
        />
        <pointLight color={orbColor} intensity={1.5} distance={3} />
      </mesh>
    </Trail>
  );
}

function Scene() {
  const {
    trailWidth,
    trailLength,
    orbSpeed,
    trailColor1,
    trailColor2,
    lineWidth,
    lineColor,
    lineTension,
    floatSpeed,
    floatIntensity,
  } = useControls({
    trailWidth: { value: 1.8, min: 0.5, max: 5, step: 0.1 },
    trailLength: { value: 16, min: 4, max: 32, step: 1 },
    orbSpeed: { value: 1.2, min: 0.2, max: 3, step: 0.1 },
    trailColor1: "#06b6d4",
    trailColor2: "#ec4899",
    lineWidth: { value: 1.5, min: 0.5, max: 4, step: 0.1 },
    lineColor: "#334155",
    lineTension: { value: 0.5, min: 0, max: 1, step: 0.05 },
    floatSpeed: { value: 1.5, min: 0, max: 5, step: 0.1 },
    floatIntensity: { value: 1, min: 0, max: 3, step: 0.1 },
  });

  const curve = useMemo(() => {
    const pts = CURVE_POINTS.map(([x, y, z]) => new THREE.Vector3(x, y, z));
    const c = new THREE.CatmullRomCurve3(pts, true, "catmullrom", lineTension);
    return c;
  }, [lineTension]);

  return (
    <>
      <color attach="background" args={["#05070d"]} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} />

      <Float
        speed={floatSpeed}
        rotationIntensity={0.6}
        floatIntensity={floatIntensity}
      >
        {/* CatmullRom Spline Curve Guide */}
        <CatmullRomLine
          points={CURVE_POINTS}
          closed
          curveType="catmullrom"
          tension={lineTension}
          color={lineColor}
          lineWidth={lineWidth}
          transparent
          opacity={0.6}
        />

        {/* Primary Cyan Trail */}
        <MovingOrb
          curve={curve}
          speed={orbSpeed}
          offset={0}
          trailColor={trailColor1}
          orbColor={trailColor1}
          trailWidth={trailWidth}
          trailLength={trailLength}
        />

        {/* Secondary Pink Trail (Opposite phase) */}
        <MovingOrb
          curve={curve}
          speed={orbSpeed}
          offset={0.5}
          trailColor={trailColor2}
          orbColor={trailColor2}
          trailWidth={trailWidth * 0.85}
          trailLength={trailLength}
        />
      </Float>

      <OrbitControls makeDefault enableDamping dampingFactor={0.05} />
    </>
  );
}

export default function App() {
  return (
    <Canvas camera={{ position: [0, 2, 10], fov: 45 }}>
      <Scene />
    </Canvas>
  );
}
