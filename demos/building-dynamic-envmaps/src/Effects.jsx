import { useLoader } from '@react-three/fiber'
import { EffectComposer, Bloom, LUT } from '@react-three/postprocessing'
import { useControls } from 'leva'
import { LUTCubeLoader } from 'postprocessing'

import lutTex from './F-6800-STD.cube?url'

export function Effects() {
  const texture = useLoader(LUTCubeLoader, lutTex)
  const { enabled } = useControls({
    enabled: true
  })
  return (
    enabled && (
      <EffectComposer disableNormalPass>
        {/* SSR was removed in @react-three/postprocessing v3 */}
        <Bloom luminanceThreshold={0.2} mipmapBlur luminanceSmoothing={0} intensity={1.75} />
        <LUT lut={texture} />
      </EffectComposer>
    )
  )
}
