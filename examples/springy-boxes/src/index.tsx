import { createRoot } from "react-dom/client";
import * as THREE from "three";
import React, { useRef } from "react";
import { Canvas, useFrame, type ThreeElements } from "@react-three/fiber";
import { useSprings, a, type AnimatedProps } from "@react-spring/three";
import "./styles.css";

const length = 35;
const colors = [
  "#A2CCB6",
  "#FCEEB5",
  "#EE786E",
  "#e0feff",
  "lightpink",
  "lightblue",
];
const data = Array.from({ length }, () => ({
  args: [0.1 + Math.random() * 9, 0.1 + Math.random() * 9, 10] as [
    number,
    number,
    number,
  ],
}));
const random = (i: number) => {
  const r = Math.random();
  return {
    position: [
      100 - Math.random() * 200,
      100 - Math.random() * 200,
      i * 1.5,
    ] as [number, number, number],
    color: colors[Math.round(Math.random() * (colors.length - 1))],
    scale: [1 + r * 14, 1 + r * 14, 1] as [number, number, number],
    rotation: [
      0,
      0,
      THREE.MathUtils.degToRad(Math.round(Math.random()) * 45),
    ] as [number, number, number],
  };
};

function Content() {
  const [springs, set] = useSprings(length, (i) => ({
    from: random(i),
    ...random(i),
    config: { mass: 20, tension: 150, friction: 50 },
  }));
  // Every 3s of *scene* time, not a wall-clock interval: a real timer set at
  // mount fires whenever the machine gets there, and it was never cleared, so
  // each mount stacked another one.
  const elapsed = useRef(0);
  useFrame((_, delta) => {
    elapsed.current += delta;
    if (elapsed.current >= 3) {
      elapsed.current = 0;
      set((i) => ({ ...random(i), delay: i * 40 }));
    }
  });
  return data.map((d, index) => (
    <a.mesh
      key={index}
      // react-spring's MathType typing for Euler-like props can't express a
      // SpringValue<[number, number, number]> for `rotation`, though it
      // animates correctly at runtime
      {...(springs[index] as unknown as AnimatedProps<ThreeElements["mesh"]>)}
      castShadow
      receiveShadow
    >
      <boxGeometry args={d.args} />
      <a.meshStandardMaterial
        color={springs[index].color}
        roughness={0.75}
        metalness={0.5}
      />
    </a.mesh>
  ));
}

createRoot(document.getElementById("root")!).render(
  <Canvas flat shadows camera={{ position: [0, 0, 100], fov: 100 }}>
    <pointLight decay={0} intensity={0.5 * Math.PI} />
    <ambientLight intensity={1.85 * Math.PI} />
    <spotLight
      castShadow
      decay={0}
      intensity={0.2 * Math.PI}
      angle={Math.PI / 7}
      position={[150, 150, 250]}
      penumbra={1}
      shadow-mapSize={2048}
    />
    <Content />
  </Canvas>,
);
