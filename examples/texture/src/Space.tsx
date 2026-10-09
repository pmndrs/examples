import { Stars } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const BANDS = ["#d9a066", "#c4824f", "#e8c79a", "#b5693f", "#e0b582"];
const ASTEROIDS = 260;

function Planet() {
  const ref = useRef<THREE.Mesh>(null!);
  const geometry = useMemo(() => {
    const geometry = new THREE.IcosahedronGeometry(6, 4);
    const position = geometry.getAttribute("position");
    const colors = new Float32Array(position.count * 3);
    const color = new THREE.Color();
    // Banded by latitude, one color per face.
    for (let v = 0; v < position.count; v += 3) {
      const y =
        (position.getY(v) + position.getY(v + 1) + position.getY(v + 2)) / 3;
      const band = Math.floor((y / 6 + 1) * 4.5 + Math.sin(y * 3) * 0.6);
      color
        .set(BANDS[((band % BANDS.length) + BANDS.length) % BANDS.length])
        .offsetHSL(0, 0, (Math.random() - 0.5) * 0.04);
      for (let k = 0; k < 3; k++) color.toArray(colors, (v + k) * 3);
    }
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geometry;
  }, []);

  useFrame((_, delta) => (ref.current.rotation.y += delta * 0.03));

  return (
    <group rotation={[0.25, 0, 0.15]}>
      <mesh ref={ref} geometry={geometry}>
        <meshStandardMaterial vertexColors flatShading />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[8, 11.5, 64, 1]} />
        <meshStandardMaterial
          color="#d8c3a0"
          side={THREE.DoubleSide}
          transparent
          opacity={0.6}
          flatShading
        />
      </mesh>
    </group>
  );
}

function Moon() {
  const ref = useRef<THREE.Group>(null!);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.08;
    ref.current.position.set(Math.cos(t) * 18, 3, Math.sin(t) * 18);
    ref.current.rotation.y = t * 2;
  });

  return (
    <group ref={ref}>
      <mesh>
        <icosahedronGeometry args={[1.4, 1]} />
        <meshStandardMaterial color="#b9b6ae" flatShading />
      </mesh>
    </group>
  );
}

function Asteroids() {
  const ref = useRef<THREE.InstancedMesh>(null!);
  const asteroids = useMemo(
    () =>
      Array.from({ length: ASTEROIDS }, () => ({
        angle: Math.random() * Math.PI * 2,
        radius: 24 + Math.random() * 8,
        height: (Math.random() - 0.5) * 2.5,
        size: 0.15 + Math.random() ** 3 * 0.9,
        spin: new THREE.Euler(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          0,
        ),
        speed: 0.01 + Math.random() * 0.02,
      })),
    [],
  );
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useLayoutEffect(() => {
    const color = new THREE.Color();
    asteroids.forEach((_, i) =>
      ref.current.setColorAt(
        i,
        color.set("#8a8178").offsetHSL(0, 0, (Math.random() - 0.5) * 0.15),
      ),
    );
    ref.current.instanceColor!.needsUpdate = true;
  }, [asteroids]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    asteroids.forEach((a, i) => {
      const angle = a.angle + t * a.speed;
      dummy.position.set(
        Math.cos(angle) * a.radius,
        a.height,
        Math.sin(angle) * a.radius,
      );
      dummy.rotation.set(a.spin.x + t * 0.3, a.spin.y + t * 0.2, 0);
      dummy.scale.setScalar(a.size);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, ASTEROIDS]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial flatShading />
    </instancedMesh>
  );
}

export function Space() {
  return (
    <>
      <color attach="background" args={["#05060a"]} />
      <Stars radius={120} depth={60} count={4000} factor={4} fade />
      <ambientLight intensity={0.08 * Math.PI} />
      <directionalLight
        position={[-40, 10, 20]}
        intensity={1.4 * Math.PI}
        color="#fff4e0"
      />
      <mesh position={[-90, 22, 45]}>
        <icosahedronGeometry args={[4, 1]} />
        <meshBasicMaterial color="#fff2c8" />
      </mesh>
      <Planet />
      <Moon />
      <Asteroids />
    </>
  );
}
