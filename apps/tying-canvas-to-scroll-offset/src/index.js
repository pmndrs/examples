import * as THREE from 'three'
import { useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import './styles.css'

function Box({ text, color, ...props }) {
  const [hovered, set] = useState(false)
  return (
    <mesh {...props} onPointerOver={(e) => set(true)} onPointerOut={(e) => set(false)}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : color} />
      <Html position={[0, 0, 1]} className="label" center>
        {text}
      </Html>
    </mesh>
  )
}

function ScrollContainer({ scroll, children }) {
  const { viewport } = useThree()
  const group = useRef()
  useFrame((state, delta) => {
    group.current.position.y = THREE.MathUtils.damp(group.current.position.y, viewport.height * scroll.current, 4, delta)
  })
  return <group ref={group}>{children}</group>
}

function Scene() {
  const viewport = useThree((state) => state.viewport)
  return (
    <>
      <Box text={<span>This is HTML</span>} color="aquamarine" />
      <Box text={<h1>H1 caption</h1>} color="lightblue" position={[0, -viewport.height, 0]} />
    </>
  )
}

function App() {
  const scrollRef = useRef()
  const scroll = useRef(0)
  return (
    <>
      <Canvas eventSource={document.getElementById('root')} eventPrefix="client">
        <ambientLight />
        <pointLight position={[10, 0, 10]} />
        <ScrollContainer scroll={scroll}>
          <Scene />
        </ScrollContainer>
      </Canvas>
      <div
        ref={scrollRef}
        onScroll={(e) => (scroll.current = e.target.scrollTop / (e.target.scrollHeight - e.target.clientHeight))}
        className="scroll">
        <div style={{ height: `200vh`, pointerEvents: 'none' }}></div>
      </div>
    </>
  )
}

createRoot(document.getElementById('root')).render(<App />)
