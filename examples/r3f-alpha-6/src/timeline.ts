/** The reveal choreography lasts 5.3 seconds after the initial hold. */
export function animationDuration(breakDelay: number) {
  return breakDelay + 5.3;
}

/** Keep the original choreography cues while making the opening hold editable. */
export function choreographyTime(elapsed: number, breakDelay: number) {
  return elapsed + 2.2 - breakDelay;
}

/** Smoothstep progress of `t` between two cues. */
export function ease(t: number, from: number, to: number) {
  const x = Math.max(0, Math.min(1, (t - from) / (to - from)));
  return x * x * (3 - 2 * x);
}
