import * as THREE from "three";
import { useState } from "react";
import { useGLTF, SpotLight } from "@react-three/drei";
import {
  useCompoundBody,
  useSphere,
  useCylinder,
  useDistanceConstraint,
  usePointToPointConstraint,
} from "@react-three/cannon";
import type { BodyProps, CylinderProps } from "@react-three/cannon";
import { type GLTF } from "three-stdlib";
import { useDragConstraint } from "../helpers/Drag";
import { Block } from "../helpers/Block";

import cupModel from "./cup.glb?url";

type GLTFResult = GLTF & {
  nodes: {
    "buffer-0-mesh-0": THREE.Mesh;
    "buffer-0-mesh-0_1": THREE.Mesh;
  };
  materials: {
    default: THREE.MeshStandardMaterial;
    Liquid: THREE.MeshStandardMaterial;
  };
};

export function Chair(props: BodyProps) {
  const [ref] = useCompoundBody<THREE.Group>(() => ({
    mass: 24,
    linearDamping: 0.95,
    angularDamping: 0.95,
    shapes: [
      { type: "Box", mass: 10, position: [0, 0, 0], args: [3.1, 3.1, 0.5] },
      {
        type: "Box",
        mass: 10,
        position: [0, -1.75, 1.25],
        args: [3.1, 0.5, 3.1],
      },
      {
        type: "Box",
        mass: 1,
        position: [5 + -6.25, -3.5, 0],
        args: [0.5, 3, 0.5],
      },
      {
        type: "Box",
        mass: 1,
        position: [5 + -3.75, -3.5, 0],
        args: [0.5, 3, 0.5],
      },
      {
        type: "Box",
        mass: 1,
        position: [5 + -6.25, -3.5, 2.5],
        args: [0.5, 3, 0.5],
      },
      {
        type: "Box",
        mass: 1,
        position: [5 + -3.75, -3.5, 2.5],
        args: [0.5, 3, 0.5],
      },
    ],
    ...props,
  }));
  const bind = useDragConstraint(ref);
  return (
    <group ref={ref} {...bind}>
      <Block position={[0, 0, 0]} scale={[3.1, 3.1, 0.5]} />
      <Block position={[0, -1.75, 1.25]} scale={[3.1, 0.5, 3.1]} />
      <Block position={[5 + -6.25, -3.5, 0]} scale={[0.5, 3, 0.5]} />
      <Block position={[5 + -3.75, -3.5, 0]} scale={[0.5, 3, 0.5]} />
      <Block position={[5 + -6.25, -3.5, 2.5]} scale={[0.5, 3, 0.5]} />
      <Block position={[5 + -3.75, -3.5, 2.5]} scale={[0.5, 3, 0.5]} />
    </group>
  );
}

export function Mug(props: CylinderProps) {
  const { nodes, materials } = useGLTF(cupModel) as unknown as GLTFResult;
  const [cup] = useCylinder<THREE.Group>(() => ({
    mass: 1,
    args: [0.62, 0.62, 1.2, 16],
    linearDamping: 0.95,
    angularDamping: 0.95,
    ...props,
  }));
  const bind = useDragConstraint(cup);
  return (
    <group ref={cup} {...bind} dispose={null}>
      <group rotation={[Math.PI / 2, 0, 0]} scale={[0.012, 0.012, 0.012]}>
        <mesh
          receiveShadow
          castShadow
          material={materials.default}
          geometry={nodes["buffer-0-mesh-0"].geometry}
        />
        <mesh
          material={materials.Liquid}
          geometry={nodes["buffer-0-mesh-0_1"].geometry}
        />
      </group>
    </group>
  );
}

export function Table(props: BodyProps) {
  const [table] = useCompoundBody<THREE.Group>(() => ({
    mass: 54,
    linearDamping: 0.95,
    angularDamping: 0.95,
    shapes: [
      { type: "Box", mass: 50, position: [0, 0, 0], args: [5, 0.5, 5] },
      { type: "Box", mass: 1, position: [2, -2.25, 2], args: [0.5, 4, 0.5] },
      { type: "Box", mass: 1, position: [-2, -2.25, -2], args: [0.5, 4, 0.5] },
      { type: "Box", mass: 1, position: [-2, -2.25, 2], args: [0.5, 4, 0.5] },
      { type: "Box", mass: 1, position: [2, -2.25, -2], args: [0.5, 4, 0.5] },
    ],
    ...props,
  }));
  const bind = useDragConstraint(table);
  return (
    <group ref={table} {...bind}>
      <Block scale={[5, 0.5, 5]} position={[0, 0, 0]} />
      <Block scale={[0.5, 4, 0.5]} position={[2, -2.25, 2]} />
      <Block scale={[0.5, 4, 0.5]} position={[-2, -2.25, -2]} />
      <Block scale={[0.5, 4, 0.5]} position={[-2, -2.25, 2]} />
      <Block scale={[0.5, 4, 0.5]} position={[2, -2.25, -2]} />
    </group>
  );
}

export function Lamp(props: Omit<BodyProps, "args">) {
  const [target] = useState(() => new THREE.Object3D());
  const [fixed] = useSphere<THREE.Object3D>(() => ({
    collisionFilterGroup: 0,
    type: "Static",
    args: [0.2],
    ...props,
  }));
  const [lamp] = useCylinder<THREE.Mesh>(() => ({
    mass: 1,
    args: [0.5, 1.5, 2, 16],
    angularDamping: 0.95,
    linearDamping: 0.95,
    material: { friction: 0.9 },
    ...props,
  }));
  const bind = useDragConstraint(lamp);
  // pivotA/pivotB are not part of DistanceConstraintOpts (the solver ignores them
  // for a distance constraint), so they are kept off the checked literal
  const distanceOptions = {
    distance: 2,
    pivotA: [0, 0, 0],
    pivotB: [0, 2, 0],
  };
  useDistanceConstraint(fixed, lamp, distanceOptions);
  usePointToPointConstraint(fixed, lamp, {
    pivotA: [0, 0, 0],
    pivotB: [0, 2, 0],
  });
  return (
    <mesh ref={lamp} {...bind}>
      <cylinderGeometry args={[0.5, 1.5, 2, 32]} />
      <meshStandardMaterial />
      <SpotLight
        castShadow
        target={target}
        penumbra={0.2}
        radiusTop={0.4}
        radiusBottom={40}
        distance={80}
        angle={0.45}
        attenuation={20}
        anglePower={5}
        intensity={Math.PI}
        decay={0}
        opacity={0.2}
      />
      <primitive object={target} position={[0, -1, 0]} />
    </mesh>
  );
}
