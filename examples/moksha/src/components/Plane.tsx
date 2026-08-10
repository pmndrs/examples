import React, { forwardRef, useRef } from "react";
import { useFrame, type ThreeElements } from "@react-three/fiber";
import { type ColorRepresentation, type Mesh, type Texture } from "three";
import lerp from "lerp";
import "./CustomMaterial";
import type { CustomMaterial } from "./CustomMaterial";
import { useBlock } from "../blocks";
import state from "../store";

type PlaneProps = Omit<ThreeElements["mesh"], "args"> & {
  color?: ColorRepresentation;
  shift?: number;
  opacity?: number;
  args?: ThreeElements["planeGeometry"]["args"];
  map?: Texture;
  // forwarded verbatim to the mesh, the way the untyped version did
  size?: number;
  aspect?: number;
};

const Plane = forwardRef<Mesh, PlaneProps>(
  ({ color = "white", shift = 1, opacity = 1, args, map, ...props }, ref) => {
    const { viewportHeight, offsetFactor } = useBlock();
    const material = useRef<CustomMaterial>(null!);
    let last = state.top.current;
    useFrame(() => {
      const { pages, top } = state;
      material.current.scale = lerp(
        material.current.scale,
        offsetFactor - top.current / ((pages - 1) * viewportHeight),
        0.1,
      );
      material.current.shift = lerp(
        material.current.shift,
        ((top.current - last) / shift) * 1.5,
        0.1,
      );
      last = top.current;
    });
    return (
      <mesh ref={ref} {...props}>
        <planeGeometry args={args} />
        <customMaterial
          ref={material}
          color={color}
          map={map}
          transparent
          opacity={opacity}
        />
      </mesh>
    );
  },
);

export default Plane;
