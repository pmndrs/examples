import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

export const SUN_DIRECTION = new THREE.Vector3(-0.78, 0.12, -0.62).normalize();
export const HORIZON = "#f2a46b";

function Sky() {
  const geometry = useMemo(() => {
    const geometry = new THREE.SphereGeometry(150, 32, 24);
    const position = geometry.getAttribute("position");
    const colors = new Float32Array(position.count * 3);
    const zenith = new THREE.Color("#2b4f8c");
    const blush = new THREE.Color("#e8968a");
    const horizon = new THREE.Color(HORIZON);
    const color = new THREE.Color();
    for (let v = 0; v < position.count; v++) {
      const h = position.getY(v) / 150;
      if (h < 0.08) color.copy(horizon);
      else if (h < 0.3) color.lerpColors(horizon, blush, (h - 0.08) / 0.22);
      else color.lerpColors(blush, zenith, Math.min((h - 0.3) / 0.5, 1));
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
      <mesh position={SUN_DIRECTION.clone().multiplyScalar(140)}>
        <sphereGeometry args={[7, 24, 16]} />
        <meshBasicMaterial color="#ffe2b0" fog={false} toneMapped={false} />
      </mesh>
    </>
  );
}

function Sea() {
  const geometry = useMemo(
    () => new THREE.PlaneGeometry(220, 220, 90, 90).rotateX(-Math.PI / 2),
    [],
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const position = geometry.getAttribute("position");
    for (let v = 0; v < position.count; v++) {
      const x = position.getX(v);
      const z = position.getZ(v);
      position.setY(
        v,
        0.12 * Math.sin(x * 0.35 + t) + 0.1 * Math.cos(z * 0.3 + t * 0.8),
      );
    }
    position.needsUpdate = true;
  });

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial
        color="#2f7fa3"
        roughness={0.35}
        metalness={0.1}
        flatShading
      />
    </mesh>
  );
}

const BOATS = [
  { position: [2, 0, 12.5], rotation: 0.3, hull: "#b5523b", speed: 1.1 },
  { position: [-2.2, 0, 14.5], rotation: -0.4, hull: "#3a6ea5", speed: 0.9 },
  { position: [3.4, 0, 17], rotation: 1.2, hull: "#f2e3c6", speed: 1.3 },
  { position: [-9, 0, 15], rotation: 2.4, hull: "#3a6ea5", speed: 0.8 },
] as const;

const sailShape = new THREE.Shape()
  .moveTo(0, 0)
  .lineTo(0, 1.4)
  .lineTo(0.9, 0)
  .closePath();

function Boat({ position, rotation, hull, speed }: (typeof BOATS)[number]) {
  const ref = useRef<THREE.Group>(null!);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed;
    ref.current.position.y = Math.sin(t) * 0.08;
    ref.current.rotation.z = Math.sin(t * 0.8) * 0.06;
  });

  return (
    <group position={position} rotation-y={rotation}>
      <group ref={ref}>
        <mesh position-y={0.1} castShadow>
          <boxGeometry args={[1.6, 0.35, 0.6]} />
          <meshStandardMaterial color={hull} flatShading />
        </mesh>
        <mesh position={[-0.2, 0.35, 0]} castShadow>
          <boxGeometry args={[0.5, 0.3, 0.45]} />
          <meshStandardMaterial color="#f4f1e8" flatShading />
        </mesh>
        <mesh position={[0.25, 0.28, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 1.6, 5]} />
          <meshStandardMaterial color="#5e4630" />
        </mesh>
        <mesh position={[0.28, 0.4, 0]} castShadow>
          <shapeGeometry args={[sailShape]} />
          <meshStandardMaterial
            color="#f7f3e8"
            side={THREE.DoubleSide}
            flatShading
          />
        </mesh>
      </group>
    </group>
  );
}

export function Surroundings() {
  return (
    <>
      <Sky />
      <Sea />
      {BOATS.map((boat, i) => (
        <Boat key={i} {...boat} />
      ))}
    </>
  );
}
