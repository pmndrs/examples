import * as THREE from "three";
import React, { useRef, useMemo } from "react";
import { extend, useFrame, useThree } from "@react-three/fiber";
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
  speed,
}: {
  curve: THREE.Vector3[];
  width: number;
  color: string;
  speed: number;
}) {
  const material = useRef<MeshLineMaterial>(null!);
  useFrame(() => (material.current.uniforms.dashOffset.value -= speed));
  return (
    <mesh>
      <meshLineGeometry points={curve} />
      <meshLineMaterial
        ref={material}
        transparent
        depthTest={false}
        lineWidth={width}
        color={color}
        dashArray={0.1}
        dashRatio={0.95}
      />
    </mesh>
  );
}

export default function Sparks({
  mouse,
  count,
  colors,
  radius = 10,
}: {
  mouse: React.RefObject<number[]>;
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
        const curve = new THREE.CatmullRomCurve3(points).getPoints(1000);
        return {
          color: colors[parseInt(String(colors.length * Math.random()))],
          width: Math.max(0.1, (0.2 * index) / 10),
          speed: Math.max(0.001, 0.004 * Math.random()),
          curve,
        };
      }),
    [count],
  );

  const ref = useRef<THREE.Group>(null!);
  const { size, viewport } = useThree();
  const aspect = size.width / viewport.width;
  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.x = THREE.MathUtils.lerp(
        ref.current.rotation.x,
        0 + mouse.current[1] / aspect / 200,
        0.1,
      );
      ref.current.rotation.y = THREE.MathUtils.lerp(
        ref.current.rotation.y,
        0 + mouse.current[0] / aspect / 400,
        0.1,
      );
    }
  });

  return (
    <group ref={ref}>
      <group position={[-radius * 2, -radius, -10]} scale={[1, 1.3, 1]}>
        {lines.map((props, index) => (
          <Fatline key={index} {...props} />
        ))}
      </group>
    </group>
  );
}
