import React, { useRef, useEffect } from 'react'
import useStore from '../store'

export default function Particles() {
  const instancedMesh = useRef()
  const { particles, dummy } = useStore((state) => state.mutation)

  useEffect(() => {
    particles.forEach((particle, i) => {
      const { offset, scale } = particle
      dummy.position.copy(offset)
      dummy.scale.set(scale, scale, scale)
      dummy.rotation.set(Math.sin(Math.random()) * Math.PI, Math.sin(Math.random()) * Math.PI, Math.cos(Math.random()) * Math.PI)
      dummy.updateMatrix()
      instancedMesh.current.setMatrixAt(i, dummy.matrix)
    })
    instancedMesh.current.instanceMatrix.needsUpdate = true
  }, [])

  return (
    <instancedMesh ref={instancedMesh} args={[null, null, particles.length]} frustumCulled={false}>
      <coneGeometry args={[2, 2, 3]} />
      <meshStandardMaterial color="#606060" />
    </instancedMesh>
  )
}
