import { useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Html, OrbitControls } from '@react-three/drei'
import { Slider } from 'antd'

function Box() {
  const [size, set] = useState(0.5)
  const controls = useThree((state) => state.controls)
  return (
    <mesh scale={size * 2}>
      <boxGeometry />
      <meshStandardMaterial />
      <Html occlude distanceFactor={1.5} position={[0, 0, 0.51]} transform>
        <span>Size</span>
        <Slider
          style={{ width: 100 }}
          min={0.5}
          max={1}
          step={0.01}
          value={size}
          onChange={(value) => ((controls.enabled = false), set(value))}
          onAfterChange={() => (controls.enabled = true)}
        />
      </Html>
    </mesh>
  )
}

export default function App() {
  return (
    <Canvas camera={{ position: [2, 1, 5], fov: 25 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 5]} />
      <pointLight position={[-10, -10, -10]} />
      <Box />
      <OrbitControls makeDefault />
    </Canvas>
  )
}
