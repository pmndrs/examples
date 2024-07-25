import React, { useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import useStore from '../store'

let offset = 0
export default function Rig({ children }) {
  const group = useRef()
  const rig = useRef()
  const mutation = useStore((state) => state.mutation)
  const { fov, scale, binormal, normal, track, mouse } = mutation
  const { camera } = useThree()

  useFrame(() => {
    const t = mutation.t
    const pos = mutation.position.clone()
    const segments = track.tangents.length
    const pickt = t * segments
    const pick = Math.floor(pickt)
    const pickNext = (pick + 1) % segments
    binormal.subVectors(track.binormals[pickNext], track.binormals[pick])
    binormal.multiplyScalar(pickt - pick).add(track.binormals[pick])
    const dir = track.parameters.path.getTangentAt(t)
    offset += (Math.max(15, 15 + -mouse.y / 20) - offset) * 0.05
    normal.copy(binormal).cross(dir)
    pos.add(normal.clone().multiplyScalar(offset))
    camera.position.copy(pos)
    const lookAt = track.parameters.path.getPointAt((t + 30 / track.parameters.path.getLength()) % 1).multiplyScalar(scale)
    camera.matrix.lookAt(camera.position, lookAt, normal)
    camera.quaternion.setFromRotationMatrix(camera.matrix)
    camera.fov += ((t > 0.4 && t < 0.45 ? 120 : fov) - camera.fov) * 0.05
    camera.updateProjectionMatrix()
    const lightPos = track.parameters.path.getPointAt((t + 1 / track.parameters.path.getLength()) % 1).multiplyScalar(scale)
    group.current.position.copy(lightPos)
    group.current.quaternion.setFromRotationMatrix(camera.matrix)
  })

  return (
    <group ref={group}>
      <pointLight distance={400} position={[0, 100, -420]} intensity={5} color="indianred" />
      <group ref={rig} position={[0, 0, -50]}>
        {children}
      </group>
    </group>
  )
}
