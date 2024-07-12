import * as THREE from 'three'
import { useEffect } from 'react'
import { useControls } from 'leva'
import { Canvas, useThree } from '@react-three/fiber'
import { Fisheye, Environment, ContactShadows, OrbitControls, PerspectiveCamera } from '@react-three/drei'
import Car from './Car'
import { Perf } from 'r3f-perf'

import depotHdr from './old_depot_2k.hdr'

export default function App() {
  const { mapping, exposure } = useControls({
    exposure: { value: 0.85, min: 0, max: 4 },
    mapping: { value: 'ACESFilmic', options: ['No', 'Linear', 'AgX', 'ACESFilmic', 'Reinhard', 'Cineon', 'Custom'] },
  })
  return (
    <Canvas>
      <Fisheye resolution={768} zoom={0.25}>
        <Environment files={depotHdr} ground={{ height: 35, radius: 100, scale: 200 }} />
        <Car position={[-8, 0, -2]} scale={20} rotation-y={-Math.PI / 4} />
        <ContactShadows renderOrder={2} frames={1} resolution={1024} scale={120} blur={2} opacity={0.6} far={100} />
        <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={0} maxPolarAngle={Math.PI / 2.25} makeDefault />
        <PerspectiveCamera makeDefault position={[45, 45, 10]} fov={100} />
      </Fisheye>
      <Tone mapping={mapping} exposure={exposure} />
      <Perf />
    </Canvas>
  )
}

function Tone({ mapping, exposure }) {
  const gl = useThree((state) => state.gl)
  useEffect(() => {
    const prevFrag = THREE.ShaderChunk.tonemapping_pars_fragment
    const prevTonemapping = gl.toneMapping
    const prevTonemappingExp = gl.toneMappingExposure
    // Model viewers "commerce" tone mapping
    // https://github.com/google/model-viewer/blob/master/packages/model-viewer/src/three-components/Renderer.ts#L141
    THREE.ShaderChunk.tonemapping_pars_fragment = THREE.ShaderChunk.tonemapping_pars_fragment.replace(
      'vec3 CustomToneMapping( vec3 color ) { return color; }',
      `float startCompression = 0.8 - 0.04;
       float desaturation = 0.15;
       vec3 CustomToneMapping( vec3 color ) {
         color *= toneMappingExposure;
         float x = min(color.r, min(color.g, color.b));
         float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
         color -= offset;
         float peak = max(color.r, max(color.g, color.b));
         if (peak < startCompression) return color;
         float d = 1. - startCompression;
         float newPeak = 1. - d * d / (peak + d - startCompression);
         color *= newPeak / peak;
         float g = 1. - 1. / (desaturation * (peak - newPeak) + 1.);
         return mix(color, vec3(1, 1, 1), g);
       }`,
    )
    gl.toneMapping = THREE[mapping + 'ToneMapping']
    gl.toneMappingExposure = exposure
    return () => {
      // Retore on unmount or data change
      gl.toneMapping = prevTonemapping
      gl.toneMappingExposure = prevTonemappingExp
      THREE.ShaderChunk.tonemapping_pars_fragment = prevFrag
    }
  }, [mapping, exposure])
}
