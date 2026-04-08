'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { Grid, MeshReflectorMaterial } from '@react-three/drei'
import { useControls, folder } from 'leva'
import { COLORS } from '../theme/theme'
import type { SceneMode } from './SceneContent'

function useRadialAlphaMap(size: number, innerStop: number, outerStop: number) {
  return useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!

    const half = size / 2
    const gradient = ctx.createRadialGradient(half, half, 0, half, half, half)
    gradient.addColorStop(0, '#ffffff')
    gradient.addColorStop(Math.min(innerStop, 0.99), '#ffffff')
    gradient.addColorStop(Math.min(outerStop, 1), '#000000')
    gradient.addColorStop(1, '#000000')

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, size, size)

    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true
    return texture
  }, [size, innerStop, outerStop])
}

export default function GridFloor({ mode }: { mode: SceneMode }) {
  const {
    cellSize,
    cellThickness,
    cellColor,
    sectionSize,
    sectionThickness,
    sectionColor,
    fadeDistance,
    fadeStrength,
    infiniteGrid,
    followCamera,
    resolution,
    fadeInner,
    fadeOuter
  } = useControls('Scene', {
    Grid: folder(
      {
        cellSize: { value: 3.0, min: 0.1, max: 5, step: 0.1, label: 'Cell Size' },
        cellThickness: { value: 1.4, min: 0.1, max: 3, step: 0.1, label: 'Cell Thickness' },
        cellColor: { value: COLORS.gridCell, label: 'Cell Color' },
        sectionSize: { value: 1, min: 1, max: 10, step: 1, label: 'Section Size' },
        sectionThickness: { value: 0.5, min: 0.1, max: 5, step: 0.1, label: 'Section Thickness' },
        sectionColor: { value: COLORS.gridSection, label: 'Section Color' },
        fadeDistance: { value: 67, min: 5, max: 100, step: 1, label: 'Fade Distance' },
        fadeStrength: { value: 3.2, min: 0, max: 5, step: 0.1, label: 'Fade Strength' },
        infiniteGrid: { value: true, label: 'Infinite Grid' },
        followCamera: { value: false, label: 'Follow Camera' }
      },
      { collapsed: true }
    ),
    Floor: folder(
      {
        resolution: { value: 512, options: [256, 512, 1024, 2048], label: 'Resolution' },
        fadeInner: { value: 0.16, min: 0, max: 1, step: 0.01, label: 'Fade Inner' },
        fadeOuter: { value: 0.66, min: 0, max: 1, step: 0.01, label: 'Fade Outer' }
      },
      { collapsed: true }
    )
  })

  const alphaMap = useRadialAlphaMap(512, fadeInner, fadeOuter)
  const showFloor = mode === 'Background'

  return (
    <group>
      {/* Reflective floor plane */}
      {showFloor && (
        <mesh rotation-x={-Math.PI / 2} position={[0, -0.1, 0]} receiveShadow>
          <planeGeometry args={[200, 200]} />
          <MeshReflectorMaterial
            mirror={1}
            blur={[512, 512]}
            resolution={resolution}
            mixBlur={2}
            mixStrength={1}
            roughness={0.5}
            metalness={0.5}
            color="#ffffff"
            depthScale={1.8}
            transparent
            alphaMap={alphaMap}
          />
        </mesh>
      )}

      {/* Visual grid rendered on top */}
      <Grid
        position={[0, 0, 0]}
        args={[100, 100]}
        cellSize={cellSize}
        cellThickness={cellThickness}
        cellColor={cellColor}
        sectionSize={sectionSize}
        sectionThickness={sectionThickness}
        sectionColor={sectionColor}
        fadeDistance={fadeDistance}
        fadeStrength={fadeStrength}
        infiniteGrid={infiniteGrid}
        followCamera={followCamera}
      />
    </group>
  )
}
