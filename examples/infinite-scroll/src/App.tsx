import * as THREE from "three";
import { Suspense, useRef } from "react";
import {
  Canvas,
  useFrame,
  useThree,
  type ThreeElements,
} from "@react-three/fiber";
import {
  Preload,
  Image as ImageImpl,
  type ImageProps,
} from "@react-three/drei";
import { ScrollControls, Scroll, useScroll } from "./ScrollControls";

import trip1 from "./trip1.jpg";
import trip2 from "./trip2.jpg";
import trip3 from "./trip3.jpg";
// import trip4 from './trip4.jpg'

import img1 from "./img1.jpg";
import img2 from "./img2.jpg";
import img3 from "./img3.jpg";
import img4 from "./img4.jpg";
import img5 from "./img5.jpg";
import img6 from "./img6.jpg";
// import img7 from './img7.jpg'
// import img8 from './img8.jpg'

// Distributes over ImageProps' texture/url union so each branch keeps its
// own shape instead of collapsing into one incompatible object type.
type DistributiveOmit<T, K extends keyof T> = T extends unknown
  ? Omit<T, K>
  : never;

function Image(props: DistributiveOmit<ImageProps, "ref">) {
  const ref = useRef<THREE.Mesh>(null!);
  const group = useRef<THREE.Group>(null!);
  const data = useScroll();
  useFrame((state, delta) => {
    group.current.position.z = THREE.MathUtils.damp(
      group.current.position.z,
      Math.max(0, data.delta * 50),
      4,
      delta,
    );
    // drei's Image material exposes `grayscale` at runtime; the ref type
    // only knows about the generic THREE.Material.
    const material = ref.current.material as unknown as { grayscale: number };
    material.grayscale = THREE.MathUtils.damp(
      material.grayscale,
      Math.max(0, 1 - data.delta * 1000),
      4,
      delta,
    );
  });
  return (
    <group ref={group}>
      <ImageImpl ref={ref} {...props} />
    </group>
  );
}

type PageProps = ThreeElements["group"] & {
  m?: number;
  urls: string[];
};

function Page({ m = 0.4, urls, ...props }: PageProps) {
  const { width } = useThree((state) => state.viewport);
  const w = width < 10 ? 1.5 / 3 : 1 / 3;
  return (
    <group {...props}>
      <Image
        position={[-width * w, 0, -1]}
        // drei's Image only reads scale[0]/scale[1]; the trailing 1 here is
        // inert but kept to match the upstream source's literal value.
        scale={[width * w - m * 2, 5, 1] as unknown as [number, number]}
        url={urls[0]}
      />
      <Image
        position={[0, 0, 0]}
        scale={[width * w - m * 2, 5, 1] as unknown as [number, number]}
        url={urls[1]}
      />
      <Image
        position={[width * w, 0, 1]}
        scale={[width * w - m * 2, 5, 1] as unknown as [number, number]}
        url={urls[2]}
      />
    </group>
  );
}

function Pages() {
  const { width } = useThree((state) => state.viewport);
  return (
    <>
      <Page position={[-width * 1, 0, 0]} urls={[trip1, trip2, trip3]} />
      <Page position={[width * 0, 0, 0]} urls={[img1, img2, img3]} />
      <Page position={[width * 1, 0, 0]} urls={[img4, img5, img6]} />
      <Page position={[width * 2, 0, 0]} urls={[trip1, trip2, trip3]} />
      <Page position={[width * 3, 0, 0]} urls={[img1, img2, img3]} />
      <Page position={[width * 4, 0, 0]} urls={[img4, img5, img6]} />
    </>
  );
}

export default function App() {
  return (
    <Canvas gl={{ antialias: false }} dpr={[1, 1.5]}>
      <Suspense fallback={null}>
        <ScrollControls infinite horizontal damping={4} pages={4} distance={1}>
          <Scroll>
            <Pages />
          </Scroll>
          <Scroll html>
            <h1 style={{ position: "absolute", top: "20vh", left: "-75vw" }}>
              home
            </h1>
            <h1 style={{ position: "absolute", top: "20vh", left: "25vw" }}>
              to
            </h1>
            <h1 style={{ position: "absolute", top: "20vh", left: "125vw" }}>
              be
            </h1>
            <h1 style={{ position: "absolute", top: "20vh", left: "225vw" }}>
              home
            </h1>
            <h1 style={{ position: "absolute", top: "20vh", left: "325vw" }}>
              to
            </h1>
            <h1 style={{ position: "absolute", top: "20vh", left: "425vw" }}>
              be
            </h1>
          </Scroll>
        </ScrollControls>
        <Preload />
      </Suspense>
    </Canvas>
  );
}
