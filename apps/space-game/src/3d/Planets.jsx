import * as THREE from 'three'
import React, { useRef } from 'react'
import { useLoader } from '@react-three/fiber'
import earthImg from '../images/earth.jpg'
import moonImg from '../images/moon.png'

export default function Planets() {
  const ref = useRef()
  const [texture, moon] = useLoader(THREE.TextureLoader, [earthImg, moonImg])
  return (
    <group ref={ref} scale={[100, 100, 100]} position={[-500, -500, 1000]}>
      <mesh>
        <sphereGeometry args={[5, 32, 32]} />
        <meshStandardMaterial map={texture} roughness={1} fog={false} />
      </mesh>
      <mesh position={[5, -5, -5]}>
        <sphereGeometry args={[0.75, 32, 32]} />
        <meshStandardMaterial roughness={1} map={moon} fog={false} />
      </mesh>
      <pointLight position={[-5, -5, -5]} distance={1000} intensity={6} />
      <mesh position={[-30, -10, -60]}>
        <sphereGeometry args={[4, 32, 32]} />
        <meshBasicMaterial color="#FFFF99" fog={false} />
        <pointLight distance={6100} intensity={50} color="white" />
      </mesh>
    </group>
  )
}
