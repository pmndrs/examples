import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useLayoutEffect, useRef } from 'react'
import glsl from 'babel-plugin-glsl/macro'
import { extend, useFrame, useLoader } from '@react-three/fiber'

export default function App() {
  return (
    <Canvas camera={{ position: [0, -4, 5], fov: 50 }}>
      <Suspense fallback={null}>
        <Fire scale={7} />
      </Suspense>
      <OrbitControls />
    </Canvas>
  )
}

class FireMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      defines: { ITERATIONS: '10', OCTIVES: '3' },
      uniforms: {
        fireTex: { type: 't', value: null },
        color: { type: 'c', value: null },
        time: { type: 'f', value: 0.0 },
        seed: { type: 'f', value: 0.0 },
        invModelMatrix: { type: 'm4', value: null },
        scale: { type: 'v3', value: null },
        noiseScale: { type: 'v4', value: new THREE.Vector4(1, 2, 1, 0.3) },
        magnitude: { type: 'f', value: 2.5 },
        lacunarity: { type: 'f', value: 3.0 },
        gain: { type: 'f', value: 0.6 }
      },
      vertexShader: `
        varying vec3 vWorldPos;
        void main() {
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
        }`,
      fragmentShader: glsl`
        #pragma glslify: snoise = require(glsl-noise/simplex/3d.glsl) 

        uniform vec3 color;
        uniform float time;
        uniform float seed;
        uniform mat4 invModelMatrix;
        uniform vec3 scale;
        uniform vec4 noiseScale;
        uniform float magnitude;
        uniform float lacunarity;
        uniform float gain;
        uniform sampler2D fireTex;
        varying vec3 vWorldPos;              

        float turbulence(vec3 p) {
          float sum = 0.0;
          float freq = 1.0;
          float amp = 1.0;
          for(int i = 0; i < OCTIVES; i++) {
            sum += abs(snoise(p * freq)) * amp;
            freq *= lacunarity;
            amp *= gain;
          }
          return sum;
        }

        vec4 samplerFire (vec3 p, vec4 scale) {
          vec2 st = vec2(sqrt(dot(p.xz, p.xz)), p.y);
          if(st.x <= 0.0 || st.x >= 1.0 || st.y <= 0.0 || st.y >= 1.0) return vec4(0.0);
          p.y -= (seed + time) * scale.w;
          p *= scale.xyz;
          st.y += sqrt(st.y) * magnitude * turbulence(p);
          if(st.y <= 0.0 || st.y >= 1.0) return vec4(0.0);
          return texture2D(fireTex, st);
        }

        vec3 localize(vec3 p) {
          return (invModelMatrix * vec4(p, 1.0)).xyz;
        }

        void main() {
          vec3 rayPos = vWorldPos;
          vec3 rayDir = normalize(rayPos - cameraPosition);
          float rayLen = 0.0288 * length(scale.xyz);
          vec4 col = vec4(0.0);
          for(int i = 0; i < ITERATIONS; i++) {
            rayPos += rayDir * rayLen;
            vec3 lp = localize(rayPos);
            lp.y += 0.5;
            lp.xz *= 2.0;
            col += samplerFire(lp, noiseScale);
          }
          col.a = col.r;
          gl_FragColor = col;
        }`
    })
  }
}

extend({ FireMaterial })

function Fire({ color, ...props }) {
  const ref = useRef()
  const texture = useLoader(THREE.TextureLoader, '/fire.png')
  useFrame((state) => {
    const invModelMatrix = ref.current.material.uniforms.invModelMatrix.value
    ref.current.updateMatrixWorld()
    invModelMatrix.copy(ref.current.matrixWorld).invert()
    ref.current.material.uniforms.time.value = state.clock.elapsedTime
    ref.current.material.uniforms.invModelMatrix.value = invModelMatrix
    ref.current.material.uniforms.scale.value = ref.current.scale
  })
  useLayoutEffect(() => {
    texture.magFilter = texture.minFilter = THREE.LinearFilter
    texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping
    ref.current.material.uniforms.fireTex.value = texture
    ref.current.material.uniforms.color.value = color || new THREE.Color(0xeeeeee)
    ref.current.material.uniforms.invModelMatrix.value = new THREE.Matrix4()
    ref.current.material.uniforms.scale.value = new THREE.Vector3(1, 1, 1)
    ref.current.material.uniforms.seed.value = Math.random() * 19.19
  }, [])
  return (
    <mesh ref={ref} {...props}>
      <boxGeometry />
      <fireMaterial transparent depthWrite={false} depthTest={false} />
    </mesh>
  )
}
