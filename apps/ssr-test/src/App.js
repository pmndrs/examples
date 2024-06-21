import * as THREE from 'three'
import { useEffect, useState, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { RoundedBox, useCursor } from '@react-three/drei'
import { Effects } from './Effects'

export const App = () => (
  <Canvas shadows gl={{ logarithmicDepthBuffer: true, antialias: false, stencil: false, depth: false }} camera={{ position: [250, 225, 250], fov: 15 }}>
    <color attach="background" args={['#151520']} />
    <hemisphereLight intensity={0.5} />
    <directionalLight position={[0, 2, 5]} castShadow intensity={1} />
    <group position={[2, -2, 0]}>
      <group position={[0, -0.9, -3]}>
        <Plane color="black" rotation-x={-Math.PI / 2} position-z={3} scale={[4, 20, 0.2]} />
        <Plane color="#f4ae00" rotation-x={-Math.PI / 2} position-y={1} scale={[4.2, 1, 4]} />
        <Plane color="#436fbd" rotation-x={-Math.PI / 2} position={[-1.7, 1, 6]} scale={[1.5, 4, 3]} />
        <Plane color="#d7dfff" rotation-x={-Math.PI / 2} position={[0, 4, 3]} scale={[2, 0.03, 4]} />
      </group>
      <Sphere />
      <Video />
    </group>
    <Effects />
  </Canvas>
)

function Sphere() {
  const ref = useRef()
  const [active, setActive] = useState(false)
  const [zoom, set] = useState(true)
  useCursor(active)
  useFrame((state) => {
    ref.current.position.y = Math.sin(state.clock.getElapsedTime() / 2)
    state.camera.position.lerp({ x: 50, y: 25, z: zoom ? 50 : -50 }, 0.03)
    state.camera.lookAt(0, 0, 0)
  })
  return (
    <mesh ref={ref} receiveShadow castShadow onClick={() => set(!zoom)} onPointerOver={() => setActive(true)} onPointerOut={() => setActive(false)}>
      <sphereGeometry args={[0.8, 64, 64]} />
      <meshStandardMaterial color={active ? 'hotpink' : 'lightblue'} clearcoat={1} clearcoatRoughness={0} roughness={0} metalness={0.25} />
    </mesh>
  )
}

const Plane = ({ color, ...props }) => (
  <RoundedBox receiveShadow castShadow smoothness={10} radius={0.015} {...props}>
    <meshStandardMaterial color={color} envMapIntensity={0.5} roughness={0} metalness={0} />
  </RoundedBox>
)

function Video() {
  const [video] = useState(() => Object.assign(document.createElement('video'), { src: '/drei_r.mp4', crossOrigin: 'Anonymous', loop: true, muted: true }))
  useEffect(() => void video.play(), [video])
  return (
    <mesh position={[-2, 4, 0]} rotation={[0, Math.PI / 2, 0]} scale={[17, 10, 1]}>
      <planeGeometry />
      <meshBasicMaterial toneMapped={false}>
        <videoTexture attach="map" args={[video]} encoding={THREE.sRGBEncoding} />
      </meshBasicMaterial>
    </mesh>
  )
}
