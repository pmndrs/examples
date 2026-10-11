import { LookupTexture } from "postprocessing";

// Color grades as plain functions of an sRGB color, baked into 3D lookup
// textures - no .cube files needed. LUT3DEffect converts its input to sRGB
// before the lookup, so these work in the same space an image editor does.

type RGB = [number, number, number];

const SIZE = 32;

const clamp = (x: number) => Math.min(Math.max(x, 0), 1);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const luma = ([r, g, b]: RGB) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

function saturate(c: RGB, amount: number): RGB {
  const l = luma(c);
  return c.map((x) => mix(l, x, amount)) as RGB;
}

// An S-curve around mid-grey; k > 1 adds contrast.
function contrast(c: RGB, k: number): RGB {
  return c.map((x) =>
    x < 0.5 ? 0.5 * (2 * x) ** k : 1 - 0.5 * (2 - 2 * x) ** k,
  ) as RGB;
}

function softLight(c: RGB, tint: RGB): RGB {
  return c.map((a, i) => {
    const b = tint[i];
    return b < 0.5
      ? 2 * a * b + a * a * (1 - 2 * b)
      : 2 * a * (1 - b) + Math.sqrt(a) * (2 * b - 1);
  }) as RGB;
}

// Shadows take one tint, highlights the other.
function splitTone(c: RGB, shadows: RGB, highlights: RGB): RGB {
  const t = smoothstep(0.15, 0.85, luma(c));
  return softLight(c, shadows.map((s, i) => mix(s, highlights[i], t)) as RGB);
}

export const GRADES = {
  "Teal & orange": (c: RGB) =>
    saturate(
      contrast(splitTone(c, [0.2, 0.55, 0.62], [0.9, 0.58, 0.32]), 1.15),
      1.15,
    ),
  Noir: (c: RGB) => {
    const l = contrast([luma(c), luma(c), luma(c)], 1.8)[0];
    return [l, l, l * 1.03] as RGB;
  },
  "Faded film": (c: RGB) => {
    const [r, g, b] = saturate(c, 0.7);
    return [0.08 + r * 0.86, 0.07 + g * 0.84, 0.09 + b * 0.78] as RGB;
  },
  Cyberpunk: (c: RGB) =>
    saturate(
      contrast(splitTone(c, [0.55, 0.2, 0.75], [0.3, 0.92, 0.95]), 1.25),
      1.35,
    ),
  "Golden hour": (c: RGB) => {
    const [r, g, b] = saturate(contrast(c, 1.1), 1.15);
    return [r * 1.08, g * 0.97, b * 0.8] as RGB;
  },
  "Night vision": (c: RGB) => {
    const v = contrast([clamp(luma(c) * 1.7), 0, 0], 1.3)[0];
    return [v * 0.22, v, v * 0.3] as RGB;
  },
} satisfies Record<string, (c: RGB) => RGB>;

export type Grade = keyof typeof GRADES;

export function createLUTs() {
  return Object.fromEntries(
    Object.entries(GRADES).map(([name, grade]) => {
      const lut = LookupTexture.createNeutral(SIZE);
      const data = lut.image.data as Float32Array;
      for (let i = 0; i < data.length; i += 4) {
        const [r, g, b] = grade([data[i], data[i + 1], data[i + 2]]);
        data[i] = clamp(r);
        data[i + 1] = clamp(g);
        data[i + 2] = clamp(b);
      }
      lut.name = name;
      lut.needsUpdate = true;
      return [name, lut];
    }),
  ) as Record<Grade, LookupTexture>;
}
