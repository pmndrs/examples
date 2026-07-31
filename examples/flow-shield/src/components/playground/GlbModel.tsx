'use client'

import { useMemo, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import { useControls, folder } from 'leva'
import { Box3, Vector3, MathUtils } from 'three'
import type { Mesh, MeshStandardMaterial } from 'three'
import type { SceneMode } from './SceneContent'

interface GlbModelProps {
  url: string
  onLoaded?: () => void
  mode: SceneMode
}

export default function GlbModel({ url, onLoaded, mode }: GlbModelProps) {
  const { scene } = useGLTF(url)
  const wireframe = mode === 'Frame'

  useEffect(() => {
    onLoaded?.()
  }, [scene, onLoaded])

  const autoScale = useMemo(() => {
    const box = new Box3().setFromObject(scene as any)
    const center = new Vector3()
    box.getCenter(center)
    scene.position.sub(center)

    const size = new Vector3()
    box.getSize(size)
    const maxDim = Math.max(size.x, size.y, size.z)
    const s = maxDim > 0 ? 3 / maxDim : 1

    scene.scale.setScalar(s)

    scene.traverse((child) => {
      if ('isMesh' in child && child.isMesh) {
        ;(child as any).castShadow = true
        ;(child as any).receiveShadow = true
      }
    })

    return s
  }, [scene])

  useEffect(() => {
    scene.traverse((child) => {
      if ('isMesh' in child && child.isMesh) {
        const mat = (child as any).material
        if (Array.isArray(mat)) {
          mat.forEach((m) => {
            ;(m as any as MeshStandardMaterial).wireframe = wireframe
          })
        } else {
          ;(mat as any as MeshStandardMaterial).wireframe = wireframe
        }
      }
    })
  }, [scene, wireframe])

  const { scale, posX, posY, posZ, rotX, rotY, rotZ } = useControls('Model', {
    Transform: folder(
      {
        scale: { value: autoScale, min: 0.01, max: 20, step: 0.01, label: 'Scale' },
        posX: { value: 0, min: -10, max: 10, step: 0.1, label: 'Pos X' },
        posY: { value: 1, min: -10, max: 10, step: 0.1, label: 'Pos Y' },
        posZ: { value: 0, min: -10, max: 10, step: 0.1, label: 'Pos Z' }
      },
      { collapsed: false }
    ),
    Rotation: folder(
      {
        rotX: { value: 0, min: -180, max: 180, step: 1, label: 'Rot X' },
        rotY: { value: 0, min: -180, max: 180, step: 1, label: 'Rot Y' },
        rotZ: { value: 0, min: -180, max: 180, step: 1, label: 'Rot Z' }
      },
      { collapsed: true }
    )
  })

  return (
    <group position={[posX, posY, posZ]} rotation={[MathUtils.degToRad(rotX), MathUtils.degToRad(rotY), MathUtils.degToRad(rotZ)]}>
      <primitive object={scene} scale={scale} />
    </group>
  )
}
