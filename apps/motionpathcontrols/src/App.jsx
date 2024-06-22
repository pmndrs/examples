import * as THREE from 'three'
import { useRef, forwardRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Clouds, Cloud, MotionPathControls, useMotion, useTexture, OrbitControls, MeshWobbleMaterial, Gltf, Float, Environment } from '@react-three/drei'
import { EffectComposer, TiltShift2, HueSaturation, DotScreen } from '@react-three/postprocessing'
import { useControls } from 'leva'
import * as CURVES from './curves'

export function App() {
  const poi = useRef()
  const motionRef = useRef()
  const { float, attachCamera, debug, path } = useControls({
    attachCamera: true,
    debug: false,
    float: true,
    path: { value: 'Circle', options: ['Circle', 'Rollercoaster', 'Infinity', 'Heart'] },
  })
  const Curve = CURVES[path]
  return (
    <Canvas camera={{ position: [10, 15, -10], fov: 45 }}>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      {!attachCamera && <OrbitControls />}
      <MotionPathControls object={attachCamera ? null : motionRef} focus={poi} debug={debug} damping={0.2} focusDamping={0.15}>
        <Curve />
        <Loop />
      </MotionPathControls>
      <Gltf visible={!attachCamera} src="/sony_cinema_camera-transformed.glb" scale={0.03} ref={motionRef} />
      <Float floatIntensity={20} rotationIntensity={25} speed={float ? 4 : 0}>
        <Sticker position={[1, 0, 1]} scale={2} ref={poi} />
      </Float>
      <Environment preset="city" background blur={0.5} />
      <Clouds>
        <Cloud concentrate="outside" seed={1} segments={100} bounds={20} volume={20} growth={10} opacity={0.15} position={[0, 0, -10]} speed={1} />
      </Clouds>
      <EffectComposer disableNormalPass multisampling={4}>
        <HueSaturation saturation={-1} />
        <TiltShift2 blur={0.5} />
        <DotScreen scale={2} />
      </EffectComposer>
    </Canvas>
  )
}

function Loop({ factor = 0.2 }) {
  const motion = useMotion()
  useFrame((state, delta) => (motion.current += Math.min(0.1, delta) * factor))
}

const Sticker = forwardRef(({ url, ...props }, ref) => {
  const [smiley, invert] = useTexture(['Sticjer_1024x1024@2x.png', 'Sticjer_1024x1024@2x_invert.png'])
  return (
    <mesh ref={ref} {...props}>
      <planeGeometry args={[1, 1, 32, 32]} />
      <MeshWobbleMaterial
        factor={4}
        speed={2}
        depthTest={false}
        transparent
        map={smiley}
        map-flipY={false}
        roughness={1}
        roughnessMap={invert}
        roughnessMap-flipY={false}
        map-anisotropy={16}
        metalness={0.8}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
})
