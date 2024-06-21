import { forwardRef, useRef } from 'react'
import { extend, useFrame, useThree } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'

// Based on
// "Improving the Rainbow" by Alan Zucconi: https://www.alanzucconi.com/2017/07/15/improving-the-rainbow-2/
// "More accurate Iridescence" by Julia Poo: https://www.shadertoy.com/view/ltKcWh
// Code written by https://twitter.com/shuding_
const RainbowMaterial = shaderMaterial(
  {
    time: 0,
    speed: 1,
    fade: 0.5,
    startRadius: 1,
    endRadius: 0,
    emissiveIntensity: 2.5,
    ratio: 1
  },
  /*glsl*/ ` varying vec2 vUv;
    void main() {
      vUv = uv;
      vec4 modelPosition = modelMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * viewMatrix * modelPosition;
    }`,
  /*glsl*/ ` varying vec2 vUv;
    uniform float fade;
    uniform float speed;
    uniform float startRadius;
    uniform float endRadius;
    uniform float emissiveIntensity;
    uniform float time;
    uniform float ratio;
  
    vec2 mp;
    // ratio: 1/3 = neon, 1/4 = refracted, 1/5+ = approximate white
    vec3 physhue2rgb(float hue, float ratio) {
      return smoothstep(vec3(0.0),vec3(1.0), abs(mod(hue + vec3(0.0,1.0,2.0)*ratio,1.0)*2.0-1.0));
    }
          
    vec3 iridescence (float angle, float thickness) {      
      float NxV = cos(angle);     
      float lum = 0.05064;      
      float luma = 0.01070;      
      vec3 tint = vec3(0.49639,0.78252,0.8723);      
      float interf0 = 2.4;      
      float phase0 = 1.0 / 2.8;      
      float interf1 = interf0 * 4.0 / 3.0;      
      float phase1 = phase0;      
      float f = (1.0 - NxV) * (1.0 - NxV);
      float interf = mix(interf0, interf1, f);
      float phase = mix(phase0, phase1, f);
      float dp = (NxV - 1.0) * 0.5;            
      vec3 hue = mix(physhue2rgb(thickness * interf0 + dp, thickness * phase0), physhue2rgb(thickness * interf1 + 0.1 + dp, thickness * phase1), f);      
      vec3 film = hue * lum + vec3(0.9639,0.78252,0.18723) * luma;      
      return vec3((film * 3.0 + pow(f,12.0))) * tint;
    }

    float _saturate (float x) {
      return min(1.0, max(0.0,x));
    }

    vec3 _saturate (vec3 x) {
      return min(vec3(1.,1.,1.), max(vec3(0.,0.,0.),x));
    }
    
    vec3 bump3y(vec3 x, vec3 yoffset) {
      vec3 y = vec3(1.,1.,1.) - x * x;
      y = _saturate(y-yoffset);
      return y;
    }

    vec3 spectral_zucconi6(float w, float t) {    
      float x = _saturate((w - 400.0)/ 300.0);
      const vec3 c1 = vec3(3.54585104, 2.93225262, 2.41593945);
      const vec3 x1 = vec3(0.69549072, 0.49228336, 0.27699880);
      const vec3 y1 = vec3(0.02312639, 0.15225084, 0.52607955);
      const vec3 c2 = vec3(3.90307140, 3.21182957, 3.96587128);
      const vec3 x2 = vec3(0.11748627, 0.86755042, 0.66077860);
      const vec3 y2 = vec3(0.84897130, 0.88445281, 0.73949448);
      return bump3y(c1 * (x - x1), y1) + bump3y(c2 * (x - x2), y2);
    }

    void main() {
      const vec2 vstart = vec2(0.5, 0.5);
      const vec2 vend = vec2(1.0, 0.5);
      vec2 dir = vstart - vend;
      float len = length(dir);
      float cosR = dir.y / len;
      float sinR = dir.x / len;
      vec2 uv = (mat2(cosR, -sinR, sinR, cosR) * (vUv * vec2(ratio, 1.) - vec2(0., 1.) - vstart * vec2(1., -1.)) / len);
      float a = atan(uv.x, uv.y) * 10.0;
      float s = uv.y * (endRadius - startRadius) + startRadius;
      float w = (uv.x / s + .5) * 300. + 400. + a;
      vec3 c = spectral_zucconi6(w, time); // [400, 700]
      float l = 1. - smoothstep(fade, 1., uv.y);
      float area = uv.y < 0. ? 0. : 1.;
      float brightness = smoothstep(0., 0.5, c.x + c.y + c.z);
      vec3 co = c / iridescence(uv.x * 0.5 * 3.14159, 1.0 - uv.y + time / 10.0) / 20.0;      
      gl_FragColor = vec4(area * co * l * brightness * emissiveIntensity, 1.0);
      if (gl_FragColor.r + gl_FragColor.g + gl_FragColor.b < 0.01) discard;
      #include <encodings_fragment>
    }`
)

extend({ RainbowMaterial })

export const Rainbow = forwardRef(({ startRadius = 0, endRadius = 0.5, emissiveIntensity = 2.5, fade = 0.25, ...props }, fRef) => {
  const material = useRef(null)
  const { width, height } = useThree((state) => state.viewport)
  // calculate the maximum length the rainbow has to have to reach all screen corners
  const length = Math.hypot(width, height) + 1.5 // add 1.5 to due motion of the rainbow
  useFrame((state, delta) => (material.current.time += delta * material.current.speed))
  return (
    <mesh ref={fRef} scale={[length, length, 1]} {...props}>
      <planeGeometry />
      <rainbowMaterial ref={material} key={RainbowMaterial.key} fade={fade} startRadius={startRadius} endRadius={endRadius} ratio={1} toneMapped={false} />
    </mesh>
  )
})
