import { useThree, useFrame } from '@react-three/fiber'
import { EffectComposer, RenderPass, EffectPass, SMAAEffect, FXAAEffect } from 'postprocessing'
import { useEffect, useState } from 'react'

import { SSGIEffect, TRAAEffect, MotionBlurEffect, VelocityDepthNormalPass } from './realism-effects/index'
//import { SSGIEffect, TRAAEffect, MotionBlurEffect, VelocityDepthNormalPass } from './realism-effects/v2'
//import { SSGIEffect, TRAAEffect, MotionBlurEffect, VelocityDepthNormalPass } from './realism-effects/gdata-in-float'

export function Effects({ importanceSampling }) {
  const gl = useThree((state) => state.gl)
  const scene = useThree((state) => state.scene)
  const camera = useThree((state) => state.camera)
  const size = useThree((state) => state.size)
  const [composer] = useState(() => new EffectComposer(gl, { multisampling: 0 }))
  useEffect(() => composer.setSize(size.width, size.height), [composer, size])
  useEffect(() => {
    const config = {
      distance: 5.980000000000011,
      thickness: 2.829999999999997,
      denoiseIterations: 1,
      denoiseKernel: 3,
      denoiseDiffuse: 25,
      denoiseSpecular: 25.54,
      radius: 11,
      phi: 0.5760000000000001,
      lumaPhi: 20.651999999999997,
      depthPhi: 23.37,
      normalPhi: 26.087,
      roughnessPhi: 18.477999999999998,
      specularPhi: 7.099999999999999,
      envBlur: 0,
      importanceSampling: true,
      steps: 20,
      refineSteps: 4,
      resolutionScale: 1,
      missedRays: false
    }

    const renderPass = new RenderPass(scene, camera)
    composer.addPass(renderPass)

    const velocityDepthNormalPass = new VelocityDepthNormalPass(scene, camera)
    composer.addPass(velocityDepthNormalPass)

    const ssgiEffect = new SSGIEffect(composer, scene, camera, velocityDepthNormalPass, config)

    const motionBlur = new MotionBlurEffect(velocityDepthNormalPass)
    const traa = new TRAAEffect(scene, camera, velocityDepthNormalPass)
    const smaa = new SMAAEffect()
    const fxaa = new FXAAEffect()

    const effectPass1 = new EffectPass(camera, ssgiEffect)
    const effectPass2 = new EffectPass(camera, motionBlur)
    const effectPass3 = new EffectPass(camera, traa)

    composer.addPass(effectPass1)
    //composer.addPass(effectPass2)
    composer.addPass(effectPass3)
    return () => {
      composer.removeAllPasses()
    }
  }, [composer, camera, scene, importanceSampling])
  useFrame((state, delta) => {
    gl.autoClear = true // ?
    composer.render(delta)
  }, 1)
}
