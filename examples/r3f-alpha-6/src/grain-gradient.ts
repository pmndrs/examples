// Modified TSL adaptation of Paper Shaders Grain Gradient (Apache-2.0).
// Wave/ripple/blob shapes, grain distortion, and color-band mixing follow Paper.
// The texture randomizer and simplex noise are replaced with procedural TSL noise.
// Original notices: public/licenses/Paper-Shaders-{LICENSE,NOTICE}.txt.
import { Color } from "three/webgpu";
import {
  cos,
  float,
  fwidth,
  mix,
  mx_noise_float,
  select,
  sin,
  smoothstep,
  uniform,
  vec2,
  vec3,
} from "three/tsl";
import type { Node } from "three/webgpu";
import type { BackgroundSettings } from "./controls";

/** Grain gradient sampled at `position` (centered, one unit per viewport height). Grain noise reads `grainUV`. */
export function grainGradient(position: Node<"vec2">, grainUV: Node<"vec2">) {
  const time = uniform(0),
    shapeType = uniform(1),
    scale = uniform(1.8);
  const softness = uniform(0.65),
    intensity = uniform(0.22),
    grain = uniform(0.13);
  const base = uniform(new Color()),
    c1 = uniform(new Color()),
    c2 = uniform(new Color()),
    c3 = uniform(new Color());
  const p = position.mul(scale);
  const t = time.add(7).mul(0.1);
  const wave = cos(p.x.mul(0.5).sub(t.mul(4)))
    .mul(sin(p.x.mul(1.5).add(t.mul(2))))
    .mul(cos(t.mul(6)).mul(0.25).add(0.75));
  const waveShape = smoothstep(-1, 1, p.y.add(wave)).oneMinus();
  const ripple = sin(p.length().mul(0.8).pow(1.2).mul(5).sub(t.mul(3)))
    .mul(0.5)
    .add(0.5);
  const b = t.mul(2);
  const trajectories = [
    vec2(sin(b).mul(1.3), cos(b.mul(0.6).add(4)).mul(1.3).add(0.2)).mul(0.25),
    vec2(sin(b.negate()).mul(1.2), sin(b.mul(1.6)).mul(1.3)).mul(0.2),
    vec2(cos(b.mul(-0.6)).mul(1.7), cos(b.mul(-1.6))).mul(0.25),
    vec2(cos(b.mul(0.8)).mul(1.4), sin(b.mul(-0.6).sub(3)).mul(1.2)).mul(0.3),
  ];
  let blob = float(0).add(0);
  for (const trajectory of trajectories)
    blob = blob.add(
      p.add(trajectory).length().clamp().oneMinus().pow(5).mul(0.5),
    );
  blob = smoothstep(0, 0.9, blob);
  blob = blob.mul(smoothstep(0.25, 0.3, blob));
  const shape = select(
    shapeType.lessThan(1.5),
    waveShape,
    select(shapeType.lessThan(2.5), ripple, blob),
  );
  const fbm = (frequency: number, offset = 0) => {
    let q = grainUV.mul(frequency).add(offset),
      sum = float(0).add(0);
    for (let i = 0; i < 3; i++) {
      q = vec2(
        q.x.mul(0.9553).sub(q.y.mul(0.2955)),
        q.x.mul(0.2955).add(q.y.mul(0.9553)),
      );
      sum = sum.add(
        mx_noise_float(vec3(q, 0))
          .mul(0.5)
          .add(0.5)
          .mul(0.2 * 0.6 ** i),
      );
      q = q.mul(1.99);
    }
    return sum;
  };
  const baseNoise = mx_noise_float(vec3(grainUV.mul(0.5), 0));
  const grainDist = baseNoise
    .mul(mx_noise_float(vec3(grainUV.mul(0.2), 0)))
    .sub(fbm(0.002, 10))
    .sub(fbm(0.003));
  const rawNoise = baseNoise.mul(0.75).sub(fbm(0.001)).sub(fbm(0.4)).clamp();
  const shaped = shape
    .add(intensity.mul(2 / 3).mul(grainDist.add(0.5)))
    .add(grain.mul(10 / 3).mul(rawNoise));
  const aa = fwidth(shaped);
  const bounded = shaped.sub(1 / 6).clamp();
  const mask = smoothstep(0, softness.add(aa.mul(2)), bounded.mul(3).clamp());
  const mixer = bounded.mul(2);
  const edge0 = float(0.5).sub(softness.mul(0.5)).sub(aa);
  const edge1 = float(0.5).add(softness.mul(0.5)).add(aa);
  const gradient = mix(
    mix(c1, c2, smoothstep(edge0, edge1, mixer.clamp())),
    c3,
    smoothstep(edge0, edge1, mixer.sub(1).clamp()),
  );
  return {
    gradient,
    mask,
    base,
    time,
    update(settings: BackgroundSettings) {
      shapeType.value = settings.shape;
      scale.value = settings.scale;
      softness.value = settings.softness;
      intensity.value = settings.intensity;
      grain.value = settings.grain;
      base.value.set(settings.baseColor);
      c1.value.set(settings.color1);
      c2.value.set(settings.color2);
      c3.value.set(settings.color3);
    },
  };
}
