import * as THREE from 'three'
import { useCallback, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { EffectComposer } from '@react-three/postprocessing'
import { WaterEffect } from './WaterEffect'
import state from '../state'

function ScrollWaterEffect() {
  const effect = useRef()
  // @todo: fixed with the next release of react-pp
  const setEffect = useCallback((value) => {
    effect.current = value
  }, [])
  const last = useRef(state.top)
  const index = useRef(0)
  const values = useRef(Array(10).fill(0))
  const waterTime = useRef(0)

  useFrame(() => {
    const { top } = state
    values.current[index.current] = Math.abs(top - last.current)
    const normalized = values.current.reduce((sum, value) => sum + value) / values.current.length
    const factor = effect.current?.uniforms.get('factor')
    if (factor) factor.value = THREE.MathUtils.lerp(factor.value, normalized / 20, 0.1)
    const time = effect.current?.uniforms.get('waterTime')
    if (time) time.value = waterTime.current
    waterTime.current += 0.01
    last.current = top
    index.current = (index.current + 1) % values.current.length
  })

  return <WaterEffect ref={setEffect} factor={0} />
}

export default function Effects() {
  return (
    <EffectComposer multisampling={0}>
      <ScrollWaterEffect />
    </EffectComposer>
  )
}
