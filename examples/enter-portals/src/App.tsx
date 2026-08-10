import * as THREE from "three";
import { useEffect, useRef, useState } from "react";
import type { ComponentRef } from "react";
import {
  Canvas,
  extend,
  useFrame,
  useThree,
  type Catalogue,
  type ThreeElements,
} from "@react-three/fiber";
import {
  useCursor,
  MeshPortalMaterial,
  CameraControls,
  Gltf,
  Text,
  Preload,
} from "@react-three/drei";
import { useRoute, useLocation } from "wouter";
import { easing, geometry } from "maath";
import { suspend } from "suspend-react";

import picklesModel from "./pickles_3d_version_of_hyuna_lees_illustration-transformed.glb?url";
import teaModel from "./fiesta_tea-transformed.glb?url";
import stillModel from "./still_life_based_on_heathers_artwork-transformed.glb?url";

// `geometry` also exports UV helper functions that aren't constructors;
// extend()'s Catalogue type only wants constructors, but the extras are
// harmless additions to the JSX intrinsics catalogue at runtime.
extend(geometry as unknown as Catalogue);
const regular = import("@pmndrs/assets/fonts/inter_regular.woff");
const medium = import("@pmndrs/assets/fonts/inter_medium.woff");

export const App = () => (
  <Canvas
    camera={{ fov: 75, position: [0, 0, 20] }}
    eventSource={document.getElementById("root")!}
    eventPrefix="client"
  >
    <color attach="background" args={["#f0f0f0"]} />
    <Frame
      id="01"
      name={`pick\nles`}
      author="Omar Faruq Tawsif"
      bg="#e4cdac"
      position={[-1.15, 0, 0]}
      rotation={[0, 0.5, 0]}
    >
      <Gltf src={picklesModel} scale={8} position={[0, -0.7, -2]} />
    </Frame>
    <Frame id="02" name="tea" author="Omar Faruq Tawsif">
      <Gltf src={teaModel} position={[0, -2, -3]} />
    </Frame>
    <Frame
      id="03"
      name="still"
      author="Omar Faruq Tawsif"
      bg="#d1d1ca"
      position={[1.15, 0, 0]}
      rotation={[0, -0.5, 0]}
    >
      <Gltf src={stillModel} scale={2} position={[0, -0.8, -4]} />
    </Frame>
    <Rig />
    <Preload all />
  </Canvas>
);

type FrameProps = Omit<ThreeElements["group"], "id"> & {
  id: string;
  name: string;
  author: string;
  bg?: string;
  width?: number;
  height?: number;
};

function Frame({
  id,
  name,
  author,
  bg,
  width = 1,
  height = 1.61803398875,
  children,
  ...props
}: FrameProps) {
  const portal = useRef<ComponentRef<typeof MeshPortalMaterial>>(null!);
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/item/:id");
  const [hovered, hover] = useState(false);
  useCursor(hovered);
  useFrame((state, dt) =>
    easing.damp(portal.current, "blend", params?.id === id ? 1 : 0, 0.2, dt),
  );
  return (
    <group {...props}>
      <Text
        font={(suspend(medium) as { default: string }).default}
        fontSize={0.3}
        anchorY="top"
        anchorX="left"
        lineHeight={0.8}
        position={[-0.375, 0.715, 0.01]}
        material-toneMapped={false}
      >
        {name}
      </Text>
      <Text
        font={(suspend(regular) as { default: string }).default}
        fontSize={0.1}
        anchorX="right"
        position={[0.4, -0.659, 0.01]}
        material-toneMapped={false}
      >
        /{id}
      </Text>
      <Text
        font={(suspend(regular) as { default: string }).default}
        fontSize={0.04}
        anchorX="right"
        position={[0.0, -0.677, 0.01]}
        material-toneMapped={false}
      >
        {author}
      </Text>
      <mesh
        name={id}
        onDoubleClick={(e) => (
          e.stopPropagation(),
          setLocation("/item/" + e.object.name)
        )}
        onPointerOver={(e) => hover(true)}
        onPointerOut={() => hover(false)}
      >
        <roundedPlaneGeometry args={[width, height, 0.1]} />
        <MeshPortalMaterial
          ref={portal}
          events={params?.id === id}
          side={THREE.DoubleSide}
          // blur/resolution match MeshPortalMaterial's own defaults; drei's
          // types mark them required even though the component defaults them.
          blur={0}
          resolution={512}
        >
          <color attach="background" args={[bg as THREE.ColorRepresentation]} />
          {children}
        </MeshPortalMaterial>
      </mesh>
    </group>
  );
}

function Rig({
  position = new THREE.Vector3(0, 0, 2),
  focus = new THREE.Vector3(0, 0, 0),
}: {
  position?: THREE.Vector3;
  focus?: THREE.Vector3;
}) {
  const { controls, scene } = useThree();
  const [, params] = useRoute("/item/:id");
  useEffect(() => {
    const active = params?.id ? scene.getObjectByName(params.id) : undefined;
    if (active) {
      active.parent!.localToWorld(position.set(0, 0.5, 0.25));
      active.parent!.localToWorld(focus.set(0, 0, -2));
    }
    // r3f only types `controls` as a generic EventDispatcher; CameraControls
    // is the concrete type set via `makeDefault` below.
    (controls as unknown as CameraControls | null)?.setLookAt(
      ...(position.toArray() as [number, number, number]),
      ...(focus.toArray() as [number, number, number]),
      true,
    );
  });
  return (
    <CameraControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2} />
  );
}
