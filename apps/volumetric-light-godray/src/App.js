import * as THREE from 'three'
import { forwardRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { CubeCamera, Float, MeshReflectorMaterial } from '@react-three/drei'
import { EffectComposer, GodRays, Bloom } from '@react-three/postprocessing'
import { easing } from 'maath'

export default function App() {
  return (
    <Canvas camera={{ position: [0, 0, 30], fov: 35, near: 1, far: 60 }} gl={{ antialias: false }}>
      <color attach="background" args={['#050505']} />
      <ambientLight />
      {/** The screen uses postpro godrays */}
      <Screen />
      {/** The sphere reflects the screen with a cube-cam */}
      <Float rotationIntensity={3} floatIntensity={3} speed={1}>
        <CubeCamera position={[-3, -1, -5]} resolution={256} frames={Infinity}>
          {(texture) => (
            <mesh>
              <sphereGeometry args={[2, 32, 32]} />
              <meshStandardMaterial metalness={1} roughness={0.1} envMap={texture} />
            </mesh>
          )}
        </CubeCamera>
      </Float>
      {/** The floor uses drei/MeshReflectorMaterial */}
      <Floor />
      <Rig />
    </Canvas>
  )
}

function Rig() {
  useFrame((state, delta) => {
    easing.damp3(state.camera.position, [5 + state.pointer.x, 0 + +state.pointer.y, 18 + Math.atan2(state.pointer.x, state.pointer.y) * 2], 0.4, delta)
    state.camera.lookAt(0, 0, 0)
  })
}

const Floor = () => (
  <mesh position={[0, -5.02, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
    <planeGeometry args={[50, 50]} />
    <MeshReflectorMaterial
      blur={[300, 50]}
      resolution={1024}
      mixBlur={1}
      mixStrength={100}
      roughness={1}
      depthScale={1.2}
      minDepthThreshold={0.4}
      maxDepthThreshold={1.4}
      color="#202020"
      metalness={0.8}
    />
  </mesh>
)

const Emitter = forwardRef((props, forwardRef) => {
  const [video] = useState(() => Object.assign(document.createElement('video'), { src: '/10.mp4', crossOrigin: 'Anonymous', loop: true, muted: true }))
  useEffect(() => void video.play(), [video])
  return (
    <mesh ref={forwardRef} position={[0, 0, -16]} {...props}>
      <planeGeometry args={[16, 10]} />
      <meshBasicMaterial>
        <videoTexture attach="map" args={[video]} colorSpace={THREE.SRGBColorSpace} />
      </meshBasicMaterial>
      <mesh scale={[16.05, 10.05, 1]} position={[0, 0, -0.01]}>
        <planeGeometry />
        <meshBasicMaterial color="black" />
      </mesh>
    </mesh>
  )
})

function Screen() {
  const [material, set] = useState()
  return (
    <>
      <Emitter ref={set} />
      {material && (
        <EffectComposer disableNormalPass multisampling={8}>
          <GodRays sun={material} exposure={0.34} decay={0.8} blur />
          <Bloom luminanceThreshold={0} mipmapBlur luminanceSmoothing={0.0} intensity={1} />
        </EffectComposer>
      )}
    </>
  )
}
