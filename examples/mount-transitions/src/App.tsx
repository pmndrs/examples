import * as THREE from "three";
import React, { Suspense, useRef } from "react";
import {
  Canvas,
  useFrame,
  useThree,
  type ThreeElements,
} from "@react-three/fiber";
import { EffectComposer, N8AO } from "@react-three/postprocessing";
import { ContactShadows } from "@react-three/drei";
import {
  a,
  useTransition,
  useSpring,
  type AnimatedProps,
  type SpringValue,
} from "@react-spring/three";
import { FontLoader, TextGeometry } from "three-stdlib";
import { create } from "zustand";

type Item = {
  position: [number, number, number];
  r: number;
  geometry: THREE.BufferGeometry;
};

type Store = {
  items: Item[];
  material: THREE.MeshStandardMaterial;
};

const useStore = create<Store>((set) => {
  new FontLoader().load(
    `${import.meta.env.BASE_URL.replace(/\/*$/, "/")}font.blob`,
    (font) => {
      const config = {
        font,
        size: 15,
        height: 2,
        curveSegments: 4,
        evelEnabled: false,
      };
      set({
        items: [
          {
            position: [0.25, 1.8, -6],
            r: 0.5,
            geometry: new THREE.SphereGeometry(1, 32, 32),
          },
          {
            position: [-1.5, 0, 2],
            r: 0.2,
            geometry: new THREE.TetrahedronGeometry(2),
          },
          {
            position: [1, -0.75, 4],
            r: 0.3,
            geometry: new THREE.CylinderGeometry(0.8, 0.8, 2, 32),
          },
          {
            position: [-0.7, 0.5, 6],
            r: 0.4,
            geometry: new THREE.ConeGeometry(1.1, 1.7, 32),
          },
          {
            position: [0.5, -1.2, -6],
            r: 0.9,
            geometry: new THREE.SphereGeometry(1.5, 32, 32),
          },
          {
            position: [-0.5, 2.5, -2],
            r: 0.6,
            geometry: new THREE.IcosahedronGeometry(2),
          },
          {
            position: [-0.8, -0.75, 3],
            r: 0.35,
            geometry: new THREE.TorusGeometry(1.1, 0.35, 16, 32),
          },
          {
            position: [1.5, 0.5, -2],
            r: 0.8,
            geometry: new THREE.OctahedronGeometry(2),
          },
          {
            position: [-1, -0.5, -6],
            r: 0.5,
            geometry: new THREE.SphereGeometry(1.5, 32, 32),
          },
          {
            position: [1, 1.9, -1],
            r: 0.2,
            geometry: new THREE.BoxGeometry(2.5, 2.5, 2.5),
          },
          {
            position: [-2, -2, -10],
            r: 0,
            geometry: new TextGeometry("5", config),
          },
        ],
      });
    },
  );
  return { items: [], material: new THREE.MeshStandardMaterial() };
});

type GeometryProps = {
  r: number;
  position: [number, number, number];
  material: THREE.MeshStandardMaterial;
  geometry: THREE.BufferGeometry;
  scale: SpringValue<number[]>;
  rotation: SpringValue<number[]>;
};

function Geometry({ r, position, ...props }: GeometryProps) {
  const ref = useRef<THREE.Group>(null!);
  useFrame((state) => {
    ref.current.rotation.x =
      ref.current.rotation.y =
      ref.current.rotation.z +=
        0.004 * r;
    ref.current.position.y =
      position[1] +
      Math[r > 0.5 ? "cos" : "sin"](state.clock.getElapsedTime() * r) * r;
  });
  return (
    <group position={position} ref={ref}>
      {/* react-spring's MathType typing for Euler-like props can't express a
          SpringValue<number[]> for `rotation`, though it animates correctly at runtime */}
      <a.mesh {...(props as unknown as AnimatedProps<ThreeElements["mesh"]>)} />
    </group>
  );
}

function Geometries() {
  const { items, material } = useStore();
  const transition = useTransition(items, {
    from: { scale: [0, 0, 0], rotation: [0, 0, 0] },
    enter: ({ r }) => ({ scale: [1, 1, 1], rotation: [r * 3, r * 3, r * 3] }),
    leave: { scale: [0.1, 0.1, 0.1], rotation: [0, 0, 0] },
    config: { mass: 5, tension: 1000, friction: 100 },
    trail: 100,
  });
  return transition((props, { position: [x, y, z], r, geometry }) => (
    <Geometry
      position={[x * 3, y * 3, z]}
      material={material}
      geometry={geometry}
      r={r}
      {...props}
    />
  ));
}

function Rig() {
  const { camera, mouse } = useThree();
  const vec = new THREE.Vector3();
  return useFrame(() =>
    camera.position.lerp(
      vec.set(mouse.x * 2, mouse.y * 1, camera.position.z),
      0.02,
    ),
  );
}

export default function App() {
  const { color } = useSpring({
    color: 0,
    from: { color: 1 },
    config: { friction: 50 },
    loop: true,
  });
  return (
    <Canvas camera={{ position: [0, 0, 15], near: 5, far: 40 }}>
      <color attach="background" args={["white"]} />
      <a.fog
        attach="fog"
        args={["white", 10, 40]}
        color={color.to(
          [0, 0.2, 0.4, 0.7, 1],
          ["white", "red", "white", "red", "white"],
        )}
      />
      <ambientLight intensity={0.8 * Math.PI} />
      <directionalLight
        castShadow
        position={[2.5, 12, 12]}
        intensity={4 * Math.PI}
      />
      <pointLight position={[20, 20, 20]} intensity={Math.PI} decay={0} />
      <pointLight
        position={[-20, -20, -20]}
        intensity={5 * Math.PI}
        decay={0}
      />
      <Suspense fallback={null}>
        <Geometries />
        <ContactShadows
          position={[0, -7, 0]}
          opacity={0.75}
          scale={40}
          blur={1}
          far={9}
        />
        {/* `disableNormalPass` no longer exists in this postprocessing version; the normal pass is already disabled by default */}
        <EffectComposer>
          <N8AO aoRadius={3} distanceFalloff={3} intensity={1} />
        </EffectComposer>
      </Suspense>
      <Rig />
    </Canvas>
  );
}
