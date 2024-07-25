import { useRef, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'

export default function App() {
  const ref = useRef()
  return (
    <div ref={ref} className="container">
      <div className="text">
        "But afterwards there occurred violent earthquakes and floods; and in a single day and night of rain all your warlike men in a body sank into the earth,
        and the island of Atlantis in like manner disappeared, and was sunk beneath the sea."
      </div>
      <Canvas
        shadows
        frameloop="demand"
        camera={{ position: [0, 0, 4] }}
        style={{ pointerEvents: 'none' }}
        // In order for two dom nodes to be able to receive events they must share
        // the same source. By re-connecting the canvas to a parent that contains the
        // text content as well as the canvas we do just that.
        eventSource={ref}
        eventPrefix="offset">
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} angle={0.15} penumbra={1} castShadow shadow-mapSize={[2024, 2024]} />
        <pointLight position={[10, 0, 0]} />
        <Box position={[-1.2, 0, 0]} />
        <Box position={[1.2, 0, 0]} />
        <Shadows position={[0, 0, -0.5]} />
      </Canvas>
    </div>
  )
}

function Box(props) {
  const ref = useRef()
  const [hovered, hover] = useState(false)
  return (
    <mesh {...props} castShadow ref={ref} onPointerOver={(event) => hover(true)} onPointerOut={(event) => hover(false)}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  )
}

function Shadows(props) {
  const { viewport } = useThree()
  return (
    <mesh receiveShadow scale={[viewport.width, viewport.height, 1]} {...props}>
      <planeGeometry />
      <shadowMaterial transparent opacity={0.5} />
    </mesh>
  )
}
