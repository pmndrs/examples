import * as THREE from 'three'
import React, { useRef } from 'react'
import { useLoader, useFrame } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import useStore from '../store'

export default function Enemies() {
  const enemies = useStore((state) => state.enemies)
  return enemies.map((data, i) => <Drone key={i} data={data} />)
}

const box = new THREE.Box3()
box.setFromCenterAndSize(new THREE.Vector3(0, 0, 1), new THREE.Vector3(3, 3, 3))
const glowMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color('lightblue') })
const bodyMaterial = new THREE.MeshPhongMaterial({ color: new THREE.Color('black') })

const Drone = React.memo(({ data }) => {
  const { clock } = useStore((state) => state.mutation)
  const { nodes, materials } = useLoader(GLTFLoader, '/spacedrone.gltf')
  const ref = useRef()

  useFrame(() => {
    const r = Math.cos((clock.getElapsedTime() / 2) * data.speed) * Math.PI
    ref.current.position.copy(data.offset)
    ref.current.rotation.set(r, r, r)
  })

  return (
    <group ref={ref} scale={[5, 5, 5]}>
      <mesh position={[0, 0, 50]} rotation={[Math.PI / 2, 0, 0]} material={glowMaterial}>
        <cylinderBufferGeometry args={[0.25, 0.25, 100, 4]} />
      </mesh>
      <mesh name="Sphere_DroneGlowmat_0" geometry={nodes.Sphere_DroneGlowmat_0.geometry} material={materials.DroneGlowmat} />
      <mesh name="Sphere_Body_0" geometry={nodes.Sphere_Body_0.geometry} material={bodyMaterial} />
    </group>
  )
})
