import { EffectComposer } from '@react-three/postprocessing'

export function Effects() {
  return (
    <EffectComposer disableNormalPass>
      {/* SSR (Screen Space Reflections) was removed in @react-three/postprocessing v3.
          This demo cannot function without SSR. Consider using MeshReflectorMaterial
          from drei for ground reflections instead. */}
    </EffectComposer>
  )
}
