import * as THREE from 'three'
import { useEffect, useMemo } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader'
import { WaterPass } from './shaders/WaterPass'
import state from '../state'

export default function Effects() {
  const { gl, size, camera, scene } = useThree()
  // the legacy attachArray="passes" JSX registration is gone from fiber;
  // build the composer imperatively instead
  const { composer, waterPass } = useMemo(() => {
    const composer = new EffectComposer(gl)
    composer.addPass(new RenderPass(scene, camera))
    const waterPass = new WaterPass()
    composer.addPass(waterPass)
    composer.addPass(new ShaderPass(GammaCorrectionShader))
    return { composer, waterPass }
  }, [gl, scene, camera])
  useEffect(() => void composer.setSize(size.width, size.height), [composer, size])
  let last = state.top
  let index = 0
  let values = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  useFrame(() => {
    const { top } = state
    values[index] = Math.abs(top - last)
    const normalize = values.reduce((a, b) => a + b) / values.length
    waterPass.factor = THREE.MathUtils.lerp(waterPass.factor, normalize / 20, 0.1)
    last = top
    index = (index + 1) % 10
    gl.autoClear = true
    composer.render()
  }, 1)
  return null
}
