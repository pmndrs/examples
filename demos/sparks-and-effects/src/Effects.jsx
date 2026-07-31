import * as THREE from 'three'
import { useEffect, useMemo } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import { WaterPass } from './post/Waterpass'

export default function Effects() {
  const { scene, gl, size, camera } = useThree()
  // the legacy attachArray="passes" JSX registration is gone from fiber;
  // build the composer imperatively instead
  const composer = useMemo(() => {
    const composer = new EffectComposer(gl)
    composer.addPass(new RenderPass(scene, camera))
    const waterPass = new WaterPass()
    waterPass.factor = 1.5
    composer.addPass(waterPass)
    // no OutputPass: the demo's look (matching the thumbnail) relies on the
    // legacy linear output this chain was tuned against
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(512, 512), 2, 1, 0))
    return composer
  }, [gl, scene, camera])
  useEffect(() => void composer.setSize(size.width, size.height), [composer, size])
  useFrame(() => composer.render(), 1)
  return null
}
