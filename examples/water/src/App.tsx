import { Float, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, type ThreeElements } from "@react-three/fiber";
import { EffectComposer, WaterEffect } from "@react-three/postprocessing";
import { useControls } from "leva";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const POOL_WIDTH = 8;
const POOL_LENGTH = 12;
const POOL_DEPTH = 3;
const WATER_LEVEL = -0.15;
const UNDERWATER = "#1f7fa6";
const TILE = 0.25;

function useTileTexture(repeatX: number, repeatY: number) {
  return useMemo(() => {
    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#8fa6b4";
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = "#eef6fa";
    ctx.fillRect(3, 3, size - 3, size - 3);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(repeatX, repeatY);
    texture.anisotropy = 8;
    return texture;
  }, [repeatX, repeatY]);
}

function TiledPlane({
  width,
  height,
  ...props
}: { width: number; height: number } & ThreeElements["mesh"]) {
  const map = useTileTexture(width / TILE, height / TILE);
  return (
    <mesh {...props}>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial map={map} roughness={0.6} />
    </mesh>
  );
}

function Pool() {
  const lanes = [-2, 0, 2];

  return (
    <group position={[0, -POOL_DEPTH, 0]}>
      <TiledPlane
        width={POOL_WIDTH}
        height={POOL_LENGTH}
        rotation={[-Math.PI / 2, 0, 0]}
      />
      {lanes.map((x) => (
        <mesh key={x} position={[x, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.3, POOL_LENGTH - 2]} />
          <meshStandardMaterial color="#1d3f8f" roughness={0.6} />
        </mesh>
      ))}
      <TiledPlane
        width={POOL_WIDTH}
        height={POOL_DEPTH}
        position={[0, POOL_DEPTH / 2, -POOL_LENGTH / 2]}
      />
      <TiledPlane
        width={POOL_WIDTH}
        height={POOL_DEPTH}
        position={[0, POOL_DEPTH / 2, POOL_LENGTH / 2]}
        rotation={[0, Math.PI, 0]}
      />
      <TiledPlane
        width={POOL_LENGTH}
        height={POOL_DEPTH}
        position={[-POOL_WIDTH / 2, POOL_DEPTH / 2, 0]}
        rotation={[0, Math.PI / 2, 0]}
      />
      <TiledPlane
        width={POOL_LENGTH}
        height={POOL_DEPTH}
        position={[POOL_WIDTH / 2, POOL_DEPTH / 2, 0]}
        rotation={[0, -Math.PI / 2, 0]}
      />
    </group>
  );
}

function Deck() {
  const border = 3;
  const outerWidth = POOL_WIDTH + border * 2;
  const outerLength = POOL_LENGTH + border * 2;
  const shape = useMemo(() => {
    const outer = new THREE.Shape();
    outer.moveTo(-outerWidth / 2, -outerLength / 2);
    outer.lineTo(outerWidth / 2, -outerLength / 2);
    outer.lineTo(outerWidth / 2, outerLength / 2);
    outer.lineTo(-outerWidth / 2, outerLength / 2);
    const hole = new THREE.Path();
    hole.moveTo(-POOL_WIDTH / 2, -POOL_LENGTH / 2);
    hole.lineTo(-POOL_WIDTH / 2, POOL_LENGTH / 2);
    hole.lineTo(POOL_WIDTH / 2, POOL_LENGTH / 2);
    hole.lineTo(POOL_WIDTH / 2, -POOL_LENGTH / 2);
    outer.holes.push(hole);
    return outer;
  }, [outerWidth, outerLength]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <shapeGeometry args={[shape]} />
      <meshStandardMaterial color="#e3d9c6" roughness={0.9} />
    </mesh>
  );
}

function WaterSurface() {
  return (
    <mesh position={[0, WATER_LEVEL, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[POOL_WIDTH, POOL_LENGTH]} />
      <meshStandardMaterial
        color="#3fb8d9"
        emissive="#9fe3f5"
        emissiveIntensity={0.6}
        transparent
        opacity={0.75}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

function Floaties() {
  return (
    <>
      <Float speed={1.2} floatIntensity={0.2} rotationIntensity={0.3}>
        <mesh
          position={[-1.2, WATER_LEVEL, -1]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <torusGeometry args={[0.6, 0.22, 24, 48]} />
          <meshStandardMaterial color="#ff4f4f" roughness={0.3} />
        </mesh>
      </Float>
      <Float speed={1} floatIntensity={0.2} rotationIntensity={0.6}>
        <mesh position={[1.4, WATER_LEVEL + 0.25, -2.5]}>
          <sphereGeometry args={[0.4, 32, 32]} />
          <meshStandardMaterial color="#ffd23f" roughness={0.3} />
        </mesh>
      </Float>
    </>
  );
}

const DIVING_RINGS = [
  { position: [-0.8, 0.06, -2.5], color: "#ff7a1a" },
  { position: [0.6, 0.06, -1.2], color: "#c13bff" },
  { position: [1.6, 0.06, -3.6], color: "#2fd16b" },
] as const;

function DivingRings() {
  return (
    <group position={[0, -POOL_DEPTH, 0]}>
      {DIVING_RINGS.map(({ position, color }, i) => (
        <mesh key={i} position={position} rotation={[-Math.PI / 2, 0, i]}>
          <torusGeometry args={[0.25, 0.05, 12, 32]} />
          <meshStandardMaterial color={color} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

const BUBBLE_COUNT = 60;

function Bubbles() {
  const ref = useRef<THREE.InstancedMesh>(null!);
  const bubbles = useMemo(
    () =>
      Array.from({ length: BUBBLE_COUNT }, () => ({
        x: (Math.random() - 0.5) * (POOL_WIDTH - 1),
        y: -POOL_DEPTH + Math.random() * (POOL_DEPTH + WATER_LEVEL),
        z: (Math.random() - 0.5) * (POOL_LENGTH - 1),
        speed: 0.3 + Math.random() * 0.5,
        scale: 0.02 + Math.random() * 0.04,
      })),
    [],
  );
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((_, delta) => {
    bubbles.forEach((bubble, i) => {
      bubble.y += bubble.speed * delta;
      if (bubble.y > WATER_LEVEL) bubble.y = -POOL_DEPTH;
      dummy.position.set(bubble.x, bubble.y, bubble.z);
      dummy.scale.setScalar(bubble.scale);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, BUBBLE_COUNT]}>
      <sphereGeometry args={[1, 12, 12]} />
      <meshStandardMaterial
        color="#ffffff"
        emissive="#cfefff"
        emissiveIntensity={0.4}
        transparent
        opacity={0.6}
      />
    </instancedMesh>
  );
}

export default function App() {
  const { factor } = useControls("Postprocessing - Water", {
    factor: { value: 2, min: 0, max: 5, step: 0.01 },
  });

  return (
    <Canvas camera={{ position: [0, -2.2, 3.5], fov: 60 }}>
      <color attach="background" args={[UNDERWATER]} />
      <fog attach="fog" args={[UNDERWATER, 1, 14]} />
      <hemisphereLight args={["#ffffff", "#8fa6b4", 0.9 * Math.PI]} />
      <directionalLight position={[4, 10, 6]} intensity={0.9 * Math.PI} />

      <Pool />
      <Deck />
      <WaterSurface />
      <Floaties />
      <DivingRings />
      <Bubbles />

      <EffectComposer>
        <WaterEffect factor={factor} />
      </EffectComposer>

      <OrbitControls
        target={[0, -1.4, 0]}
        minPolarAngle={Math.PI * 0.42}
        maxPolarAngle={Math.PI * 0.58}
        minDistance={1.5}
        maxDistance={3.6}
        enablePan={false}
      />
    </Canvas>
  );
}
