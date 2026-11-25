import { useState } from "react";

import {
  locate,
  progressThrough,
  tramCut,
  type Location,
  type SectionId,
} from "./page/layout";

// Sections whose camera rides a path: leaving one, its camera stays on until it reaches the end of its way.
const rides = new Set<SectionId>(["dive", "alley"]);

export type Tour = {
  /** Where the page is. The text follows it at once. */
  at: Location;
  /** The section whose shot is on: where the page is, or a ride still on its way to its end. */
  shot: SectionId;
  /** The ride still on its way to its end, if any. */
  finishing: SectionId | null;
  /** Ends `finishing`, once its camera has arrived. */
  arrive: () => void;
  /** How far the scroll is through each section whose camera follows it, from `0` to `1`. */
  progress: { dive: number; alley: number; tram: number };
  /** Whether the tram is filmed from outside, past its cut. */
  tramSide: boolean;
  /** Whether the page is on the mascot's second screen, where the camera slides after it. */
  mascotSlide: boolean;
};

/** Which shot is on as the page scrolls to `scroll` screens, and how far its camera has come. */
export function useTour(scroll: number): Tour {
  const at = locate(scroll);
  const [section, setSection] = useState(at.id);
  const [finishing, setFinishing] = useState<SectionId | null>(null);
  if (at.id !== section) {
    setSection(at.id);
    setFinishing(rides.has(section) ? section : null);
  }
  const shot = finishing ?? at.id;
  const progress = {
    dive: progressThrough(at, "dive", finishing),
    alley: progressThrough(at, "alley", finishing),
    tram: progressThrough(at, "tram", finishing),
  };
  return {
    at,
    shot,
    finishing,
    arrive: () => setFinishing(null),
    progress,
    tramSide: shot === "tram" && progress.tram >= tramCut,
    mascotSlide: at.id === "mascot" && at.step === 1,
  };
}
