import { ease } from "../timeline.ts";

/** Leave time for both the 4.6-second reveal and the camera's final settle. */
export function animationDuration(breakDelay: number, cameraDuration = 0) {
  return Math.max(breakDelay + 4.6, cameraDuration);
}

/** Seconds since the closing tag began winding up. Negative during the opening hold. */
export function choreographyTime(elapsed: number, breakDelay: number) {
  return elapsed - breakDelay;
}

/** The moment `/>` reaches `renderer` and the word shatters. */
export const impactTime = 0.8;

/**
 * When the choreography starts for a fly-in whose rush stops at `rushTime`. `/>` pulls back the moment
 * the rush brakes onto the word and strikes while the camera is still swinging up, so the two moves
 * overlap instead of taking turns.
 */
export function windupAt(rushTime: number) {
  return Math.max(0, rushTime - brake - load);
}

/**
 * The camera's jolt from the strike at choreography time `t`. `punch` peaks at 1 sixty milliseconds
 * after the impact and `shake` starts at 1 on it, and both are gone within half a second.
 */
export function impactKick(t: number) {
  const k = t - impactTime;
  if (k <= 0) return { punch: 0, shake: 0 };
  return {
    punch: (k / 0.06) * Math.exp(1 - k / 0.06),
    shake: Math.exp(-k / 0.2),
  };
}

/** Quintic easing has zero speed and acceleration at both ends. */
function smooth(t: number, from: number, to: number) {
  const u = Math.max(0, Math.min(1, (t - from) / (to - from)));
  return u * u * u * (10 + u * (-15 + 6 * u));
}

/** Seconds the rush takes to brake from full speed onto its mark. */
const brake = 0.22;
/** The rush's speed on the first frame, as a share of its top speed. */
const launch = 0.55;

/**
 * The opening rush, from 1 far away to 0 on the low pass. It is already moving on the first frame and
 * keeps accelerating, so the word looms faster as it nears. `brake` seconds before `arrival` a spring
 * takes over with the same speed and acceleration, stops it hard, recoils past the mark, and is still
 * within 0.8 seconds. `speed` is 1 at the brake and slightly negative during the recoil.
 */
function rush(elapsed: number, arrival: number, overshoot: number) {
  const damping = 0.95 / (1 + 0.9 * overshoot);
  const frequency = 2.6 / brake;
  const cruise = Math.max(0.05, arrival - brake);
  const top =
    1 /
    ((cruise * (1 + launch)) / 2 +
      (2 * damping) / frequency +
      (1 - launch) / (cruise * frequency ** 2));
  const accel = ((1 - launch) * top) / cruise;
  const handoff = (2 * damping * frequency * top + accel) / frequency ** 2;
  const at = (time: number) => {
    const t = Math.max(0, time);
    if (t < cruise) return 1 - launch * top * t - 0.5 * accel * t * t;
    return (
      spring(t - cruise, handoff, 0, -top, frequency, damping) *
      (1 - smooth(t, cruise + 0.35, cruise + 0.8))
    );
  };
  const h = 0.0001;
  return {
    approach: at(elapsed),
    speed:
      elapsed < cruise
        ? launch + (1 - launch) * Math.max(0, elapsed / cruise)
        : (at(elapsed - h) - at(elapsed + h)) / (2 * h * top),
  };
}

/** Seconds the climb takes to pick up the speed the brake removes, so the move never stalls at the turn. */
const pickup = 0.06;
/** Share of the climb carried on the rush's momentum. The rest eases in on the long tail. */
const momentum = 0.8;

/** Progress of a decay over `tau` that fades in over `pickup`, scaled to finish at 1. */
function decay(s: number, tau: number) {
  const quick = (tau * pickup) / (tau + pickup);
  return (
    (tau * (1 - Math.exp(-s / tau)) - quick * (1 - Math.exp(-s / quick))) /
    (tau - quick)
  );
}

/**
 * Remaining displacement from the final pose, sampled from playback time so replay, pause, and backward
 * scrubbing give the same camera pose. One continuous move: `approach` and `speed` are the opening rush,
 * which brakes onto the low pass at `rushTime` seconds. As it brakes, its speed turns upward: `climb`
 * picks up at the rate the rush loses it and tilts the camera up and over the word. Most of the climb is
 * spent by `duration`, and the rest eases in on a long tail that ends exactly at rest `settleDuration` later.
 */
export function flight(
  elapsed: number,
  duration: number,
  settleDuration: number,
  overshoot: number,
  rushTime: number,
) {
  if (elapsed >= duration + settleDuration)
    return { approach: 0, speed: 0, climb: 0 };

  const { approach, speed } = rush(elapsed, rushTime, overshoot);
  const turn = Math.min(Math.max(0.05, rushTime - brake), duration);
  const s = elapsed - turn;
  const climb =
    s <= 0
      ? 1
      : (1 -
          momentum * decay(s, Math.max(0.02, (duration - turn) / 5.5)) -
          (1 - momentum) * decay(s, settleDuration / 4)) *
        Math.max(
          0,
          1 -
            smooth(
              elapsed,
              duration + settleDuration * 0.75,
              duration + settleDuration,
            ),
        );
  return { approach, speed, climb };
}

/** Camera buffeting from -1 to 1 at intro time `t`. A function of time, so scrubbing repeats it exactly. */
export function buffet(t: number, seed: number) {
  const turn = t * Math.PI * 2;
  return (
    Math.sin(turn * 7.3 + seed * 1.7) * 0.5 +
    Math.sin(turn * 11.9 + seed * 4.1) * 0.3 +
    Math.sin(turn * 17.3 + seed * 2.3) * 0.2
  );
}

/** Damped spring that starts at `from` with velocity `v` and settles on `to`. */
export function spring(
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

/** `/>` starts winding up at `load` and fires at `release`, the peak of its pull-back, in one beat. */
const load = 0.45,
  release = 0.68;

/**
 * Horizontal travel of `/>` in em. It springs back by `windup` from `load`, fires at the top of the
 * pull-back so it touches `renderer` at `strike` exactly at the impact, then keeps half its speed and
 * springs onto `rest`.
 */
export function tagOffset(
  t: number,
  windup: number,
  strike: number,
  rest: number,
) {
  if (t <= load) return 0;
  const loaded = spring(Math.min(t, release) - load, 0, windup, 0, 16, 0.4);
  if (t < release) return loaded;
  const fling = impactTime - release;
  if (t < impactTime)
    return loaded + (strike - loaded) * ((t - release) / fling) ** 3;
  return spring(
    t - impactTime,
    strike,
    rest,
    (1.5 * (strike - loaded)) / fling,
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
      t < release
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
