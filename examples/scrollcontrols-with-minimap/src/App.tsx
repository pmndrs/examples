import * as THREE from "three";
import { Suspense, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Preload,
  ScrollControls,
  Scroll,
  useScroll,
  Image as ImageImpl,
  type ImageProps,
} from "@react-three/drei";

import img1 from "./img1.jpg";
import img6 from "./img6.jpg";
import trip2 from "./trip2.jpg";
import img8 from "./img8.jpg";
import trip4 from "./trip4.jpg";
import img3 from "./img3.jpg";
import img7 from "./img7.jpg";

// Distributes over ImageProps' texture/url union so each branch keeps its
// own shape instead of collapsing into one incompatible object type.
type DistributiveOmit<T, K extends keyof T> = T extends unknown
  ? Omit<T, K>
  : never;

type ImageComponentProps = DistributiveOmit<ImageProps, "ref"> & {
  c?: THREE.Color;
};

function Image({ c = new THREE.Color(), ...props }: ImageComponentProps) {
  const ref = useRef<THREE.Mesh>(null!);
  const [hovered, hover] = useState(false);
  useFrame(() => {
    // drei's Image material exposes `color` at runtime; the ref type only
    // knows about the generic THREE.Material.
    (ref.current.material as unknown as { color: THREE.Color }).color.lerp(
      c.set(hovered ? "white" : "#ccc"),
      hovered ? 0.4 : 0.05,
    );
  });
  return (
    <ImageImpl
      ref={ref}
      onPointerOver={() => hover(true)}
      onPointerOut={() => hover(false)}
      {...props}
    />
  );
}

function Images() {
  const { width, height } = useThree((state) => state.viewport);
  const data = useScroll();
  const group = useRef<THREE.Group>(null!);
  useFrame(() => {
    // drei's Image material exposes `zoom`/`grayscale` at runtime; the
    // group's children are only known as generic THREE.Object3D.
    const children = group.current.children as unknown as {
      material: { zoom: number; grayscale: number };
    }[];
    children[0].material.zoom = 1 + data.range(0, 1 / 3) / 3;
    children[1].material.zoom = 1 + data.range(0, 1 / 3) / 3;
    children[2].material.zoom = 1 + data.range(1.15 / 3, 1 / 3) / 3;
    children[3].material.zoom = 1 + data.range(1.15 / 3, 1 / 3) / 2;
    children[4].material.zoom = 1 + data.range(1.25 / 3, 1 / 3) / 1;
    children[5].material.zoom = 1 + data.range(1.8 / 3, 1 / 3) / 3;
    children[5].material.grayscale = 1 - data.range(1.6 / 3, 1 / 3);
    children[6].material.zoom = 1 + (1 - data.range(2 / 3, 1 / 3)) / 3;
  });
  return (
    <group ref={group}>
      {/* drei's Image only reads scale[0]/scale[1]; the trailing 1 in each
          of these is inert but kept to match the upstream source's literal
          value. */}
      <Image
        position={[-2, 0, 0]}
        scale={[4, height, 1] as unknown as [number, number]}
        url={img1}
      />
      <Image position={[2, 0, 1]} scale={3} url={img6} />
      <Image
        position={[-2.3, -height, 2]}
        scale={[1, 3, 1] as unknown as [number, number]}
        url={trip2}
      />
      <Image
        position={[-0.6, -height, 3]}
        scale={[1, 2, 1] as unknown as [number, number]}
        url={img8}
      />
      <Image position={[0.75, -height, 3.5]} scale={1.5} url={trip4} />
      <Image
        position={[0, -height * 1.5, 2.5]}
        scale={[1.5, 3, 1] as unknown as [number, number]}
        url={img3}
      />
      <Image
        position={[0, -height * 2 - height / 4, 0]}
        scale={[width, height / 2, 1] as unknown as [number, number]}
        url={img7}
      />
    </group>
  );
}

export default function App() {
  return (
    <Canvas gl={{ antialias: false }} dpr={[1, 1.5]}>
      <Suspense fallback={null}>
        <ScrollControls damping={4} pages={3}>
          <Scroll>
            <Images />
          </Scroll>
          <Scroll html>
            <h1 style={{ position: "absolute", top: "60vh", left: "0.5em" }}>
              to
            </h1>
            <h1 style={{ position: "absolute", top: "120vh", left: "60vw" }}>
              be
            </h1>
            <h1
              style={{
                position: "absolute",
                top: "198.5vh",
                left: "0.5vw",
                fontSize: "40vw",
              }}
            >
              home
            </h1>
          </Scroll>
        </ScrollControls>
        <Preload />
      </Suspense>
    </Canvas>
  );
}
