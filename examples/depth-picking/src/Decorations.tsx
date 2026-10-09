import { useMemo } from "react";
import { randomLandPoint } from "./Terrain";

const ROCKS = 22;
const BUSHES = 30;
const ROCK_COLORS = ["#8d8a83", "#a19d94", "#77736c"];
const BUSH_COLORS = ["#4f8a3a", "#5e9a42", "#3f7a33"];

function pick<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function Rocks() {
  const rocks = useMemo(
    () =>
      Array.from({ length: ROCKS }, () => {
        const size = 0.25 + Math.random() * 0.5;
        const position = randomLandPoint(44);
        position.y -= size * 0.3;
        return {
          position,
          scale: [size * 1.3, size * 0.8, size] as const,
          rotation: [
            0,
            Math.random() * Math.PI * 2,
            Math.random() * 0.4,
          ] as const,
          color: pick(ROCK_COLORS),
        };
      }),
    [],
  );

  return (
    <>
      {rocks.map(({ position, scale, rotation, color }, i) => (
        <mesh
          key={i}
          position={position}
          scale={scale}
          rotation={rotation}
          castShadow
          receiveShadow
        >
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={color} flatShading />
        </mesh>
      ))}
    </>
  );
}

function Bushes() {
  const bushes = useMemo(
    () =>
      Array.from({ length: BUSHES }, () => ({
        position: randomLandPoint(44),
        color: pick(BUSH_COLORS),
        blobs: Array.from(
          { length: 2 + Math.floor(Math.random() * 2) },
          () =>
            ({
              offset: [
                (Math.random() - 0.5) * 0.5,
                0.15,
                (Math.random() - 0.5) * 0.5,
              ],
              size: 0.2 + Math.random() * 0.15,
            }) as const,
        ),
      })),
    [],
  );

  return (
    <>
      {bushes.map(({ position, color, blobs }, i) => (
        <group key={i} position={position}>
          {blobs.map(({ offset, size }, j) => (
            <mesh key={j} position={offset} scale={size} castShadow>
              <icosahedronGeometry args={[1, 0]} />
              <meshStandardMaterial color={color} flatShading />
            </mesh>
          ))}
        </group>
      ))}
    </>
  );
}

export function Decorations() {
  return (
    <>
      <Rocks />
      <Bushes />
    </>
  );
}
