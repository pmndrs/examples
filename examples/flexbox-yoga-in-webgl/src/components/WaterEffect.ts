import { Uniform } from "three";
import { BlendFunction, Effect, EffectAttribute } from "postprocessing";
import { wrapEffect } from "@react-three/postprocessing";

const fragmentShader = /* glsl */ `
  uniform float factor;
  uniform float waterTime;

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec2 distortedUv = uv;
    float frequency = 4.0;
    float amplitude = 0.015 * factor;
    float x = distortedUv.y * frequency + waterTime * 0.7;
    float y = distortedUv.x * frequency + waterTime * 0.3;
    distortedUv.x += 0.5 * amplitude * cos(x);
    distortedUv.y += 0.5 * amplitude * sin(y);
    outputColor = texture(inputBuffer, distortedUv);
  }
`;

class OriginalWaterEffect extends Effect {
  constructor({
    blendFunction = BlendFunction.NORMAL,
    factor = 0,
  }: { blendFunction?: BlendFunction; factor?: number } = {}) {
    super("OriginalWaterEffect", fragmentShader, {
      blendFunction,
      attributes: EffectAttribute.CONVOLUTION,
      uniforms: new Map([
        ["factor", new Uniform(factor)],
        ["waterTime", new Uniform(0)],
      ]),
    });
  }
}

export const WaterEffect = wrapEffect(OriginalWaterEffect, {
  blendFunction: BlendFunction.NORMAL,
});
