'use client'

import { useRef, useEffect } from 'react'
import { useHelper } from '@react-three/drei'
import { useControls, folder } from 'leva'
import { DirectionalLight, DirectionalLightHelper } from 'three'
import type { Preset } from '../overlay/OverlayButtons'

const LIGHTING_PRESETS: Record<Preset, Record<string, unknown>> = {
  default: {
    ambientIntensity: 0.4,
    ambientColor: '#ffffff',
    dirIntensity: 1.5,
    dirColor: '#ffeedd'
  },
  droideka: {
    ambientIntensity: 2,
    ambientColor: '#3672ff',
    dirIntensity: 2.5,
    dirColor: '#d7def5'
  }
}

export default function SceneLighting({ preset }: { preset?: Preset }) {
  const dirLightRef = useRef<DirectionalLight>(null!)

  const [{ ambientIntensity, ambientColor, dirIntensity, dirColor, dirX, dirY, dirZ, castShadow, shadowMapSize, showHelper }, setLighting] =
    useControls('Scene', () => ({
      Lighting: folder(
        {
          Ambient: folder(
            {
              ambientIntensity: { value: 0.4, min: 0, max: 2, step: 0.05, label: 'Intensity' },
              ambientColor: { value: '#ffffff', label: 'Color' }
            },
            { collapsed: true }
          ),
          Directional: folder(
            {
              dirIntensity: { value: 1.5, min: 0, max: 5, step: 0.1, label: 'Intensity' },
              dirColor: { value: '#ffeedd', label: 'Color' },
              dirX: { value: 5, min: -20, max: 20, step: 0.5, label: 'Pos X' },
              dirY: { value: 8, min: 0, max: 30, step: 0.5, label: 'Pos Y' },
              dirZ: { value: 3, min: -20, max: 20, step: 0.5, label: 'Pos Z' },
              castShadow: { value: true, label: 'Cast Shadow' },
              shadowMapSize: { value: 2048, options: [512, 1024, 2048, 4096], label: 'Shadow Map' },
              showHelper: { value: false, label: 'Show Helper' }
            },
            { collapsed: true }
          )
        },
        { collapsed: true }
      )
    }))

  useEffect(() => {
    if (preset) setLighting(LIGHTING_PRESETS[preset])
  }, [preset])

  useHelper(showHelper && dirLightRef, DirectionalLightHelper, 1, dirColor)

  return (
    <>
      <ambientLight intensity={ambientIntensity} color={ambientColor} />
      <directionalLight
        ref={dirLightRef}
        intensity={dirIntensity}
        color={dirColor}
        position={[dirX, dirY, dirZ]}
        castShadow={castShadow}
        shadow-mapSize-width={shadowMapSize}
        shadow-mapSize-height={shadowMapSize}
        shadow-normalBias={0.04}
        shadow-camera-near={0.5}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
    </>
  )
}
