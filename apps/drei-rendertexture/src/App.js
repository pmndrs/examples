import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { RenderTexture, OrbitControls, PerspectiveCamera, Text, ContactShadows } from '@react-three/drei'
import { suspend } from 'suspend-react'

const inter = import('@pmndrs/assets/fonts/inter_regular.woff')

export default function App() {
  return (
    <Canvas camera={{ position: [5, 5, 5], fov: 25 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} />
      <Cube />
      <Dodecahedron position={[0, 1, 0]} scale={0.2} />
      <ContactShadows frames={1} position={[0, -0.5, 0]} blur={1} opacity={0.75} />
      <ContactShadows frames={1} position={[0, -0.5, 0]} blur={3} color="orange" />
      <OrbitControls minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} />
    </Canvas>
  )
}

function Cube() {
  const textRef = useRef()
  useFrame((state) => (textRef.current.position.x = Math.sin(state.clock.elapsedTime) * 2))
  return (
    <mesh>
      <boxGeometry />
      <meshStandardMaterial>
        <RenderTexture attach="map" anisotropy={16}>
          <PerspectiveCamera makeDefault manual aspect={1 / 1} position={[0, 0, 5]} />
          <color attach="background" args={['orange']} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} />
          <Text font={suspend(inter).default} ref={textRef} fontSize={4} color="#555">
            hello
          </Text>
          <Dodecahedron />
        </RenderTexture>
      </meshStandardMaterial>
    </mesh>
  )
}

function Dodecahedron(props) {
  const meshRef = useRef()
  const [hovered, hover] = useState(false)
  const [clicked, click] = useState(false)
  useFrame(() => (meshRef.current.rotation.x += 0.01))
  return (
    <group {...props}>
      <mesh
        ref={meshRef}
        scale={clicked ? 1.5 : 1}
        onClick={() => click(!clicked)}
        onPointerOver={() => hover(true)}
        onPointerOut={() => hover(false)}>
        <dodecahedronGeometry args={[0.75]} />
        <meshStandardMaterial color={hovered ? 'hotpink' : '#5de4c7'} />
      </mesh>
    </group>
  )
}
