import { BlendFunction, Effect } from "postprocessing";
import { Uniform } from "three";

// Each slice of the circle around the middle of the screen may hold one white wedge, thin toward the middle. The
// slices draw again a few times a second, which makes the lines flicker like hand-drawn ones.
const fragmentShader = /* glsl */ `
uniform float amount;

const float slices = 120.0;
const float redraws = 12.0;
const float tau = 6.28318530718;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
  float radius = length(p);
  float around = (atan(p.y, p.x) / tau + 0.5) * slices;
  float slice = floor(around);
  float frame = floor(time * redraws);

  float shown = step(1.0 - amount * 0.6, hash(vec2(slice, frame)));
  float start = mix(0.36, 0.5, hash(vec2(slice, frame + 31.0)));
  float taper = smoothstep(start, start + 0.25, radius);
  float width = mix(0.1, 0.35, hash(vec2(slice, frame + 57.0))) * taper;
  float pixel = texelSize.y / max(radius, 1e-3) / tau * slices;
  // Times the taper too: the edge smoothing alone would leave a pixel-wide line running on to the middle.
  float line = (1.0 - smoothstep(width * 0.5 - pixel, width * 0.5 + pixel, abs(fract(around) - 0.5))) * taper;

  outputColor = vec4(mix(inputColor.rgb, vec3(1.0), line * shown * amount * 0.4), inputColor.a);
}
`;

/** White cartoon speed lines around the edges of the screen, from none at `amount` `0` to many at `1`. */
export class SpeedLinesEffect extends Effect {
  constructor() {
    super("SpeedLinesEffect", fragmentShader, {
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map([["amount", new Uniform(0)]]),
    });
  }

  setAmount(value: number): void {
    this.uniforms.get("amount")!.value = value;
  }
}
