import { useCallback, useEffect, useRef, useState } from "react";
import { invalidate } from "@react-three/fiber";

export type Playback = {
  time: number;
  playing: boolean;
  ready: boolean;
  reduced: boolean;
};
export type Player = ReturnType<typeof usePlayback>;

/**
 * Owns the intro clock shared by the canvas, scrubber, and playback buttons.
 * `onFrame` runs every animation frame with the elapsed time so the page can mirror the phase.
 */
export function usePlayback(
  breakDelay: number,
  duration: number,
  onFrame: (elapsed: number) => void,
) {
  const playback = useRef<Playback>({
    time: 0,
    playing: true,
    ready: false,
    reduced: false,
  });
  const progress = useRef<HTMLInputElement>(null);
  const previousDelay = useRef(breakDelay);
  const live = useRef({ duration, onFrame });
  live.current = { duration, onFrame };
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const onReady = useCallback(() => {
    playback.current.ready = true;
    setReady(true);
  }, []);

  // Changing the opening hold keeps later cues in place.
  useEffect(() => {
    const p = playback.current;
    const previous = previousDelay.current;
    p.time = p.reduced
      ? duration
      : p.time < previous
        ? previous
          ? (p.time / previous) * breakDelay
          : 0
        : Math.min(duration, p.time + breakDelay - previous);
    previousDelay.current = breakDelay;
    invalidate();
  }, [breakDelay, duration]);

  useEffect(() => {
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => {
      playback.current.reduced = motion.matches;
      setReducedMotion(motion.matches);
      invalidate();
      if (motion.matches) {
        playback.current.time = live.current.duration;
        playback.current.playing = false;
        setPaused(true);
      }
    };
    updateMotion();
    motion.addEventListener("change", updateMotion);
    return () => motion.removeEventListener("change", updateMotion);
  }, []);

  useEffect(() => {
    let id = 0;
    const update = () => {
      const elapsed = playback.current.time;
      if (progress.current) progress.current.value = String(elapsed);
      live.current.onFrame(elapsed);
      if (elapsed >= live.current.duration && playback.current.playing) {
        playback.current.playing = false;
        setPaused(true);
      }
      id = requestAnimationFrame(update);
    };
    id = requestAnimationFrame(update);
    return () => cancelAnimationFrame(id);
  }, []);

  const replay = () => {
    playback.current.time = 0;
    playback.current.playing = true;
    setPaused(false);
    invalidate();
  };
  return {
    playback,
    progress,
    ready,
    paused,
    reducedMotion,
    onReady,
    replay,
    toggle() {
      if (playback.current.time >= duration) {
        replay();
        return;
      }
      playback.current.playing = !playback.current.playing;
      setPaused(!playback.current.playing);
    },
    scrub(time: number) {
      playback.current.time = time;
      playback.current.playing = false;
      setPaused(true);
      invalidate();
    },
  };
}
