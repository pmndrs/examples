'use client'

import { useControls, folder } from 'leva'
import { EffectComposer, Bloom, Noise } from '@react-three/postprocessing'
import { KernelSize, BlendFunction } from 'postprocessing'
import * as THREE from 'three'

const BLEND_OPTIONS = ['OVERLAY', 'SOFT_LIGHT', 'SCREEN', 'ADD', 'NORMAL', 'MULTIPLY', 'COLOR_DODGE'] as const

type BlendOption = (typeof BLEND_OPTIONS)[number]

const BLEND_MAP: Record<BlendOption, BlendFunction> = {
  OVERLAY: BlendFunction.OVERLAY,
  SOFT_LIGHT: BlendFunction.SOFT_LIGHT,
  SCREEN: BlendFunction.SCREEN,
  ADD: BlendFunction.ADD,
  NORMAL: BlendFunction.NORMAL,
  MULTIPLY: BlendFunction.MULTIPLY,
  COLOR_DODGE: BlendFunction.COLOR_DODGE
}

export default function PostProcessing() {
  const { bloomIntensity, luminanceThreshold, bloomRadius, mipmapBlur, noiseOpacity, noiseBlend, premultiply } = useControls(
    'Post FX',
    {
      Bloom: folder(
        {
          bloomIntensity: { value: 1.6, min: 0, max: 10, step: 0.1, label: 'Intensity' },
          luminanceThreshold: { value: 0.1, min: 0, max: 1, step: 0.01, label: 'Threshold' },
          bloomRadius: { value: 0.56, min: 0, max: 1, step: 0.01, label: 'Radius' },
          mipmapBlur: { value: true, label: 'Mipmap Blur' }
        },
        { collapsed: true }
      ),
      Noise: folder(
        {
          noiseOpacity: { value: 0.17, min: 0, max: 1, step: 0.01, label: 'Opacity' },
          noiseBlend: { value: 'OVERLAY' as BlendOption, options: [...BLEND_OPTIONS], label: 'Blend Mode' },
          premultiply: { value: false, label: 'Premultiply' }
        },
        { collapsed: true }
      )
    },
    { collapsed: true }
  )

  return (
    <EffectComposer multisampling={0} frameBufferType={THREE.HalfFloatType}>
      <Bloom
        intensity={bloomIntensity}
        luminanceThreshold={luminanceThreshold}
        radius={bloomRadius}
        mipmapBlur={mipmapBlur}
        kernelSize={KernelSize.LARGE}
      />
      <Noise premultiply={premultiply} blendFunction={BLEND_MAP[noiseBlend as BlendOption]} opacity={noiseOpacity} />
    </EffectComposer>
  )
}
