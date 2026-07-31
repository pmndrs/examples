import { useMemo } from 'react'
import * as THREE from 'three'
import { Float, Box, Wireframe } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { patchShaders } from 'gl-noise/build/glNoise.m'

export function Shader(opts) {
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), [])

  useFrame((_, dt) => {
    uniforms.uTime.value += dt
  })

  return (
    <Float floatIntensity={4} rotationIntensity={4}>
      <Box args={[1, 1, 1]}>
        {/* <Wireframe> injects initWireframe()/getWireframe() into whatever material follows it */}
        <Wireframe {...opts} />
        <shaderMaterial
          side={THREE.DoubleSide}
          polygonOffset={false}
          uniforms={uniforms}
          vertexShader={
            /* glsl */ `
            varying vec2 vUv;
            varying vec3 vPosition;

            void main() {
              vUv = uv;
              vPosition = position;

              initWireframe();
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `
          }
          fragmentShader={patchShaders(/* glsl */ `
            varying vec2 vUv;
            varying vec3 vPosition;

            uniform float uTime;

            void main() {
              float edge = getWireframe();
              float noise = gln_perlin((vPosition + uTime * 0.1) * 10.);

              noise = smoothstep(0.0, 0.01, noise);

              float mask = edge * noise;
              vec3 col = vec3(mask);
              col.rg *= vUv;
              gl_FragColor = vec4(col, mask);
            }
          `)}
        />
      </Box>
    </Float>
  )
}
