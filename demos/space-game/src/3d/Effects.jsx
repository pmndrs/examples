import { extend } from '@react-three/fiber'
import { Effects as EffectComposer } from '@react-three/drei'
import { UnrealBloomPass } from 'three-stdlib'
extend({ UnrealBloomPass })

export default function Effects() {
  return (
    <EffectComposer disableGammaPass>
      <unrealBloomPass threshold={0} radius={1} strength={1.8}/>
    </EffectComposer>
  )
}
