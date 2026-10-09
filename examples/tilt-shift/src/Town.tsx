import { Instance, Instances } from "@react-three/drei";
import { useMemo, type ReactNode } from "react";
import * as THREE from "three";

export const BLOCK = 6;
export const ROAD = 1.6;
export const BLOCKS = 5;
export const PITCH = BLOCK + ROAD;
export const CITY = BLOCKS * PITCH + ROAD;
export const ROAD_CENTERS = Array.from(
  { length: BLOCKS + 1 },
  (_, i) => (i - BLOCKS / 2) * PITCH,
);

const SLAB = 0.14;

type BlockType = "houses" | "towers" | "park";

const LAYOUT: BlockType[][] = [
  ["houses", "houses", "park", "houses", "houses"],
  ["houses", "houses", "houses", "towers", "houses"],
  ["park", "houses", "towers", "towers", "houses"],
  ["houses", "houses", "houses", "houses", "park"],
  ["houses", "park", "houses", "houses", "houses"],
];

const WALLS = [
  "#f2e3c6",
  "#f5d0c5",
  "#d9e4ec",
  "#f7ecd0",
  "#e8d5e8",
  "#fbe7a1",
  "#cfe3c4",
];
const ROOFS = ["#b5523b", "#8c4a3a", "#5a6270", "#c8693f", "#7a3f35"];
const TOWERS = ["#e8e4dc", "#cfd8dc", "#d7ccc8", "#b0bec5"];
const PINES = ["#2f6b3a", "#3c7d45", "#28593a"];
const CROWNS = ["#6fae3f", "#8cbf4a", "#5e9a42", "#a8c94f"];

// Seeded, so the town is the same on every load.
export function createRandom(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Item = {
  position: THREE.Vector3Tuple;
  scale: THREE.Vector3Tuple;
  rotation?: number;
  color?: string;
};

type Town = {
  walls: Item[];
  roofs: Item[];
  slabs: Item[];
  trunks: Item[];
  crowns: Item[];
  pines: Item[];
  dashes: Item[];
};

function generateTown(): Town {
  const random = createRandom(7);
  const between = (min: number, max: number) => min + random() * (max - min);
  const pick = <T,>(items: T[]) => items[Math.floor(random() * items.length)];
  const town: Town = {
    walls: [],
    roofs: [],
    slabs: [],
    trunks: [],
    crowns: [],
    pines: [],
    dashes: [],
  };

  const tree = (x: number, y: number, z: number, size: number) => {
    const trunk = 0.35 * size;
    town.trunks.push({ position: [x, y, z], scale: [size, trunk, size] });
    if (random() < 0.4) {
      town.pines.push({
        position: [x, y + trunk * 0.6, z],
        scale: [0.45 * size, 1.2 * size, 0.45 * size],
        rotation: random() * Math.PI,
        color: pick(PINES),
      });
    } else {
      const r = 0.45 * size;
      town.crowns.push({
        position: [x, y + trunk + r * 0.7, z],
        scale: [r, r, r],
        rotation: random() * Math.PI,
        color: pick(CROWNS),
      });
    }
  };

  const houses = (cx: number, cz: number) => {
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const x = cx + i * 1.85;
        const z = cz + j * 1.85;
        if (i === 0 && j === 0) {
          tree(x, SLAB, z, between(1.4, 1.9));
          continue;
        }
        const w = between(1.1, 1.5);
        const d = between(1, 1.35);
        const h = between(0.7, 1.25);
        const rotation = random() < 0.5 ? 0 : Math.PI / 2;
        town.walls.push({
          position: [x, SLAB, z],
          scale: [w, h, d],
          rotation,
          color: pick(WALLS),
        });
        town.roofs.push({
          position: [x, SLAB + h, z],
          scale: [w + 0.1, between(0.45, 0.7), d + 0.1],
          rotation,
          color: pick(ROOFS),
        });
      }
    }
  };

  const towers = (cx: number, cz: number) => {
    for (const i of [-1, 1]) {
      for (const j of [-1, 1]) {
        const x = cx + i * 1.4;
        const z = cz + j * 1.4;
        const h = between(2.5, 6);
        const w = between(1.8, 2.3);
        town.walls.push({
          position: [x, SLAB, z],
          scale: [w, h, w],
          color: pick(TOWERS),
        });
        town.walls.push({
          position: [x, SLAB + h, z],
          scale: [w * 0.4, 0.3, w * 0.3],
          color: "#9aa3a8",
        });
      }
    }
  };

  const park = (cx: number, cz: number) => {
    for (let k = 0; k < 9; k++) {
      const angle = (k / 9) * Math.PI * 2 + random() * 0.3;
      const radius = between(1.9, 2.4);
      tree(
        cx + Math.cos(angle) * radius,
        SLAB,
        cz + Math.sin(angle) * radius,
        between(1.1, 1.7),
      );
    }
  };

  LAYOUT.forEach((row, j) =>
    row.forEach((type, i) => {
      const cx = (i - (BLOCKS - 1) / 2) * PITCH;
      const cz = (j - (BLOCKS - 1) / 2) * PITCH;
      town.slabs.push({
        position: [cx, 0, cz],
        scale: [BLOCK, SLAB - 0.02, BLOCK],
        color: "#d9d6cf",
      });
      town.slabs.push({
        position: [cx, 0, cz],
        scale: [BLOCK - 0.5, SLAB, BLOCK - 0.5],
        color: type === "towers" ? "#cfc8bb" : "#8cc152",
      });
      if (type === "houses") houses(cx, cz);
      else if (type === "towers") towers(cx, cz);
      else park(cx, cz);
    }),
  );

  // Dashed center lines, skipping the intersections.
  for (const c of ROAD_CENTERS) {
    for (let t = -CITY / 2 + 0.5; t < CITY / 2; t += 1) {
      if (ROAD_CENTERS.some((r) => Math.abs(t - r) < ROAD / 2 + 0.2)) continue;
      town.dashes.push({ position: [t, 0.01, c], scale: [0.5, 0.01, 0.07] });
      town.dashes.push({ position: [c, 0.01, t], scale: [0.07, 0.01, 0.5] });
    }
  }

  // A forest around the outskirts.
  for (let k = 0; k < 160; k++) {
    const angle = random() * Math.PI * 2;
    const radius = between(CITY / 2 + 2, CITY / 2 + 16);
    tree(
      Math.cos(angle) * radius,
      0,
      Math.sin(angle) * radius,
      between(1.2, 2.2),
    );
  }

  return town;
}

function useGeometries() {
  return useMemo(() => {
    // Unit shapes standing on y = 0, so an item's scale is its size.
    const box = new THREE.BoxGeometry().translate(0, 0.5, 0);
    // A triangular prism along x, apex up: length, height and base width 1.
    const roof = new THREE.CylinderGeometry(1, 1, 1, 3)
      .rotateZ(Math.PI / 2)
      .rotateX(-Math.PI / 2)
      .translate(0, 0.5, 0)
      .scale(1, 1 / 1.5, 1 / Math.sqrt(3));
    const trunk = new THREE.CylinderGeometry(0.06, 0.09, 1, 5).translate(
      0,
      0.5,
      0,
    );
    const crown = new THREE.IcosahedronGeometry(1, 0);
    const pine = new THREE.ConeGeometry(1, 1, 6).translate(0, 0.5, 0);
    return { box, roof, trunk, crown, pine };
  }, []);
}

function Batch({
  items,
  geometry,
  children,
  shadows = true,
}: {
  items: Item[];
  geometry: THREE.BufferGeometry;
  children: ReactNode;
  shadows?: boolean;
}) {
  return (
    <Instances
      limit={items.length}
      geometry={geometry}
      castShadow={shadows}
      receiveShadow
    >
      {children}
      {items.map(({ position, scale, rotation = 0, color }, i) => (
        <Instance
          key={i}
          position={position}
          scale={scale}
          rotation-y={rotation}
          color={color}
        />
      ))}
    </Instances>
  );
}

export function Town() {
  const town = useMemo(generateTown, []);
  const { box, roof, trunk, crown, pine } = useGeometries();

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#7fb24a" />
      </mesh>
      <mesh position-y={0.005} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[CITY, CITY]} />
        <meshStandardMaterial color="#4a4d52" />
      </mesh>

      <Batch items={town.slabs} geometry={box} shadows={false}>
        <meshStandardMaterial />
      </Batch>
      <Batch items={town.dashes} geometry={box} shadows={false}>
        <meshStandardMaterial color="#f4f1e8" />
      </Batch>
      <Batch items={town.walls} geometry={box}>
        <meshStandardMaterial flatShading />
      </Batch>
      <Batch items={town.roofs} geometry={roof}>
        <meshStandardMaterial flatShading />
      </Batch>
      <Batch items={town.trunks} geometry={trunk}>
        <meshStandardMaterial color="#6b4a2f" flatShading />
      </Batch>
      <Batch items={town.crowns} geometry={crown}>
        <meshStandardMaterial flatShading />
      </Batch>
      <Batch items={town.pines} geometry={pine}>
        <meshStandardMaterial flatShading />
      </Batch>
    </>
  );
}
