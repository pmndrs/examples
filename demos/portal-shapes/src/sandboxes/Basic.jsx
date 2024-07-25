import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'

export default function App(props) {
  return (
    <group {...props}>
      <ambientLight intensity={0.3} onPointerOver={() => null} />
      <pointLight position={[10, 10, 5]} />
      <pointLight position={[-10, -10, -5]} />
      <Box position={[-0.9, 0, 0]} />
      <Box position={[0.9, 0, 0]} />
    </group>
  )
}

function Box(props) {
  const ref = useRef()
  const [hovered, hover] = useState(false)
  const [clicked, click] = useState(false)
  useFrame((state, delta) => (ref.current.rotation.x += delta))
  return (
    <mesh
      {...props}
      ref={ref}
      scale={clicked ? 1.5 : 1}
      onClick={(event) => click(!clicked)}
      onPointerOver={(event) => hover(true)}
      onPointerOut={(event) => hover(false)}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  )
}
