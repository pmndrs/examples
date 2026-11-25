import type { ReactNode, RefObject } from "react";

import { layout, sectionStarts, stops, type SectionId } from "./layout";
import { pieceUrl, type Piece } from "./pieces";
import { useAutoplay } from "./useAutoplay";
import { useScrollSteps } from "./useScrollSteps";

/**
 * The page scrolling over the scene. Reports how far it is scrolled, in screens, and plays the tour on its own while
 * `touring`.
 */
export function Story({
  onScroll,
  freeLook,
  touring,
  setTouring,
  ref,
  children,
}: {
  onScroll: (screens: number) => void;
  freeLook: boolean;
  touring: boolean;
  setTouring: (touring: boolean) => void;
  ref: RefObject<HTMLDivElement | null>;
  children: ReactNode;
}) {
  useScrollSteps(ref);
  useAutoplay(ref, touring, setTouring);
  return (
    <div
      ref={ref}
      className="tokyo-story"
      data-free-look={freeLook ? "" : undefined}
      onScroll={(event) => {
        const { scrollTop, clientHeight } = event.currentTarget;
        onScroll(scrollTop / clientHeight);
      }}
    >
      {children}
    </div>
  );
}

/**
 * One section of the page, its card held in place throughout, with its stops from `stops`. `pieces` lists what the
 * shot on screen is built from.
 */
export function Chapter({
  id,
  title,
  pieces = [],
  children,
}: {
  id: SectionId;
  title: string;
  pieces?: Piece[];
  children: ReactNode;
}) {
  const index = layout.findIndex((section) => section.id === id);
  const { screens } = layout[index];
  const start = sectionStarts[index];
  const own = stops.filter(({ at }) => at >= start && at < start + screens);
  return (
    <section className="tokyo-chapter" style={{ height: `${screens * 100}%` }}>
      {own.map(({ at, free }) => (
        <span
          key={at}
          className="tokyo-stop"
          data-stop={free ? "free" : ""}
          style={{ top: `${((at - start) / screens) * 100}%` }}
        />
      ))}
      <div className="tokyo-chapter-screen">
        <div className="tokyo-card">
          <h3>{title}</h3>
          {children}
          <Pieces pieces={pieces} />
        </div>
      </div>
    </section>
  );
}

/** What a shot is built from, each linked to its page in the docs and colored by its kind. */
export function Pieces({ pieces }: { pieces: Piece[] }) {
  if (pieces.length === 0) return null;
  return (
    <ul className="tokyo-pieces">
      {pieces.map((piece) => (
        <li key={piece} data-kind={piece.split(".")[0]}>
          <a href={pieceUrl(piece)} target="_blank" rel="noreferrer">
            {piece}
          </a>
        </li>
      ))}
    </ul>
  );
}
