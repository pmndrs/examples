import { ease } from "../timeline.ts";

/** The strike, landing, and reveal run 4.6 seconds after the opening hold. */
export function animationDuration(breakDelay: number) {
  return breakDelay + 4.6;
}

/** Seconds since the closing tag began winding up. Negative during the opening hold. */
export function choreographyTime(elapsed: number, breakDelay: number) {
  return elapsed - breakDelay;
}

/** The moment `/>` reaches `renderer` and the word shatters. */
export const impactTime = 0.8;

/** Damped spring that starts at `from` with velocity `v` and settles on `to`. */
function spring(
  t: number,
  from: number,
  to: number,
  v: number,
  frequency: number,
  damping: number,
) {
  const decay = damping * frequency,
    wobble = frequency * Math.sqrt(1 - damping * damping);
  const a = from - to,
    b = (v + decay * a) / wobble;
  return (
    to +
    Math.exp(-decay * t) * (a * Math.cos(wobble * t) + b * Math.sin(wobble * t))
  );
}

/**
 * Horizontal travel of `/>` in em. It springs back by `windup` until 0.62 s, accelerates into `renderer`
 * so it touches at `strike` exactly at the impact, then keeps half its speed and springs onto `rest`.
 */
export function tagOffset(
  t: number,
  windup: number,
  strike: number,
  rest: number,
) {
  if (t <= 0) return 0;
  const loaded = spring(Math.min(t, 0.62), 0, windup, 0, 13, 0.4);
  if (t < 0.62) return loaded;
  const fling = impactTime - 0.62;
  if (t < impactTime)
    return loaded + (strike - loaded) * ((t - 0.62) / fling) ** 2;
  return spring(
    t - impactTime,
    strike,
    rest,
    (strike - loaded) / fling,
    9,
    0.5,
  );
}

/**
 * Lean and squash for `/>`, simulated once so scrubbing stays exact.
 * Acceleration of the base tips the glass like a weighted spring toy. Winding compresses it,
 * flight stretches it, and the strike squashes it.
 */
export function tagPose(windup: number, strike: number, rest: number) {
  const rate = 240,
    h = 1 / rate;
  const lean = new Float32Array(rate * 5),
    squash = new Float32Array(rate * 5);
  let angle = 0,
    spin = 0,
    stretch = 0,
    stretchRate = 0;
  for (let i = 0; i < lean.length; i++) {
    const t = i * h;
    const before = tagOffset(t - h, windup, strike, rest),
      x = tagOffset(t, windup, strike, rest),
      after = tagOffset(t + h, windup, strike, rest);
    const velocity = (after - before) / (2 * h),
      acceleration = (after - 2 * x + before) / (h * h);
    spin += (-256 * angle - 9.6 * spin + 0.4 * acceleration) * h;
    angle += spin * h;
    const target =
      t < 0.62
        ? (-0.12 * x) / windup
        : t < impactTime
          ? Math.min(0.14, Math.abs(velocity) * 0.01)
          : 0;
    stretchRate += (-400 * (stretch - target) - 16 * stretchRate) * h;
    if (t >= impactTime && t - h < impactTime) stretchRate -= 5;
    stretch += stretchRate * h;
    lean[i] = Math.max(-0.35, Math.min(0.35, angle));
    squash[i] = stretch;
  }
  return (t: number) => {
    const i = Math.max(0, Math.min(lean.length - 1, Math.round(t * rate)));
    return {
      x: tagOffset(t, windup, strike, rest),
      lean: lean[i],
      squash: squash[i],
    };
  };
}

/** Glide progress for opening letter `index` of `count`. Letters nearest the strike move first. */
export function glide(t: number, index: number, count: number) {
  const lag = (count - 1 - index) * 0.04;
  return ease(t, impactTime + 0.1 + lag, impactTime + 1.05 + lag);
}
