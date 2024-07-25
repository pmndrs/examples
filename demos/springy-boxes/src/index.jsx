import { createRoot } from 'react-dom/client'
import * as THREE from 'three'
import React, { useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { useSprings, a } from '@react-spring/three'
import './styles.css'

const length = 35
const colors = ['#A2CCB6', '#FCEEB5', '#EE786E', '#e0feff', 'lightpink', 'lightblue']
const data = Array.from({ length }, () => ({ args: [0.1 + Math.random() * 9, 0.1 + Math.random() * 9, 10] }))
const random = (i) => {
  const r = Math.random()
  return {
    position: [100 - Math.random() * 200, 100 - Math.random() * 200, i * 1.5],
    color: colors[Math.round(Math.random() * (colors.length - 1))],
    scale: [1 + r * 14, 1 + r * 14, 1],
    rotation: [0, 0, THREE.MathUtils.degToRad(Math.round(Math.random()) * 45)]
  }
}

function Content() {
  const [springs, set] = useSprings(length, (i) => ({ from: random(i), ...random(i), config: { mass: 20, tension: 150, friction: 50 } }))
  useEffect(() => void setInterval(() => set((i) => ({ ...random(i), delay: i * 40 })), 3000), [])
  return data.map((d, index) => (
    <a.mesh key={index} {...springs[index]} castShadow receiveShadow>
      <boxBufferGeometry args={d.args} />
      <a.meshStandardMaterial color={springs[index].color} roughness={0.75} metalness={0.5} />
    </a.mesh>
  ))
}

createRoot(document.getElementById('root')).render(
  <Canvas flat shadows camera={{ position: [0, 0, 100], fov: 100 }}>
    <pointLight intensity={0.5} />
    <ambientLight intensity={1.85} />
    <spotLight castShadow intensity={0.2} angle={Math.PI / 7} position={[150, 150, 250]} penumbra={1} shadow-mapSize={2048} />
    <Content />
  </Canvas>
)
