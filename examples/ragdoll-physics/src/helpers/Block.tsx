import { forwardRef } from "react";
import { RoundedBox } from "@react-three/drei";
import type { RoundedBoxProps } from "@react-three/drei";
import type { ColorRepresentation, Mesh } from "three";

type BlockProps = RoundedBoxProps & {
  transparent?: boolean;
  opacity?: number;
  color?: ColorRepresentation;
};

export const Block = forwardRef<Mesh, BlockProps>(
  (
    {
      children,
      transparent = false,
      opacity = 1,
      color = "white",
      args = [1, 1, 1],
      ...props
    },
    ref,
  ) => {
    return (
      <RoundedBox args={args} receiveShadow castShadow ref={ref} {...props}>
        <meshStandardMaterial
          color={color}
          transparent={transparent}
          opacity={opacity}
        />
        {children}
      </RoundedBox>
    );
  },
);
