import * as THREE from 'three'
import { useRef } from 'react'
import { extend, useThree, useFrame } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'

const XFadeMaterial = shaderMaterial(
  { texture1: null, texture2: null, shownTxt: -1, resolution: new THREE.Vector2() },
  `void main() {
    gl_Position = vec4(position,1.0);
  }`,
  `#ifdef FXAA
    #pragma glslify: fxaa = require(glsl-fxaa)
  #endif

  varying vec2 v_texCoord0;
  uniform vec2 resolution;
  uniform sampler2D texture1;
  uniform sampler2D texture2;
  uniform float shownTxt;

  void main() {
    #ifdef FXAA
      vec4 _texture1 = fxaa(texture1, gl_FragCoord.xy, resolution);
      vec4 _texture2 = fxaa(texture2, gl_FragCoord.xy, resolution);
    #else
      vec2 uv = gl_FragCoord.xy / resolution;
      vec4 _texture1 = texture2D(texture1, uv);
      vec4 _texture2 = texture2D(texture2, uv);
    #endif
    float opacity = shownTxt < 0. ? 1. + shownTxt : 1.;
    float _shownTxt = shownTxt < 0. ? 0. : shownTxt;
    vec4 finalTexture = mix(_texture1, _texture2, _shownTxt);
    finalTexture =  vec4(finalTexture.rgb, opacity * finalTexture.a);
    gl_FragColor = finalTexture;
  }`,
)

extend({ XFadeMaterial })

export function CrossFadeMaterial({ shownTxt = -1, ...props }) {
  const ref = useRef(null)
  const { size, gl } = useThree()
  const dpr = gl.getPixelRatio()
  useFrame(() => {
    ref.current.shownTxt = THREE.MathUtils.lerp(ref.current.shownTxt, shownTxt, 0.2)
  })
  return (
    <xFadeMaterial ref={ref} {...props} resolution={[size.width * dpr, size.height * dpr]} defines={{ FXAA: !gl.capabilities.isWebGL2 }} />
  )
}
