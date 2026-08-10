import * as THREE from "three";
import { useRef, useEffect, useMemo } from "react";
import { type ThreeElements } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import { type GLTF } from "three-stdlib";

import helloFragmentsModel from "./hello-fragments.glb?url";
import helloTextModel from "./hello-text.glb?url";

type GLTFResult = GLTF & {
  materials: { inner: THREE.Material };
};

const normalMaterial = new THREE.MeshNormalMaterial();

export function Fragments({
  visible,
  ...props
}: { visible: boolean } & Omit<ThreeElements["primitive"], "object">) {
  const group = useRef<THREE.Group>(null!);
  const { scene, animations, materials } = useGLTF(
    helloFragmentsModel,
  ) as unknown as GLTFResult;
  const { actions } = useAnimations(animations, group);
  // Exchange inner material
  useMemo(
    () =>
      scene.traverse(
        (o) =>
          o.type === "Mesh" &&
          (o as THREE.Mesh).material === materials.inner &&
          ((o as THREE.Mesh).material = normalMaterial),
      ),
    [],
  );
  // Play actions
  useEffect(() => {
    if (visible)
      Object.keys(actions).forEach((key) => {
        actions[key]!.repetitions = 0;
        actions[key]!.clampWhenFinished = true;
        actions[key]!.play();
      });
  }, [visible]);
  return <primitive ref={group} object={scene} {...props} />;
}

export function Model(props: Omit<ThreeElements["primitive"], "object">) {
  const { scene } = useGLTF(helloTextModel);
  return <primitive object={scene} {...props} />;
}

useGLTF.preload(helloFragmentsModel);
useGLTF.preload(helloTextModel);
