/** How far through the tram's ride its camera moves from the window to the side. */
export const tramCut = 0.5;

// The sections down the page, in screens. Those that follow the scroll play out as it moves through them, cutting to
// another shot at each of `cuts` on the way; the others hold one shot a screen.
export const layout = [
  { id: "hero", screens: 1, follows: false, cuts: [] },
  { id: "dive", screens: 4, follows: true, cuts: [] },
  { id: "mascot", screens: 2, follows: false, cuts: [] },
  { id: "alley", screens: 2, follows: true, cuts: [] },
  { id: "tram", screens: 3, follows: true, cuts: [tramCut] },
  { id: "bird", screens: 1, follows: false, cuts: [] },
  { id: "outro", screens: 1, follows: false, cuts: [] },
] as const;

export type SectionId = (typeof layout)[number]["id"];

export const sectionStarts = layout.map((_, index) =>
  layout.slice(0, index).reduce((sum, { screens }) => sum + screens, 0),
);

/**
 * Where the page stops, in screens: on each screen of a section that holds shots, and at the start, each cut and the
 * end of each ride. From a `free` stop to the next, the page follows the scroll and rests anywhere.
 */
export const stops: { at: number; free: boolean }[] = layout.flatMap(
  ({ screens, follows, cuts }, index) => {
    const start = sectionStarts[index];
    if (!follows)
      return Array.from({ length: screens }, (_, screen) => ({
        at: start + screen,
        free: false,
      }));
    const ride = [0, ...cuts].map((cut) => ({
      at: start + cut * (screens - 1),
      free: true,
    }));
    return [...ride, { at: start + screens - 1, free: false }];
  },
);

/** How far the page scrolls, in screens: the last section ends at the bottom of the screen. */
export const pageLength =
  layout.reduce((sum, { screens }) => sum + screens, 0) - 1;

const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);

export type Location = { id: SectionId; step: number; progress: number };

/** The section in the middle of the screen, the screen of it showing, and how far the scroll is through it. */
export function locate(scroll: number): Location {
  let found: { id: SectionId; screens: number; start: number } = {
    ...layout[0],
    start: 0,
  };
  layout.forEach((section, index) => {
    if (scroll >= sectionStarts[index] - 0.5)
      found = { ...section, start: sectionStarts[index] };
  });
  const local = scroll - found.start;
  return {
    id: found.id,
    step: Math.min(Math.max(Math.round(local), 0), found.screens - 1),
    progress: clamp01(local / Math.max(found.screens - 1, 1)),
  };
}

const order = (id: SectionId) =>
  layout.findIndex((section) => section.id === id);

/**
 * How far the scroll is through section `id`: `0` before it, `1` past it. While the ride of section `finishing` comes
 * to its end, the sections after it wait at their start.
 */
export function progressThrough(
  at: Location,
  id: SectionId,
  finishing: SectionId | null = null,
): number {
  if (finishing !== null && order(finishing) < order(id)) return 0;
  return at.id === id ? at.progress : order(at.id) > order(id) ? 1 : 0;
}
