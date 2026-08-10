import * as THREE from "three";
import React, { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Physics,
  usePlane,
  useConvexPolyhedron,
  type PlaneProps,
  type ConvexPolyhedronArgs,
  type Triplet,
} from "@react-three/cannon";
import { useGLTF } from "@react-three/drei";
import { Geometry, type GLTF } from "three-stdlib";

import diamondModel from "./diamond.glb?url";

type GLTFResult = GLTF & {
  nodes: { Cylinder: THREE.Mesh };
};

// Diamond/Cone/Cube forward their props both to the rendered <mesh> and into
// the cannon body config below, so they're typed to the narrower shape both
// consumers agree on rather than the full ThreeElements["mesh"] props.
type MeshBodyProps = {
  position?: Triplet;
  rotation?: Triplet;
};

/**
 * Returns legacy geometry vertices, faces for ConvP
 * @param {THREE.BufferGeometry} bufferGeometry
 */
function toConvexProps(
  bufferGeometry: THREE.BufferGeometry,
): ConvexPolyhedronArgs<Triplet> {
  const geo = new Geometry().fromBufferGeometry(bufferGeometry);
  // Merge duplicate vertices resulting from glTF export.
  // Cannon assumes contiguous, closed meshes to work
  geo.mergeVertices();
  return [geo.vertices.map((v): Triplet => [v.x, v.y, v.z]), geo.faces.map((f) => [f.a, f.b, f.c]), []]; // prettier-ignore
}

function Diamond(props: MeshBodyProps) {
  const { nodes } = useGLTF(diamondModel) as unknown as GLTFResult;
  const geo = useMemo(() => toConvexProps(nodes.Cylinder.geometry), [nodes]);
  const [ref] = useConvexPolyhedron<THREE.Mesh>(() => ({
    mass: 100,
    ...props,
    args: geo,
  }));
  return (
    <mesh
      castShadow
      receiveShadow
      ref={ref}
      geometry={nodes.Cylinder.geometry}
      {...props}
    >
      <meshStandardMaterial wireframe color="white" />
    </mesh>
  );
}

// A cone is a convex shape by definition...
function Cone({ sides, ...props }: MeshBodyProps & { sides: number }) {
  const geo = useMemo(
    () => toConvexProps(new THREE.ConeGeometry(0.7, 0.7, sides, 1)),
    [],
  );
  const [ref] = useConvexPolyhedron<THREE.Mesh>(() => ({
    mass: 100,
    ...props,
    args: geo,
  }));
  return (
    <mesh castShadow ref={ref} {...props}>
      <coneGeometry args={[0.7, 0.7, sides, 1]} />
      <meshNormalMaterial />
    </mesh>
  );
}

// ...And so is a cube!
function Cube({ size, ...props }: MeshBodyProps & { size: number }) {
  // note, this is wildly inefficient vs useBox
  const geo = useMemo(
    () => toConvexProps(new THREE.BoxGeometry(size, size, size)),
    [],
  );
  const [ref] = useConvexPolyhedron<THREE.Mesh>(() => ({
    mass: 100,
    ...props,
    args: geo,
  }));
  return (
    <mesh castShadow receiveShadow ref={ref} {...props}>
      <boxGeometry args={[size, size, size]} />
      <meshPhysicalMaterial color="rebeccapurple" />
    </mesh>
  );
}

function Plane(props: PlaneProps) {
  const [ref] = usePlane<THREE.Mesh>(() => ({ type: "Static", ...props }));
  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[10, 10]} />
      <shadowMaterial color="#171717" />
    </mesh>
  );
}

export default () => (
  <Canvas shadows dpr={[1, 2]} camera={{ position: [-1, 1, 5], fov: 50 }}>
    <color attach="background" args={["lightpink"]} />
    <spotLight
      position={[15, 15, 15]}
      angle={0.3}
      penumbra={1}
      intensity={2 * Math.PI}
      decay={0}
      castShadow
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
    />
    <Suspense fallback={null}>
      <Physics>
        <Plane rotation={[-Math.PI / 2, 0, 0]} />
        <Diamond position={[1, 5, 0]} rotation={[0.4, 0.1, 0.1]} />
        <Cone position={[-1, 5, 0.5]} rotation={[0.1, 0.2, 0.1]} sides={6} />
        <Cone position={[-1, 6, 0]} rotation={[0.5, 0.1, 0.1]} sides={8} />
        <Cube position={[2, 3, -0.3]} rotation={[0.5, 0.4, -1]} size={0.4} />
        <Cone position={[-0.3, 7, 1]} rotation={[1, 0.4, 0.1]} sides={7} />
      </Physics>
    </Suspense>
  </Canvas>
);
