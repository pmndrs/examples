import * as THREE from "three";
import React, { useRef, useMemo } from "react";
import { extend, useFrame } from "@react-three/fiber";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";

// The two constructors are named explicitly rather than passing the whole
// `meshline` namespace: it also exports a plain `raycast` function, which is
// not a constructor and so does not fit `extend`'s catalogue.
extend({ MeshLineGeometry, MeshLineMaterial });

const r = () => Math.max(0.2, Math.random());

function Fatline({
  curve,
  width,
  color,
}: {
  curve: THREE.Vector3[];
  width?: number;
  color: string;
}) {
  const material = useRef<MeshLineMaterial>(null!);
  useFrame(
    (state, delta) =>
      (material.current.uniforms.dashOffset.value -= delta / 100),
  );
  return (
    <mesh>
      <meshLineGeometry points={curve} />
      <meshLineMaterial
        ref={material}
        transparent
        lineWidth={0.01}
        color={color}
        dashArray={0.1}
        dashRatio={0.99}
      />
    </mesh>
  );
}

export default function Fireflies({
  count,
  colors,
  radius = 10,
}: {
  count: number;
  colors: string[];
  radius?: number;
}) {
  const lines = useMemo(
    () =>
      new Array(count).fill(undefined).map((_, index) => {
        const pos = new THREE.Vector3(
          Math.sin(0) * radius * r(),
          Math.cos(0) * radius * r(),
          0,
        );
        const points = new Array(30).fill(undefined).map((_, index) => {
          const angle = (index / 20) * Math.PI * 2;
          return pos
            .add(
              new THREE.Vector3(
                Math.sin(angle) * radius * r(),
                Math.cos(angle) * radius * r(),
                0,
              ),
            )
            .clone();
        });
        const curve = new THREE.CatmullRomCurve3(points).getPoints(100);
        return {
          color: colors[parseInt(String(colors.length * Math.random()))],
          curve,
        };
      }),
    [count, radius, colors],
  );
  return (
    <group position={[-radius * 2, -radius, 0]}>
      {lines.map((props, index) => (
        <Fatline key={index} {...props} />
      ))}
    </group>
  );
}
