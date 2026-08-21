import { Uniform } from "three";
import { BlendFunction, Effect } from "postprocessing";
import { wrapEffect } from "@react-three/postprocessing";

const fragmentShader = /* glsl */ `
  uniform int rampType;

  uniform vec2 rampStart;
  uniform vec2 rampEnd;

  uniform vec4 startColor;
  uniform vec4 endColor;

  uniform float rampBias;
  uniform float rampGain;

  uniform bool rampMask;
  uniform bool rampInvert;

  float getBias(float time, float bias) {
    return (time / ((((1.0 / bias) - 2.0) * (1.0 - time)) + 1.0));
  }

  float getGain(float time, float gain) {
    if(time < 0.5)
      return getBias(time * 2.0, gain) / 2.0;
    else
      return getBias(time * 2.0 - 1.0, 1.0 - gain) / 2.0 + 0.5;
  }

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec2 startPixel = rampStart * resolution.xy;
    vec2 endPixel = rampEnd * resolution.xy;

    float rampAlpha, radius;

    if (rampType == 1) {
      vec2 fuv = uv * resolution.xy / resolution.y;
      vec2 suv = startPixel / resolution.y;
      vec2 euv = endPixel / resolution.y;

      radius = length(suv - euv);
      float falloff = length(fuv - suv);
      rampAlpha = smoothstep(0., radius, falloff);
    }

    else {
      radius = length(startPixel - endPixel);
      vec2 direction = normalize(vec2(endPixel.x - startPixel.x, -(startPixel.y - endPixel.y)));

      float fade = dot(uv * resolution - startPixel, direction);
      if (rampType == 2) { fade = abs(fade); }

      rampAlpha = smoothstep(0.0, 1.0, fade / radius);
    }

    rampAlpha = abs((rampInvert ? 1.0 : 0.0) - getBias(rampAlpha, rampBias) * getGain(rampAlpha, rampGain));

    if (!rampMask) {
      outputColor = mix(startColor, endColor, rampAlpha);
    }

    else {
      vec4 inputBuff = texture2D(inputBuffer, uv);
      outputColor = mix(inputBuff, inputColor, rampAlpha);
    }
  }
`;

type RampOptions = {
  blendFunction?: BlendFunction;
  rampType?: number;
  rampStart?: [number, number];
  rampEnd?: [number, number];
  startColor?: [number, number, number, number];
  endColor?: [number, number, number, number];
  rampBias?: number;
  rampGain?: number;
  rampMask?: boolean;
  rampInvert?: boolean;
};

class OriginalRampEffect extends Effect {
  constructor({
    blendFunction = BlendFunction.NORMAL,
    rampType = 0, // 0: linear, 1: radial, 2: linear (mirrored)
    rampStart = [0.5, 0.5],
    rampEnd = [1, 1],
    startColor = [0, 0, 0, 1],
    endColor = [1, 1, 1, 1],
    rampBias = 0.5,
    rampGain = 0.5,
    rampMask = false,
    rampInvert = false,
  }: RampOptions = {}) {
    super("RampEffect", fragmentShader, {
      blendFunction,
      uniforms: new Map<string, Uniform>([
        ["rampType", new Uniform(rampType)],
        ["rampStart", new Uniform(rampStart)],
        ["rampEnd", new Uniform(rampEnd)],
        ["startColor", new Uniform(startColor)],
        ["endColor", new Uniform(endColor)],
        ["rampBias", new Uniform(rampBias)],
        ["rampGain", new Uniform(rampGain)],
        ["rampMask", new Uniform(rampMask)],
        ["rampInvert", new Uniform(rampInvert)],
      ]),
    });
  }
}

export const RampEffect = wrapEffect(OriginalRampEffect);
