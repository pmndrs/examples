import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

// Direction, amplitude, wavelength, speed. Shared by the vertex shader and the
// boat, so the boat rides the same surface the sea draws.
const WAVES = [
  { dir: [1, 0.3], amplitude: 0.7, length: 20, speed: 1.1 },
  { dir: [-0.4, 1], amplitude: 0.4, length: 10, speed: 1.6 },
  { dir: [0.7, -0.6], amplitude: 0.22, length: 5.5, speed: 2.2 },
  { dir: [0.2, 1], amplitude: 0.1, length: 2.7, speed: 3 },
].map(({ dir, amplitude, length, speed }) => {
  const d = new THREE.Vector2(dir[0], dir[1]).normalize();
  return { dir: d, amplitude, k: (Math.PI * 2) / length, speed };
});

// Height and its x/z slopes at a point on the sea.
export function wave(x: number, z: number, t: number) {
  let h = 0;
  let dx = 0;
  let dz = 0;
  for (const w of WAVES) {
    const phase = w.k * (w.dir.x * x + w.dir.y * z) + t * w.speed;
    h += w.amplitude * Math.sin(phase);
    const slope = w.amplitude * w.k * Math.cos(phase);
    dx += slope * w.dir.x;
    dz += slope * w.dir.y;
  }
  return { h, dx, dz };
}

const waveChunk = /* glsl */ `
  uniform float uTime;
  uniform vec4 uWaves[${WAVES.length}];
  uniform float uSpeeds[${WAVES.length}];

  vec3 wave(vec2 p) {
    float h = 0.0;
    vec2 d = vec2(0.0);
    for (int i = 0; i < ${WAVES.length}; i++) {
      vec4 w = uWaves[i];
      float phase = w.w * dot(w.xy, p) + uTime * uSpeeds[i];
      h += w.z * sin(phase);
      d += w.z * w.w * w.xy * cos(phase);
    }
    return vec3(h, d);
  }
`;

export function Sea() {
  const time = useMemo(() => ({ value: 0 }), []);
  const material = useMemo(() => {
    const material = new THREE.MeshStandardMaterial({
      color: "#a9c2d2",
      roughness: 0.3,
    });
    material.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = time;
      shader.uniforms.uWaves = {
        value: WAVES.map(
          (w) => new THREE.Vector4(w.dir.x, w.dir.y, w.amplitude, w.k),
        ),
      };
      shader.uniforms.uSpeeds = { value: WAVES.map((w) => w.speed) };
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", `#include <common>\n${waveChunk}`)
        .replace(
          "#include <beginnormal_vertex>",
          `vec3 waveData = wave(position.xz);
          vec3 objectNormal = normalize(vec3(-waveData.y, 1.0, -waveData.z));`,
        )
        .replace(
          "#include <begin_vertex>",
          `vec3 transformed = vec3(position);
          transformed.y += waveData.x;`,
        );
    };
    return material;
  }, [time]);

  const geometry = useMemo(
    () => new THREE.PlaneGeometry(260, 260, 360, 360).rotateX(-Math.PI / 2),
    [],
  );

  useFrame(({ clock }) => {
    time.value = clock.getElapsedTime();
  });

  return <mesh geometry={geometry} material={material} />;
}

const sailShape = new THREE.Shape()
  .moveTo(0, 0)
  .lineTo(0, 2.2)
  .lineTo(1.3, 0)
  .closePath();

export function Boat({ x, z }: { x: number; z: number }) {
  const ref = useRef<THREE.Group>(null!);

  useFrame(({ clock }) => {
    const { h, dx, dz } = wave(x, z, clock.getElapsedTime());
    ref.current.position.set(x, h + 0.35, z);
    ref.current.rotation.set(-Math.atan(dz), 0, Math.atan(dx));
  });

  // The half-ellipsoid hull is decked over, so a crest washing over the side
  // covers it rather than showing the sea inside it.
  return (
    <group ref={ref}>
      <mesh scale={[1.7, 0.55, 0.6]}>
        <sphereGeometry
          args={[1, 48, 24, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]}
        />
        <meshStandardMaterial color="#3b2b20" />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} scale={[1.7, 0.6, 1]}>
        <circleGeometry args={[1, 48]} />
        <meshStandardMaterial color="#8a6a48" />
      </mesh>
      <mesh position={[0.2, 1.3, 0]}>
        <cylinderGeometry args={[0.04, 0.05, 2.6, 12]} />
        <meshStandardMaterial color="#3b2b20" />
      </mesh>
      <mesh position={[0.25, 0.25, 0]}>
        <shapeGeometry args={[sailShape]} />
        <meshStandardMaterial color="#f2ede2" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
