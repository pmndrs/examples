import * as THREE from 'three'
import { forwardRef, useImperativeHandle, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import { Reflect } from './Reflect'

export const Beam = forwardRef(({ children, position, stride = 4, width = 8, ...props }, fRef) => {
  const streaks = useRef(null)
  const glow = useRef(null)
  const reflect = useRef(null)
  const [streakTexture, glowTexture] = useTexture(['/textures/lensflare/lensflare2.png', '/textures/lensflare/lensflare0_bw.jpg'])

  const obj = new THREE.Object3D()
  const f = new THREE.Vector3()
  const t = new THREE.Vector3()
  const n = new THREE.Vector3()
  const config = {
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false
  }

  let i = 0
  let range = 0

  useFrame(() => {
    range = reflect.current.update() - 1

    for (i = 0; i < range; i++) {
      // Position 1
      f.fromArray(reflect.current.positions, i * 3)
      // Position 2
      t.fromArray(reflect.current.positions, i * 3 + 3)
      // Calculate normal
      n.subVectors(t, f).normalize()
      // Calculate mid-point
      obj.position.addVectors(f, t).divideScalar(2)
      // Stretch by using the distance
      obj.scale.set(t.distanceTo(f) * stride, width, 1)
      // Convert rotation to euler z
      obj.rotation.set(0, 0, Math.atan2(n.y, n.x))
      obj.updateMatrix()
      streaks.current.setMatrixAt(i, obj.matrix)
    }

    streaks.current.count = range
    streaks.current.instanceMatrix.updateRange.count = range * 16
    streaks.current.instanceMatrix.needsUpdate = true

    // First glow isn't shown
    obj.scale.setScalar(0)
    obj.updateMatrix()
    glow.current.setMatrixAt(0, obj.matrix)

    for (i = 1; i < range; i++) {
      obj.position.fromArray(reflect.current.positions, i * 3)
      obj.scale.setScalar(0.75)
      obj.rotation.set(0, 0, 0)
      obj.updateMatrix()
      glow.current.setMatrixAt(i, obj.matrix)
    }

    glow.current.count = range
    glow.current.instanceMatrix.updateRange.count = range * 16
    glow.current.instanceMatrix.needsUpdate = true
  })

  useImperativeHandle(fRef, () => reflect.current, [])

  return (
    <group position={position}>
      <Reflect {...props} ref={reflect}>
        {children}
      </Reflect>
      <instancedMesh ref={streaks} args={[null, null, 100]} instanceMatrix-usage={THREE.DynamicDrawUsage}>
        <planeGeometry />
        <meshBasicMaterial map={streakTexture} opacity={1.5} {...config} transparent={false} />
      </instancedMesh>
      <instancedMesh ref={glow} args={[null, null, 100]} instanceMatrix-usage={THREE.DynamicDrawUsage}>
        <planeGeometry />
        <meshBasicMaterial map={glowTexture} {...config} />
      </instancedMesh>
    </group>
  )
})
