import { extend } from '@react-three/fiber'
import { Effects as EffectComposer } from '@react-three/drei'
import { UnrealBloomPass } from 'three-stdlib'

extend({ UnrealBloomPass })

export default function Effects() {
  return (
    <EffectComposer disableGammaPass>
      <unrealBloomPass strength={1.8} radius={1} threshold={0} />
    </EffectComposer>
  )
}
