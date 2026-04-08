'use client'

import { useRef, useEffect } from 'react'
import type { ComponentRef } from 'react'
import { useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useControls, folder } from 'leva'
import { MathUtils } from 'three'
import type { Preset } from '../overlay/OverlayButtons'

const DEFAULT_POS: [number, number, number] = [8, 5, 8]

const TARGETS: Record<Preset, [number, number, number]> = {
  default: [0, 2, 0.2],
  droideka: [0, 1, 0.2]
}

export default function SceneCamera({ preset = 'default' }: { preset?: Preset }) {
  const controlsRef = useRef<ComponentRef<typeof OrbitControls> | null>(null)
  const camera = useThree((s) => s.camera)

  const { autoRotate, autoRotateSpeed, dampingFactor, minDistance, maxDistance, minPolarAngle, maxPolarAngle, fov, posX, posY, posZ } =
    useControls('Scene', {
      Camera: folder(
        {
          autoRotate: { value: true, label: 'Auto Rotate' },
          autoRotateSpeed: { value: 0.2, min: 0.01, max: 5, step: 0.01, label: 'Rotate Speed' },
          dampingFactor: { value: 0.08, min: 0.01, max: 0.3, step: 0.01, label: 'Damping' },
          minDistance: { value: 3, min: 1, max: 20, step: 0.5, label: 'Min Distance' },
          maxDistance: { value: 40, min: 10, max: 100, step: 1, label: 'Max Distance' },
          minPolarAngle: { value: 10, min: 0, max: 90, step: 1, label: 'Min Polar (deg)' },
          maxPolarAngle: { value: 85, min: 0, max: 90, step: 1, label: 'Max Polar (deg)' },
          fov: { value: 26, min: 20, max: 120, step: 1, label: 'FOV' },
          Position: folder(
            {
              posX: { value: DEFAULT_POS[0], min: -50, max: 50, step: 0.5, label: 'X' },
              posY: { value: DEFAULT_POS[1], min: 0, max: 50, step: 0.5, label: 'Y' },
              posZ: { value: DEFAULT_POS[2], min: -50, max: 50, step: 0.5, label: 'Z' }
            },
            { collapsed: true }
          )
        },
        { collapsed: true }
      )
    })

  useEffect(() => {
    camera.position.set(posX, posY, posZ)
  }, [posX, posY, posZ, camera])

  // Re-center camera when preset changes
  useEffect(() => {
    const controls = controlsRef.current
    if (!controls) return
    const [tx, ty, tz] = TARGETS[preset]
    controls.target.set(tx, ty, tz)
    controls.update()
  }, [preset])

  if ('fov' in camera && camera.fov !== fov) {
    camera.fov = fov
    camera.updateProjectionMatrix()
  }

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      target={TARGETS[preset]}
      autoRotate={autoRotate}
      autoRotateSpeed={autoRotateSpeed}
      dampingFactor={dampingFactor}
      minDistance={minDistance}
      maxDistance={maxDistance}
      minPolarAngle={MathUtils.degToRad(minPolarAngle)}
      maxPolarAngle={MathUtils.degToRad(maxPolarAngle)}
    />
  )
}
