import { Suspense, useLayoutEffect } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Circle,
  Loader,
  OrbitControls,
  PerspectiveCamera,
  SpotLight,
  SpotLightShadow,
  useTexture,
} from "@react-three/drei";
import { MathUtils, RepeatWrapping } from "three";

import Lights from "./components/Lights";
import diffuseUrl from "./textures/grassy_cobblestone_diff_2k.jpg";
import normalUrl from "./textures/grassy_cobblestone_nor_gl_2k.jpg";
import roughnessUrl from "./textures/grassy_cobblestone_rough_2k.jpg";
import aoUrl from "./textures/grassy_cobblestone_ao_2k.jpg";
import leavesUrl from "./textures/leaves.jpg";

function Thing() {
  const texs = useTexture([diffuseUrl, normalUrl, roughnessUrl, aoUrl]);

  useLayoutEffect(() => {
    for (const tex of texs) {
      tex.wrapS = tex.wrapT = RepeatWrapping;
      tex.repeat.set(2, 2);
    }
  }, [texs]);

  const [diffuse, normal, roughness, ao] = texs;

  const leafTexture = useTexture(leavesUrl);

  return (
    <>
      <Circle receiveShadow args={[5, 64, 64]} rotation-x={-Math.PI / 2}>
        <meshStandardMaterial
          map={diffuse}
          normalMap={normal}
          roughnessMap={roughness}
          aoMap={ao}
          envMapIntensity={0.2}
        />
      </Circle>

      <SpotLight
        distance={20}
        intensity={500}
        angle={MathUtils.degToRad(45)}
        color={"#fadcb9"}
        position={[5, 8, -2]}
        volumetric={false}
        debug
      >
        <SpotLightShadow
          scale={4}
          distance={0.4}
          width={2048}
          height={2048}
          map={leafTexture}
          shader={
            /* glsl */ `
            varying vec2 vUv;
            uniform sampler2D uShadowMap;
            uniform float uTime;
            void main() {
              // material.repeat.set(2.5) - Since repeat is a shader feature not texture
              // we need to implement it manually
              vec2 uv = mod(vUv, 0.4) * 2.5;

              // Fake wind distortion
              uv.x += sin(uv.y * 10.0 + uTime * 0.5) * 0.02;
              uv.y += sin(uv.x * 10.0 + uTime * 0.5) * 0.02;

              vec3 color = texture2D(uShadowMap, uv).xyz;
              gl_FragColor = vec4(color, 1.);
            }
          `
          }
        />
      </SpotLight>
    </>
  );
}

export default function App() {
  return (
    <>
      <Canvas shadows>
        <OrbitControls
          makeDefault
          autoRotate
          autoRotateSpeed={0.5}
          minDistance={2}
          maxDistance={10}
        />
        <PerspectiveCamera
          near={0.01}
          far={50}
          position={[1, 3, 1]}
          makeDefault
          fov={60}
        />
        <Suspense>
          <Thing />
          <Lights />
        </Suspense>
      </Canvas>
      <Loader />
    </>
  );
}
