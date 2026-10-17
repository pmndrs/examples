const listeners = new Set<(amount: number) => void>();
let progress = 0;

/**
 * Marks a startup stage. `amount` is where the loading bar heads while the next stage runs, from 0 to 1.
 * Add `?debug` to the URL to log each stage.
 */
export function traceStartup(stage: string, amount?: number) {
  if (new URLSearchParams(location.search).has("debug"))
    console.info("[r3f startup]", stage, Math.round(performance.now()), "ms");
  if (amount === undefined || amount <= progress) return;
  progress = amount;
  listeners.forEach((listener) => listener(amount));
}

export function onStartupProgress(listener: (amount: number) => void) {
  listener(progress);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
