import * as THREE from "three";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Canvas,
  extend,
  useFrame,
  type Catalogue,
  type ThreeElements,
} from "@react-three/fiber";
import {
  Image,
  ScrollControls,
  useScroll,
  Billboard,
  Text,
} from "@react-three/drei";
import { suspend } from "suspend-react";
import { generate } from "random-words";
import { easing, geometry } from "maath";

import img1 from "./img1.jpg";
import img2 from "./img2.jpg";
import img3 from "./img3.jpg";
import img4 from "./img4.jpg";
import img5 from "./img5.jpg";
import img6 from "./img6.jpg";
import img7 from "./img7.jpg";
import img8 from "./img8.jpg";
import img9 from "./img9.jpg";
import img10 from "./img10.jpg";

const imgs = [img1, img2, img3, img4, img5, img6, img7, img8, img9, img10];

// `geometry` also exports non-constructor UV helper functions alongside
// RoundedPlaneGeometry, which extend()'s Catalogue type can't express.
extend(geometry as unknown as Catalogue);
const inter = import("@pmndrs/assets/fonts/inter_regular.woff") as Promise<{
  default: string;
}>;

export const App = () => (
  <Canvas dpr={[1, 1.5]}>
    <ScrollControls pages={4} infinite>
      <Scene position={[0, 1.5, 0]} />
    </ScrollControls>
  </Canvas>
);

function Scene({ children, ...props }: ThreeElements["group"]) {
  const ref = useRef<THREE.Group>(null!);
  const scroll = useScroll();
  const [hovered, hover] = useState<number | null>(null);
  useFrame((state, delta) => {
    ref.current.rotation.y = -scroll.offset * (Math.PI * 2); // Rotate contents
    state.events.update?.(); // Raycasts every frame rather than on pointer-move
    easing.damp3(
      state.camera.position,
      [-state.pointer.x * 2, state.pointer.y * 2 + 4.5, 9],
      0.3,
      delta,
    );
    state.camera.lookAt(0, 0, 0);
  });
  return (
    <group ref={ref} {...props}>
      <Cards
        category="spring"
        from={0}
        len={Math.PI / 4}
        onPointerOver={hover}
        onPointerOut={hover}
      />
      <Cards
        category="summer"
        from={Math.PI / 4}
        len={Math.PI / 2}
        position={[0, 0.4, 0]}
        onPointerOver={hover}
        onPointerOut={hover}
      />
      <Cards
        category="autumn"
        from={Math.PI / 4 + Math.PI / 2}
        len={Math.PI / 2}
        onPointerOver={hover}
        onPointerOut={hover}
      />
      <Cards
        category="winter"
        from={Math.PI * 1.25}
        len={Math.PI * 2 - Math.PI * 1.25}
        position={[0, -0.4, 0]}
        onPointerOver={hover}
        onPointerOut={hover}
      />
      <ActiveCard hovered={hovered} />
    </group>
  );
}

type CardsProps = ThreeElements["group"] & {
  category: string;
  data?: unknown;
  from?: number;
  len?: number;
  radius?: number;
  onPointerOver: (index: number | null) => void;
  onPointerOut: (index: number | null) => void;
};

function Cards({
  category,
  data,
  from = 0,
  len = Math.PI * 2,
  radius = 5.25,
  onPointerOver,
  onPointerOut,
  ...props
}: CardsProps) {
  const [hovered, hover] = useState<number | null>(null);
  const amount = Math.round(len * 22);
  const textPosition = from + (amount / 2 / amount) * len;
  return (
    <group {...props}>
      <Billboard
        position={[
          Math.sin(textPosition) * radius * 1.4,
          0.5,
          Math.cos(textPosition) * radius * 1.4,
        ]}
      >
        <Text
          font={(suspend(inter) as { default: string }).default}
          fontSize={0.25}
          anchorX="center"
          color="black"
        >
          {category}
        </Text>
      </Billboard>
      {Array.from(
        { length: amount - 3 /* minus 3 images at the end, creates a gap */ },
        (_, i) => {
          const angle = from + (i / amount) * len;
          return (
            <Card
              key={angle}
              onPointerOver={(e) => (
                e.stopPropagation(),
                hover(i),
                onPointerOver(i)
              )}
              onPointerOut={() => (hover(null), onPointerOut(null))}
              position={[Math.sin(angle) * radius, 0, Math.cos(angle) * radius]}
              rotation={[0, Math.PI / 2 + angle, 0]}
              active={hovered !== null}
              hovered={hovered === i}
              url={imgs[Math.floor(i % 10)]}
            />
          );
        },
      )}
    </group>
  );
}

type CardProps = ThreeElements["group"] & {
  url: string;
  active: boolean;
  hovered: boolean;
};

function Card({ url, active, hovered, ...props }: CardProps) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((state, delta) => {
    const f = hovered ? 1.4 : active ? 1.25 : 1;
    easing.damp3(ref.current.position, [0, hovered ? 0.25 : 0, 0], 0.1, delta);
    easing.damp3(ref.current.scale, [1.618 * f, 1 * f, 1], 0.15, delta);
  });
  return (
    <group {...props}>
      <Image
        ref={ref}
        transparent
        radius={0.075}
        url={url}
        // drei's Image only reads scale[0]/scale[1]; the trailing 1 here is
        // inert but kept to match the upstream source's literal value.
        scale={[1.618, 1, 1] as unknown as [number, number]}
        side={THREE.DoubleSide}
      />
    </group>
  );
}

type ActiveCardProps = Omit<ThreeElements["group"], "ref"> & {
  hovered: number | null;
};

function ActiveCard({ hovered, ...props }: ActiveCardProps) {
  const ref = useRef<THREE.Mesh>(null!);
  // generate({ exactly }) returns a string[] at runtime; the overload picked
  // by the compiler for options without `join` types it as string | string[].
  const name = useMemo(
    () => (generate({ exactly: 2 }) as string[]).join(" "),
    [hovered],
  );
  useLayoutEffect(
    () =>
      // `zoom` is a uniform on drei's Image shader material, not part of the
      // THREE.Material type that the Image ref exposes.
      void ((ref.current.material as unknown as { zoom: number }).zoom = 0.8),
    [hovered],
  );
  useFrame((state, delta) => {
    easing.damp(
      ref.current.material as unknown as { zoom: number },
      "zoom",
      1,
      0.5,
      delta,
    );
    easing.damp(
      ref.current.material as unknown as { opacity: number },
      "opacity",
      Number(hovered !== null),
      0.3,
      delta,
    );
  });
  return (
    <Billboard {...props}>
      <Text
        font={(suspend(inter) as { default: string }).default}
        fontSize={0.5}
        position={[2.15, 3.85, 0]}
        anchorX="left"
        color="black"
      >
        {hovered !== null && `${name}\n${hovered}`}
      </Text>
      <Image
        ref={ref}
        transparent
        radius={0.3}
        position={[0, 1.5, 0]}
        // drei's Image only reads scale[0]/scale[1]; the trailing values here
        // are inert but kept to match the upstream source's literal value.
        scale={[3.5, 1.618 * 3.5, 0.2, 1] as unknown as [number, number]}
        url={imgs[Math.floor(Number(hovered) % 10)]}
      />
    </Billboard>
  );
}
