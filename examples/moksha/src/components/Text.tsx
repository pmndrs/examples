import { Vector3, type ColorRepresentation, type Mesh } from "three";
import { FontLoader, TextBufferGeometry } from "three-stdlib";
import React, { useCallback, useRef } from "react";
import { useLoader, useFrame, type ThreeElements } from "@react-three/fiber";
import { useAsset } from "use-asset";
import lerp from "lerp";
import type { CustomMaterial } from "./CustomMaterial";
import state from "../store";

import moonFont from "./MOONGET_Heavy.blob?url";

type TextProps = Omit<ThreeElements["group"], "children" | "layers"> & {
  children: string;
  size?: number;
  left?: boolean;
  right?: boolean;
  top?: boolean;
  bottom?: boolean;
  color?: ColorRepresentation;
  opacity?: number;
  height?: number;
  layers?: number;
  font?: string;
};

function Text({
  children,
  size = 1,
  left,
  right,
  top,
  bottom,
  color = "white",
  opacity = 1,
  height = 0.01,
  layers = 0,
  font = moonFont,
  ...props
}: TextProps) {
  const data = useLoader(FontLoader, font);
  const geom = useAsset<TextBufferGeometry, [string[]]>(
    () =>
      new Promise((res) =>
        res(
          new TextBufferGeometry(children, {
            font: data,
            size: 1,
            height,
            curveSegments: 32,
          }),
        ),
      ),
    [children],
  );
  const onUpdate = useCallback(
    (self: Mesh) => {
      const box = new Vector3();
      self.geometry.computeBoundingBox();
      self.geometry.boundingBox!.getSize(box);
      self.position.x = left ? 0 : right ? -box.x : -box.x / 2;
      self.position.y = top ? 0 : bottom ? -box.y : -box.y / 2;
    },
    [left, right, top, bottom],
  );

  const ref = useRef<CustomMaterial>(null!);
  let last = state.top.current;
  useFrame(() => {
    ref.current.shift = lerp(
      ref.current.shift,
      (state.top.current - last) / 100,
      0.1,
    );
    last = state.top.current;
  });

  return (
    <group {...props} scale={[size, size, 0.1]}>
      <mesh geometry={geom} onUpdate={onUpdate} frustumCulled={false}>
        <customMaterial ref={ref} color={color} transparent opacity={opacity} />
      </mesh>
    </group>
  );
}

type MultilineTextProps = Omit<TextProps, "children" | "position"> & {
  text: string;
  lineHeight?: number;
  position?: [number, number, number];
};

const MultilineText = ({
  text,
  size = 1,
  lineHeight = 1,
  position = [0, 0, 0],
  ...props
}: MultilineTextProps) =>
  text
    .split("\n")
    .map((text, index) => (
      <Text
        key={index}
        size={size}
        {...props}
        position={[position[0], position[1] - index * lineHeight, position[2]]}
        children={text}
      />
    ));

export { Text, MultilineText };
