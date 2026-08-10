import * as THREE from "three";
import { useEffect, useRef, useState } from "react";
import { useFrame, type ThreeElements } from "@react-three/fiber";
import { MeshWobbleMaterial, useGLTF } from "@react-three/drei";
import { useSpring, a, type AnimatedProps } from "@react-spring/three";
import { type GLTF } from "three-stdlib";

import levelReactModel from "./level-react-draco.glb?url";

type GLTFResult = GLTF & {
  nodes: {
    Cactus: THREE.Mesh;
    Camera: THREE.Mesh;
    Camera_1: THREE.Mesh;
    Level: THREE.Mesh;
    Sudo: THREE.Mesh;
    SudoHead: THREE.Mesh;
  };
  materials: {
    Cactus: THREE.MeshBasicMaterial;
    Lens: THREE.MeshBasicMaterial;
  };
};

export function Level() {
  const { nodes } = useGLTF(levelReactModel) as unknown as GLTFResult;
  return (
    <mesh
      geometry={nodes.Level.geometry}
      material={nodes.Level.material}
      position={[-0.38, 0.69, 0.62]}
      rotation={[Math.PI / 2, -Math.PI / 9, 0]}
    />
  );
}

export function Sudo() {
  const { nodes } = useGLTF(levelReactModel) as unknown as GLTFResult;
  const [spring, api] = useSpring(
    () => ({
      rotation: [Math.PI / 2, 0, 0.29] as [number, number, number],
      config: { friction: 40 },
    }),
    [],
  );
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const wander = () => {
      api.start({
        rotation: [
          Math.PI / 2 + THREE.MathUtils.randFloatSpread(2) * 0.3,
          0,
          0.29 + THREE.MathUtils.randFloatSpread(2) * 0.2,
        ] as [number, number, number],
      });
      timeout = setTimeout(wander, (1 + Math.random() * 2) * 800);
    };
    wander();
    return () => clearTimeout(timeout);
  }, []);
  return (
    <>
      <mesh
        geometry={nodes.Sudo.geometry}
        material={nodes.Sudo.material}
        position={[0.68, 0.33, -0.67]}
        rotation={[Math.PI / 2, 0, 0.29]}
      />
      <a.mesh
        geometry={nodes.SudoHead.geometry}
        material={nodes.SudoHead.material}
        position={[0.68, 0.33, -0.67]}
        // react-spring's MathType typing for Euler-like props can't express a
        // SpringValue<[number, number, number]> for `rotation`, though it
        // animates correctly at runtime
        {...(spring as unknown as AnimatedProps<ThreeElements["mesh"]>)}
      />
    </>
  );
}

export function Camera() {
  const { nodes, materials } = useGLTF(
    levelReactModel,
  ) as unknown as GLTFResult;
  const [spring, api] = useSpring(
    () => ({ "rotation-z": 0, config: { friction: 40 } }),
    [],
  );
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const wander = () => {
      api.start({ "rotation-z": Math.random() });
      timeout = setTimeout(wander, (1 + Math.random() * 2) * 800);
    };
    wander();
    return () => clearTimeout(timeout);
  }, []);
  return (
    <a.group
      position={[-0.58, 0.83, -0.03]}
      rotation={[Math.PI / 2, 0, 0.47]}
      {...spring}
    >
      <mesh geometry={nodes.Camera.geometry} material={nodes.Camera.material} />
      <mesh geometry={nodes.Camera_1.geometry} material={materials.Lens} />
    </a.group>
  );
}

export function Cactus() {
  const { nodes, materials } = useGLTF(
    levelReactModel,
  ) as unknown as GLTFResult;
  return (
    <mesh
      geometry={nodes.Cactus.geometry}
      position={[-0.42, 0.51, -0.62]}
      rotation={[Math.PI / 2, 0, 0]}
    >
      <MeshWobbleMaterial factor={0.4} map={materials.Cactus.map} />
    </mesh>
  );
}

type BoxProps = Omit<ThreeElements["mesh"], "scale"> & { scale?: number };

export function Box({ scale = 1, ...props }: BoxProps) {
  const ref = useRef<THREE.Mesh>(null!);
  const [hovered, hover] = useState(false);
  const [clicked, click] = useState(false);
  useFrame(
    (state, delta) =>
      (ref.current.rotation.x = ref.current.rotation.y += delta),
  );
  return (
    <mesh
      {...props}
      ref={ref}
      scale={(clicked ? 1.5 : 1) * scale}
      onClick={() => click(!clicked)}
      onPointerOver={(event) => (event.stopPropagation(), hover(true))}
      onPointerOut={(event) => hover(false)}
    >
      <boxGeometry />
      <meshStandardMaterial color={hovered ? "hotpink" : "orange"} />
    </mesh>
  );
}
