'use client'

import type { MutableRefObject } from 'react'
import { useControls, folder, button } from 'leva'

export function useShieldControls(lifeRef: MutableRefObject<number>) {
  return useControls(
    'Force Shield',
    () => ({
      debugAlwaysOn: { value: true, label: 'Show Shield' },
      manualReveal: { value: false, label: 'Manual Reveal' },
      revealProgress: { value: 0.0, min: 0, max: 1, step: 0.01, label: '↳ Reveal Progress' },
      Transform: folder(
        {
          posX: { value: 0, min: -10, max: 10, step: 0.1, label: 'Pos X' },
          posY: { value: 2, min: -10, max: 10, step: 0.1, label: 'Pos Y' },
          posZ: { value: 0.2, min: -10, max: 10, step: 0.1, label: 'Pos Z' },
          scale: { value: 1, min: 0.1, max: 5, step: 0.05, label: 'Scale' }
        },
        { collapsed: true }
      ),
      color: '#26aeff',
      hexScale: { value: 3.0, min: 1, max: 20, step: 0.5 },
      hexOpacity: { value: 0.13, min: 0, max: 1, step: 0.01, label: 'Hex Opacity' },
      showHex: { value: true, label: 'Show Hex' },
      edgeWidth: { value: 0.06, min: 0.01, max: 0.2, step: 0.005 },
      fresnelPower: { value: 1.8, min: 0.5, max: 5, step: 0.1, label: 'Fresnel Power' },
      fresnelStrength: { value: 1.75, min: 0, max: 3, step: 0.05, label: 'Fresnel Strength' },
      opacity: { value: 0.76, min: 0, max: 1, step: 0.01 },
      fadeStart: { value: 0.0, min: -1, max: 1, step: 0.01, label: 'Fade Start' },
      revealSpeed: { value: 3.5, min: 0.5, max: 5, step: 0.1 },
      flashSpeed: { value: 0.6, min: 0.5, max: 8, step: 0.1 },
      flashIntensity: { value: 0.11, min: 0, max: 1, step: 0.01 },
      noiseScale: { value: 1.3, min: 0.5, max: 10, step: 0.1 },
      noiseEdgeColor: { value: '#26aeff', label: 'Noise Edge Color' },
      noiseEdgeWidth: { value: 0.02, min: 0.01, max: 0.5, step: 0.01, label: 'Noise Edge Width' },
      noiseEdgeIntensity: { value: 10.0, min: 0, max: 10, step: 0.1, label: 'Noise Edge Intensity' },
      noiseEdgeSmoothness: { value: 0.5, min: 0, max: 1, step: 0.01, label: 'Noise Edge Smoothness' },
      'Flow Noise': folder(
        {
          flowScale: { value: 2.4, min: 0.1, max: 8, step: 0.1, label: 'Scale' },
          flowSpeed: { value: 1.13, min: 0, max: 2, step: 0.01, label: 'Speed' },
          flowIntensity: { value: 4, min: 0, max: 4, step: 0.05, label: 'Intensity' }
        },
        { collapsed: false }
      ),
      'Hit Effect': folder(
        {
          hitRingSpeed: { value: 1.75, min: 0.1, max: 6, step: 0.05, label: 'Ring Speed' },
          hitRingWidth: { value: 0.12, min: 0.01, max: 0.5, step: 0.01, label: 'Ring Width' },
          hitMaxRadius: { value: 0.85, min: 0.2, max: 3.14, step: 0.05, label: 'Max Radius' },
          hitDuration: { value: 1.8, min: 0.5, max: 6, step: 0.1, label: 'Duration' },
          hitIntensity: { value: 4.1, min: 0, max: 8, step: 0.1, label: 'Intensity' },
          hitImpactRadius: { value: 0.3, min: 0.1, max: 1.5, step: 0.05, label: 'Impact Radius' },
          hitDamage: { value: 5, min: 1, max: 100, step: 1, label: 'Damage %' },
          'Reset Life': button(() => {
            lifeRef.current = 1.0
          })
        },
        { collapsed: false }
      )
    }),
    { collapsed: true }
  )
}
