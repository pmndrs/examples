import { useEffect, type RefObject } from "react";

import { layout, sectionStarts, type SectionId } from "./layout";

const start = (id: SectionId) =>
  sectionStarts[layout.findIndex((section) => section.id === id)];
const end = (id: SectionId) =>
  start(id) + layout.find((section) => section.id === id)!.screens - 1;

// The longest step one frame may take the tour, so a stalled frame or a hidden tab pauses it instead of skipping ahead.
const maxFrame = 1 / 30;

/** The tour: where the page moves next, in screens, in how many seconds, and how long it looks once there. */
const script: { to: number; duration: number; look: number }[] = [
  // Straight into the dive and down to the cat, a little slower than a scroll.
  { to: start("dive"), duration: 0.4, look: 0 },
  { to: end("dive"), duration: 11, look: 0.6 },
  { to: start("mascot"), duration: 1.2, look: 2 },
  { to: start("mascot") + 1, duration: 1.2, look: 2 },
  { to: start("alley"), duration: 1, look: 0 },
  { to: end("alley"), duration: 5, look: 0 },
  { to: start("tram"), duration: 1.2, look: 0 },
  { to: end("tram"), duration: 7, look: 0 },
  { to: start("bird"), duration: 1.2, look: 4 },
  { to: start("outro"), duration: 1.2, look: 0 },
];

const easeInOut = (t: number) => (1 - Math.cos(Math.PI * t)) / 2;
const cancelling = ["wheel", "touchstart", "keydown", "pointerdown"] as const;

/**
 * While `playing`, plays the tour from where the page is. Any input hands the page back, and so does the end of the
 * tour: both set `playing` back to `false`.
 */
export function useAutoplay(
  story: RefObject<HTMLDivElement | null>,
  playing: boolean,
  setPlaying: (playing: boolean) => void,
) {
  useEffect(() => {
    const element = story.current;
    if (!playing || !element) return;

    let frame = 0;
    let from = element.scrollTop / element.clientHeight;
    let move = script.findIndex(({ to }) => to > from + 0.01);
    if (move < 0) return setPlaying(false);
    let elapsed = 0;
    let last: number | null = null;

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      elapsed += last === null ? 0 : Math.min((now - last) / 1000, maxFrame);
      last = now;
      const { to, duration, look } = script[move];
      const t = Math.min(elapsed / duration, 1);
      element.scrollTop =
        (from + (to - from) * easeInOut(t)) * element.clientHeight;
      if (elapsed < duration + look) return;
      from = to;
      elapsed = 0;
      if (++move === script.length) finish();
    };

    const stop = () => {
      cancelAnimationFrame(frame);
      for (const type of cancelling) removeEventListener(type, finish);
    };
    const finish = () => {
      stop();
      setPlaying(false);
    };
    for (const type of cancelling) addEventListener(type, finish);
    frame = requestAnimationFrame(tick);
    return stop;
  }, [story, playing, setPlaying]);
}
