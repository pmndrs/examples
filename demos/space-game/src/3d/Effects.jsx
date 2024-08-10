import { EffectComposer, Bloom } from '@react-three/postprocessing'

export default function Effects() {
  return (
    <EffectComposer>
      <Bloom intensity={1.8} radius={0.85} luminanceThreshold={0} />
    </EffectComposer>
  )
}
