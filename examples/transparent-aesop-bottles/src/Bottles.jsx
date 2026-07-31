import * as THREE from 'three'
import { useRef, useState } from 'react'
import { useCursor, useGLTF } from '@react-three/drei'

import model from './draco.glb?url'

const bottleMaterial = new THREE.MeshPhysicalMaterial({
  color: '#efefef',
  transmission: 1,
  roughness: 0.35,
  thickness: 500,
  envMapIntensity: 4,
})

const capMaterial = new THREE.MeshStandardMaterial({ color: new THREE.Color('white') })

function Bottle({ glas, cap, children, ...props }) {
  const ref = useRef()
  const { nodes } = useGLTF(model)
  const [hovered, set] = useState(false)
  useCursor(hovered)
  return (
    <group rotation={[Math.PI / 2, 0, 3]} {...props} onPointerOver={(e) => set(true)} onPointerOut={() => set(false)}>
      <group ref={ref}>
        <mesh castShadow geometry={nodes[glas].geometry} material={bottleMaterial} />
        <mesh castShadow geometry={nodes[cap].geometry} material={capMaterial} />
      </group>
    </group>
  )
}

export default function Bottles(props) {
  return (
    <group {...props} dispose={null} scale={[0.1, 0.1, 0.1]}>
      <Bottle position={[140, 0, 0]} glas="Untitled018" cap="Untitled018_1" />
      <Bottle position={[80, 0, 0]} glas="Untitled078" cap="Untitled078_1" />
      <Bottle position={[-2, 0, 0]} glas="Untitled064" cap="Untitled064_1" />
      <Bottle position={[-90, 0, 0]} glas="Untitled052" cap="Untitled052_1" />
      <Bottle position={[-140, 0, 0]} glas="Untitled072" cap="Untitled072_1" />
      <Bottle position={[-180, 0, 0]} glas="Untitled007" cap="Untitled007_1" />
    </group>
  )
}
