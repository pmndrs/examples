import * as THREE from 'three'
import React, { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import useStore, { audio, playAudio } from '../store'

function make(color, speed) {
  return {
    ref: React.createRef(),
    color,
    data: new Array(20)
      .fill()
      .map(() => [
        new THREE.Vector3(),
        new THREE.Vector3(-1 + Math.random() * 2, -1 + Math.random() * 2, -1 + Math.random() * 2).normalize().multiplyScalar(speed * 0.75)
      ])
  }
}

export default function Explosions() {
  const explosions = useStore((state) => state.explosions)
  return explosions.map(({ guid, offset, scale }) => <Explosion key={guid} position={offset} scale={scale * 0.75} />)
}

function Explosion({ position, scale }) {
  const group = useRef()
  const { dummy } = useStore((state) => state.mutation)
  const particles = useMemo(() => [make('white', 0.8), make('orange', 0.6)], [])

  useEffect(() => void playAudio(new Audio(audio.mp3.explosion), 0.5), [])

  useFrame(() => {
    particles.forEach(({ data }, type) => {
      const mesh = group.current.children[type]
      data.forEach(([vec, normal], i) => {
        vec.add(normal)
        dummy.position.copy(vec)
        dummy.updateMatrix()
        mesh.setMatrixAt(i, dummy.matrix)
      })
      mesh.material.opacity -= 0.025
      mesh.instanceMatrix.needsUpdate = true
    })
  })

  return (
    <group ref={group} position={position} scale={[scale, scale, scale]}>
      {particles.map(({ color, data }, index) => (
        <instancedMesh key={index} args={[null, null, data.length]} frustumCulled={false}>
          <dodecahedronGeometry args={[10, 0]} />
          <meshBasicMaterial color={color} transparent opacity={1} fog={false} />
        </instancedMesh>
      ))}
    </group>
  )
}
