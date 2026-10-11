import { useMemo } from "react";
import * as THREE from "three";

const SIZE = 32;
const SEGMENTS = 48;

// Seeded, so the island is the same on every load.
export function createRandom(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};

// Sea level is y = 0; the shore sits around 10 units out.
export function islandHeight(x: number, z: number) {
  const d = Math.hypot(x, z * 1.2);
  const falloff = 1 - smoothstep(4, 13, d);
  const hill = 2.5 * Math.exp(-((x + 3) ** 2 + (z + 2) ** 2) / 18);
  const ripple = 0.25 * Math.sin(x * 0.8) * Math.cos(z * 0.7);
  return 3.2 * falloff - 0.8 + (hill + ripple) * falloff;
}

const BANDS: [number, string][] = [
  [-0.2, "#c9b07a"],
  [0.35, "#e8d6a0"],
  [2.6, "#79a94a"],
  [3.6, "#8fb556"],
  [Infinity, "#9a9486"],
];

function Terrain() {
  const geometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(SIZE, SIZE, SEGMENTS, SEGMENTS)
      .rotateX(-Math.PI / 2)
      .toNonIndexed();
    const position = geometry.getAttribute("position");
    for (let v = 0; v < position.count; v++) {
      position.setY(v, islandHeight(position.getX(v), position.getZ(v)));
    }
    const colors = new Float32Array(position.count * 3);
    const color = new THREE.Color();
    const random = createRandom(5);
    for (let v = 0; v < position.count; v += 3) {
      const y =
        (position.getY(v) + position.getY(v + 1) + position.getY(v + 2)) / 3;
      color
        .set(BANDS.find(([top]) => y <= top)![1])
        .offsetHSL(0, 0, (random() - 0.5) * 0.04);
      for (let k = 0; k < 3; k++) color.toArray(colors, (v + k) * 3);
    }
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.computeVertexNormals();
    return geometry;
  }, []);

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial vertexColors flatShading />
    </mesh>
  );
}

const WALLS = ["#f2e3c6", "#f5d0c5", "#d9e4ec", "#f7ecd0", "#fbe7a1"];
const ROOFS = ["#b5523b", "#8c4a3a", "#5a6270", "#c8693f"];
const PINES = ["#2f6b3a", "#3c7d45", "#28593a"];
const CROWNS = ["#6fae3f", "#8cbf4a", "#5e9a42"];

// A triangular prism along x, apex up: length, height and base width 1.
const roofGeometry = new THREE.CylinderGeometry(1, 1, 1, 3)
  .rotateZ(Math.PI / 2)
  .rotateX(-Math.PI / 2)
  .translate(0, 0.5, 0)
  .scale(1, 1 / 1.5, 1 / Math.sqrt(3));

type Spot = { x: number; y: number; z: number; rotation: number };

function scatter(
  count: number,
  seed: number,
  accept: (x: number, y: number, z: number) => boolean,
): Spot[] {
  const random = createRandom(seed);
  const spots: Spot[] = [];
  for (let i = 0; i < 5000 && spots.length < count; i++) {
    const x = (random() - 0.5) * 18;
    const z = (random() - 0.5) * 18;
    const y = islandHeight(x, z);
    if (!accept(x, y, z)) continue;
    if (spots.some((s) => Math.hypot(s.x - x, s.z - z) < 1.6)) continue;
    spots.push({ x, y, z, rotation: random() * Math.PI * 2 });
  }
  return spots;
}

function Houses() {
  const houses = useMemo(() => {
    const random = createRandom(9);
    return scatter(
      14,
      9,
      (x, y, z) =>
        y > 0.6 && y < 2.6 && z > -1 && Math.hypot(x - 7.5, z + 4) > 2.5,
    ).map((spot) => ({
      ...spot,
      w: 0.9 + random() * 0.4,
      d: 0.8 + random() * 0.3,
      h: 0.7 + random() * 0.4,
      roof: 0.45 + random() * 0.25,
      wall: WALLS[Math.floor(random() * WALLS.length)],
      roofColor: ROOFS[Math.floor(random() * ROOFS.length)],
    }));
  }, []);

  return (
    <>
      {houses.map((h, i) => (
        <group
          key={i}
          position={[h.x, h.y - 0.15, h.z]}
          rotation-y={h.rotation}
        >
          <mesh position-y={h.h / 2} castShadow receiveShadow>
            <boxGeometry args={[h.w, h.h, h.d]} />
            <meshStandardMaterial color={h.wall} flatShading />
          </mesh>
          <mesh
            geometry={roofGeometry}
            position-y={h.h}
            scale={[h.w + 0.1, h.roof, h.d + 0.1]}
            castShadow
          >
            <meshStandardMaterial color={h.roofColor} flatShading />
          </mesh>
        </group>
      ))}
    </>
  );
}

function Trees() {
  const trees = useMemo(() => {
    const random = createRandom(13);
    return scatter(
      26,
      13,
      (x, y, z) =>
        y > 1 && (z < -1 || x < -4) && Math.hypot(x - 7.5, z + 4) > 2,
    ).map((spot) => ({
      ...spot,
      pine: random() < 0.6,
      size: 0.8 + random() * 0.6,
      color: random(),
    }));
  }, []);

  return (
    <>
      {trees.map((t, i) => (
        <group
          key={i}
          position={[t.x, t.y - 0.1, t.z]}
          rotation-y={t.rotation}
          scale={t.size}
        >
          <mesh position-y={0.3} castShadow>
            <cylinderGeometry args={[0.07, 0.1, 0.6, 5]} />
            <meshStandardMaterial color="#6b4a2f" flatShading />
          </mesh>
          {t.pine ? (
            <mesh position-y={1} castShadow>
              <coneGeometry args={[0.5, 1.4, 6]} />
              <meshStandardMaterial
                color={PINES[Math.floor(t.color * PINES.length)]}
                flatShading
              />
            </mesh>
          ) : (
            <mesh position-y={0.95} castShadow>
              <icosahedronGeometry args={[0.5, 0]} />
              <meshStandardMaterial
                color={CROWNS[Math.floor(t.color * CROWNS.length)]}
                flatShading
              />
            </mesh>
          )}
        </group>
      ))}
    </>
  );
}

function Lighthouse() {
  const x = 7.5;
  const z = -4;
  const stripes = 4;
  const stripe = 0.8;

  return (
    <group position={[x, islandHeight(x, z) - 0.2, z]}>
      {Array.from({ length: stripes }, (_, i) => (
        <mesh key={i} position-y={stripe * (i + 0.5)} castShadow>
          <cylinderGeometry
            args={[0.62 - (i + 1) * 0.05, 0.62 - i * 0.05, stripe, 10]}
          />
          <meshStandardMaterial
            color={i % 2 ? "#f4f1e8" : "#c8402f"}
            flatShading
          />
        </mesh>
      ))}
      <mesh position-y={stripes * stripe + 0.05} castShadow>
        <cylinderGeometry args={[0.6, 0.6, 0.1, 10]} />
        <meshStandardMaterial color="#3d3d3d" flatShading />
      </mesh>
      <mesh position-y={stripes * stripe + 0.4}>
        <cylinderGeometry args={[0.32, 0.32, 0.6, 8]} />
        <meshStandardMaterial
          color="#fff3b0"
          emissive="#ffd36b"
          emissiveIntensity={2}
          flatShading
        />
      </mesh>
      <mesh position-y={stripes * stripe + 0.95} castShadow>
        <coneGeometry args={[0.45, 0.5, 10]} />
        <meshStandardMaterial color="#c8402f" flatShading />
      </mesh>
    </group>
  );
}

function Pier() {
  const posts = [9, 10.75, 12.5, 14.25, 16];
  return (
    <group>
      <mesh position={[0, 0.35, 12.5]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.12, 8]} />
        <meshStandardMaterial color="#8a6a48" flatShading />
      </mesh>
      {posts.flatMap((z) =>
        [-0.55, 0.55].map((x) => (
          <mesh key={`${x}-${z}`} position={[x, -0.3, z]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 1.3, 6]} />
            <meshStandardMaterial color="#5e4630" flatShading />
          </mesh>
        )),
      )}
    </group>
  );
}

export function Island() {
  return (
    <>
      <Terrain />
      <Houses />
      <Trees />
      <Lighthouse />
      <Pier />
    </>
  );
}
