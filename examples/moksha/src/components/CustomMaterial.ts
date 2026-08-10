import { ShaderMaterial, Color, type Texture } from "three";
import { extend } from "@react-three/fiber";

export class CustomMaterial extends ShaderMaterial {
  constructor() {
    super({
      vertexShader: `uniform float scale;
      uniform float shift;
      varying vec2 vUv;
      void main() {
        vec3 pos = position;
        pos.y = pos.y + ((sin(uv.x * 3.1415926535897932384626433832795) * shift * 2.0) * 0.125);
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos,1.);
      }`,
      fragmentShader: `uniform sampler2D tex;
      uniform float hasTexture;
      uniform float shift;
      uniform float scale;
      uniform vec3 color;
      uniform float opacity;
      varying vec2 vUv;
      void main() {
        float angle = 1.55;
        vec2 p = (vUv - vec2(0.5, 0.5)) * (1.0 - scale) + vec2(0.5, 0.5);
        vec2 offset = shift / 4.0 * vec2(cos(angle), sin(angle));
        vec4 cr = texture2D(tex, p + offset);
        vec4 cga = texture2D(tex, p);
        vec4 cb = texture2D(tex, p - offset);
        if (hasTexture == 1.0) gl_FragColor = vec4(cr.r, cga.g, cb.b, cga.a);
        else gl_FragColor = vec4(color, opacity);
      }`,
      uniforms: {
        tex: { value: null },
        hasTexture: { value: 0 },
        scale: { value: 0 },
        shift: { value: 0 },
        opacity: { value: 1 },
        color: { value: new Color("white") },
      },
    });
  }

  set scale(value: number) {
    this.uniforms.scale.value = value;
  }

  get scale(): number {
    return this.uniforms.scale.value;
  }

  set shift(value: number) {
    this.uniforms.shift.value = value;
  }

  get shift(): number {
    return this.uniforms.shift.value;
  }

  set map(value: Texture | null) {
    this.uniforms.hasTexture.value = !!value;
    this.uniforms.tex.value = value;
  }

  get map(): Texture | null {
    return this.uniforms.tex.value;
  }

  get color(): Color {
    return this.uniforms.color.value;
  }
}

// `opacity` is a plain property on THREE.Material and TypeScript forbids a subclass
// from redeclaring it as an accessor, so install the pair on the prototype instead —
// the descriptor is the same one a `get`/`set` in the class body would produce.
Object.defineProperty(CustomMaterial.prototype, "opacity", {
  configurable: true,
  get(this: CustomMaterial): number {
    return this.uniforms.opacity.value;
  },
  set(this: CustomMaterial, value: number) {
    if (this.uniforms) this.uniforms.opacity.value = value;
  },
});

extend({ CustomMaterial });
