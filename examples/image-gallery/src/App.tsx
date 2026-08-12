import * as THREE from "three";
import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import {
  useCursor,
  MeshReflectorMaterial,
  Image,
  Text,
  Environment,
} from "@react-three/drei";
import { useRoute, useLocation } from "wouter";
import { easing } from "maath";
import getUuid from "uuid-by-string";

const GOLDENRATIO = 1.61803398875;

//
// Not `Math.random()`, and the reason is not style.
//
// The harness seeds `Math.random` so the sequence is fixed -- but every three.js
// object, material, geometry and texture draws four values from that same
// sequence for a UUID, and the order they are created in follows the order
// assets happen to arrive. So a card that draws after a texture resolved gets a
// different number than one that drew before, and the gallery laid itself out
// differently on every run.
//
// Deriving it from the image URL removes the question: the same card gets the
// same number whenever it mounts.
//
function stableRandom(key: string) {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++)
    h = Math.imul(h ^ key.charCodeAt(i), 16777619);
  return ((h >>> 0) % 10000) / 10000;
}

export type ImageData = {
  position: [number, number, number];
  rotation: [number, number, number];
  url: string;
};

export const App = ({ images }: { images: ImageData[] }) => (
  <Canvas dpr={[1, 1.5]} camera={{ fov: 70, position: [0, 2, 15] }}>
    <color attach="background" args={["#191920"]} />
    <fog attach="fog" args={["#191920", 0, 15]} />
    <group position={[0, -0.5, 0]}>
      <Frames images={images} />
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={2048}
          mixBlur={1}
          mixStrength={80}
          roughness={1}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#050505"
          metalness={0.5}
        />
      </mesh>
    </group>
    <Environment preset="city" />
  </Canvas>
);

function Frames({
  images,
  q = new THREE.Quaternion(),
  p = new THREE.Vector3(),
}: {
  images: ImageData[];
  q?: THREE.Quaternion;
  p?: THREE.Vector3;
}) {
  const ref = useRef<THREE.Group>(null!);
  const clicked = useRef<THREE.Object3D | undefined>(undefined);
  const [, params] = useRoute("/item/:id");
  const [, setLocation] = useLocation();
  useEffect(() => {
    clicked.current = ref.current.getObjectByName(params?.id ?? "");
    if (clicked.current) {
      clicked.current.parent!.updateWorldMatrix(true, true);
      clicked.current.parent!.localToWorld(p.set(0, GOLDENRATIO / 2, 1.25));
      clicked.current.parent!.getWorldQuaternion(q);
    } else {
      p.set(0, 0, 5.5);
      q.identity();
    }
  });
  useFrame((state, dt) => {
    easing.damp3(state.camera.position, p, 0.4, dt);
    easing.dampQ(state.camera.quaternion, q, 0.4, dt);
  });
  return (
    <group
      ref={ref}
      onClick={(e: ThreeEvent<MouseEvent>) => (
        e.stopPropagation(),
        setLocation(
          clicked.current === e.object ? "/" : "/item/" + e.object.name,
        )
      )}
      onPointerMissed={() => setLocation("/")}
    >
      {images.map(
        (props) => <Frame key={props.url} {...props} /> /* prettier-ignore */,
      )}
    </group>
  );
}

function Frame({
  url,
  c = new THREE.Color(),
  ...props
}: ImageData & { c?: THREE.Color }) {
  const image = useRef<
    THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial & { zoom: number }>
  >(null!);
  const frame = useRef<
    THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>
  >(null!);
  const [, params] = useRoute("/item/:id");
  const [hovered, hover] = useState(false);
  const [rnd] = useState(() => stableRandom(url));
  const name = getUuid(url);
  const isActive = params?.id === name;
  useCursor(hovered);
  useFrame((state, dt) => {
    image.current.material.zoom =
      2 + Math.sin(rnd * 10000 + state.clock.elapsedTime / 3) / 2;
    easing.damp3(
      image.current.scale,
      [
        0.85 * (!isActive && hovered ? 0.85 : 1),
        0.9 * (!isActive && hovered ? 0.905 : 1),
        1,
      ],
      0.1,
      dt,
    );
    easing.dampC(
      frame.current.material.color,
      hovered ? "orange" : "white",
      0.1,
      dt,
    );
  });
  return (
    <group {...props}>
      <mesh
        name={name}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => (
          e.stopPropagation(),
          hover(true)
        )}
        onPointerOut={() => hover(false)}
        scale={[1, GOLDENRATIO, 0.05]}
        position={[0, GOLDENRATIO / 2, 0]}
      >
        <boxGeometry />
        <meshStandardMaterial
          color="#151515"
          metalness={0.5}
          roughness={0.5}
          envMapIntensity={2}
        />
        <mesh
          ref={frame}
          raycast={() => null}
          scale={[0.9, 0.93, 0.9]}
          position={[0, 0, 0.2]}
        >
          <boxGeometry />
          <meshBasicMaterial toneMapped={false} fog={false} />
        </mesh>
        <Image
          raycast={() => null}
          ref={image}
          position={[0, 0, 0.7]}
          url={url}
        />
      </mesh>
      <Text
        maxWidth={0.1}
        anchorX="left"
        anchorY="top"
        position={[0.55, GOLDENRATIO, 0]}
        fontSize={0.025}
      >
        {name.split("-").join(" ")}
      </Text>
    </group>
  );
}
