import { type ComponentProps } from "react";
import { Icosahedron, Wireframe, Float } from "@react-three/drei";

export function Primitive(opts: ComponentProps<typeof Wireframe>) {
  return (
    <Float floatIntensity={4} rotationIntensity={4}>
      <Icosahedron args={[1, 1]}>
        <meshPhongMaterial flatShading color="tomato" shininess={1} />
        <Wireframe {...opts} />
      </Icosahedron>
    </Float>
  );
}
