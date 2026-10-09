import { useEffect, useMemo } from "react";
import * as THREE from "three";

const TERRAIN_SIZE = 60;
const SEGMENTS = 72;
const RESOLUTION = 256;
const HEIGHT_SCALE = 4;
const BASE = 0.12;
const WATER = 0.07;

export const WATER_LEVEL = WATER * HEIGHT_SCALE;

// A negative height is a basin - the lake.
const HILLS = [
  { x: -8, y: 6, radius: 6, height: 0.85 },
  { x: 8, y: 4, radius: 7, height: 0.7 },
  { x: -14, y: -6, radius: 5, height: 0.5 },
  { x: 14, y: -10, radius: 6, height: 0.55 },
  { x: 0, y: 16, radius: 7, height: 0.6 },
  { x: -18, y: 18, radius: 8, height: 0.7 },
  { x: 2, y: -6, radius: 5, height: -0.16 },
];

const BANDS: [number, string][] = [
  [WATER - 0.005, "#c9b98a"],
  [WATER + 0.03, "#d8c99a"],
  [0.3, "#6fa64a"],
  [0.5, "#86b552"],
  [0.7, "#a7a77a"],
  [1, "#e9e4d6"],
];

// Normalized [0, 1] height at a point in the plane's local (x, y).
function heightAt(x: number, y: number) {
  let h = BASE + 0.03 * Math.sin(x * 0.45) * Math.cos(y * 0.35);
  for (const hill of HILLS) {
    const d2 = (x - hill.x) ** 2 + (y - hill.y) ** 2;
    h += hill.height * Math.exp(-d2 / (hill.radius * hill.radius));
  }
  return THREE.MathUtils.clamp(h, 0, 1);
}

// The plane is rotated -90° around X, so its local y runs along world -z.
export function terrainHeightAt(x: number, z: number) {
  return heightAt(x, -z) * HEIGHT_SCALE;
}

export function terrainNormalAt(x: number, z: number, target: THREE.Vector3) {
  const e = 0.1;
  const dx = (terrainHeightAt(x + e, z) - terrainHeightAt(x - e, z)) / (2 * e);
  const dz = (terrainHeightAt(x, z + e) - terrainHeightAt(x, z - e)) / (2 * e);
  return target.set(-dx, 1, -dz).normalize();
}

// A random point on dry land within `range` of the center.
export function randomLandPoint(range: number) {
  for (;;) {
    const x = (Math.random() - 0.5) * range;
    const z = (Math.random() - 0.5) * range;
    const y = terrainHeightAt(x, z);
    if (y > WATER_LEVEL + 0.3) return new THREE.Vector3(x, y, z);
  }
}

function bandColor(h: number) {
  for (const [top, color] of BANDS) if (h <= top) return color;
  return BANDS[BANDS.length - 1][1];
}

// The hills only exist on the GPU, as a displacement map - the geometry
// itself stays a flat plane, which is all a raycaster ever sees. Its
// per-face colors are the one thing derived from the heights on the CPU.
function useTerrain() {
  const { geometry, displacementMap } = useMemo(() => {
    const data = new Uint8Array(RESOLUTION * RESOLUTION * 4);
    for (let j = 0; j < RESOLUTION; j++) {
      for (let i = 0; i < RESOLUTION; i++) {
        const h = heightAt(
          (i / (RESOLUTION - 1) - 0.5) * TERRAIN_SIZE,
          (j / (RESOLUTION - 1) - 0.5) * TERRAIN_SIZE,
        );
        const k = (j * RESOLUTION + i) * 4;
        data.fill(h * 255, k, k + 4);
      }
    }
    const displacementMap = new THREE.DataTexture(data, RESOLUTION, RESOLUTION);
    displacementMap.magFilter = displacementMap.minFilter = THREE.LinearFilter;
    displacementMap.needsUpdate = true;

    const geometry = new THREE.PlaneGeometry(
      TERRAIN_SIZE,
      TERRAIN_SIZE,
      SEGMENTS,
      SEGMENTS,
    ).toNonIndexed();
    const position = geometry.getAttribute("position");
    const colors = new Float32Array(position.count * 3);
    const color = new THREE.Color();
    for (let v = 0; v < position.count; v += 3) {
      let h = 0;
      for (let k = 0; k < 3; k++) {
        h += heightAt(position.getX(v + k), position.getY(v + k)) / 3;
      }
      color.set(bandColor(h)).offsetHSL(0, 0, (Math.random() - 0.5) * 0.04);
      for (let k = 0; k < 3; k++) color.toArray(colors, (v + k) * 3);
    }
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    return { geometry, displacementMap };
  }, []);

  useEffect(
    () => () => {
      geometry.dispose();
      displacementMap.dispose();
    },
    [geometry, displacementMap],
  );

  return { geometry, displacementMap };
}

export function Terrain() {
  const { geometry, displacementMap } = useTerrain();

  return (
    <mesh
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial
        vertexColors
        flatShading
        displacementMap={displacementMap}
        displacementScale={HEIGHT_SCALE}
        roughness={1}
      />
    </mesh>
  );
}

export function Water() {
  return (
    <mesh
      position-y={WATER_LEVEL}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
    >
      <planeGeometry args={[TERRAIN_SIZE, TERRAIN_SIZE]} />
      <meshStandardMaterial
        color="#4fa3c7"
        transparent
        opacity={0.85}
        roughness={0.2}
      />
    </mesh>
  );
}
