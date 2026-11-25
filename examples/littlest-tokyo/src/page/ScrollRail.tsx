import type { PointerEvent, RefObject } from "react";

import { pageLength, stops } from "./layout";

/** A track down the side of the page with a mark for each stop. Dragging it or clicking on it scrolls the page. */
export function ScrollRail({
  story,
  scroll,
}: {
  story: RefObject<HTMLDivElement | null>;
  scroll: number;
}) {
  const scrollTo = (event: PointerEvent<HTMLDivElement>) => {
    const element = story.current;
    if (!element) return;
    const { top, height } = event.currentTarget.getBoundingClientRect();
    const fraction = Math.min(Math.max((event.clientY - top) / height, 0), 1);
    element.scrollTo({
      top: fraction * (element.scrollHeight - element.clientHeight),
    });
  };
  // Settling on a stop pauses while dragging, so the shots follow the thumb all the way, and resumes on release.
  const setDragging = (dragging: boolean) =>
    story.current?.toggleAttribute("data-dragging", dragging);
  const at = `${(Math.min(Math.max(scroll, 0), pageLength) / pageLength) * 100}%`;

  return (
    <div
      className="tokyo-rail"
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        setDragging(true);
        scrollTo(event);
      }}
      onPointerMove={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId))
          scrollTo(event);
      }}
      onPointerUp={() => setDragging(false)}
      onPointerCancel={() => setDragging(false)}
    >
      <span className="tokyo-rail-fill" style={{ height: at }} />
      {stops.map(({ at: stop }) => (
        <span
          key={stop}
          className="tokyo-rail-mark"
          data-passed={stop <= scroll + 0.01 ? "" : undefined}
          style={{ top: `${(stop / pageLength) * 100}%` }}
        />
      ))}
      <span className="tokyo-rail-thumb" style={{ top: at }} />
    </div>
  );
}
