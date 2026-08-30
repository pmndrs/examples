import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useMemo } from "react";
import { N8AOEffect } from "./Effects";

const GRID_SIZE = 14;
const CELL = 0.9;

type BoxData = {
  position: [number, number, number];
  height: number;
};

function useSkyline(): BoxData[] {
  return useMemo(() => {
    const boxes: BoxData[] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let z = 0; z < GRID_SIZE; z++) {
        const height = 0.3 + Math.random() * 2.2;
        boxes.push({
          position: [
            (x - GRID_SIZE / 2 + 0.5) * CELL,
            height / 2,
            (z - GRID_SIZE / 2 + 0.5) * CELL,
          ],
          height,
        });
      }
    }
    return boxes;
  }, []);
}

function Box({ position, height }: BoxData) {
  return (
    <mesh position={position}>
      <boxGeometry args={[CELL, height, CELL]} />
      <meshStandardMaterial color="#d8d8d8" roughness={1} metalness={0} />
    </mesh>
  );
}

export default function App() {
  const boxes = useSkyline();

  return (
    <Canvas camera={{ position: [10, 4, 10], fov: 45 }}>
      <color attach="background" args={["#e7e7ea"]} />
      <ambientLight intensity={0.3 * Math.PI} />
      <directionalLight position={[4, 8, 4]} intensity={0.5 * Math.PI} />

      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#d8d8d8" roughness={1} />
      </mesh>

      {boxes.map((box, i) => (
        <Box key={i} {...box} />
      ))}

      <N8AOEffect />

      <OrbitControls autoRotate autoRotateSpeed={0.4} />
    </Canvas>
  );
}
