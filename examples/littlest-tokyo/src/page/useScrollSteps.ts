import { useEffect, type RefObject } from "react";

// Wheel events closer together than this belong to one turn of the wheel or one swipe on a touchpad.
const gestureGap = 150;
// How long a step may take to reach its stop before the wheel is let through again.
const stepTimeout = 1000;
// How long the page has to stand still before it settles on a stop, and before the next swipe counts as a new one.
const settleTime = 150;

type Stop = { top: number; free: boolean };

/**
 * Moves the page between `[data-stop]` stops: it settles on the nearest at rest, and a turn of the wheel or a swipe
 * moves it one stop at most. From a `data-stop="free"` stop to the next, the page scrolls and rests anywhere.
 */
export function useScrollSteps(story: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const element = story.current;
    if (!element) return;

    const stops = (): Stop[] => {
      const origin = element.getBoundingClientRect().top - element.scrollTop;
      return Array.from(
        element.querySelectorAll<HTMLElement>("[data-stop]"),
        (stop) => ({
          top: stop.getBoundingClientRect().top - origin,
          free: stop.dataset.stop === "free",
        }),
      ).sort((a, b) => a.top - b.top);
    };

    let touching = false;

    const settle = () => {
      if (touching || element.hasAttribute("data-dragging")) return;
      const top = element.scrollTop;
      const all = stops();
      const behind = all.findLast((stop) => stop.top <= top + 2);
      if (behind?.free) return;
      const ahead = all.find((stop) => stop.top > top + 2);
      const nearest =
        !behind || (ahead && ahead.top - top < top - behind.top)
          ? ahead
          : behind;
      if (nearest && Math.abs(nearest.top - top) > 2)
        element.scrollTo({ top: nearest.top, behavior: "smooth" });
    };

    let lastWheel = -Infinity;
    let target: number | null = null;
    let targetSetAt = 0;
    // Whether the current turn of the wheel has already stepped, or come to a stop, and is used up.
    let spent = false;

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.deltaY === 0) return;
      const now = performance.now();
      if (now - lastWheel >= gestureGap) spent = false;
      lastWheel = now;
      const top = element.scrollTop;

      if (target !== null) {
        if (Math.abs(top - target) > 2 && now - targetSetAt < stepTimeout) {
          event.preventDefault();
          return;
        }
        target = null;
      }
      if (spent) {
        event.preventDefault();
        return;
      }

      const all = stops();
      const down = event.deltaY > 0;
      const next = down
        ? all.find((stop) => stop.top > top + 2)
        : all.findLast((stop) => stop.top < top - 2);
      if (!next) return;
      // The stop that starts the stretch the wheel moves through: from a free one, the page follows the scroll.
      const opening = down ? all.findLast((stop) => stop.top <= top + 2) : next;
      if (opening?.free) {
        // Through a section that follows the scroll, the turn ends on the next stop instead of running past it.
        const pixels =
          event.deltaY *
          (event.deltaMode === 1
            ? 16
            : event.deltaMode === 2
              ? element.clientHeight
              : 1);
        if (down ? top + pixels < next.top : top + pixels > next.top) return;
        event.preventDefault();
        spent = true;
        element.scrollTop = next.top;
        return;
      }
      // Anywhere else the page never scrolls by itself, so it cannot end up between stops and spring back.
      event.preventDefault();
      spent = true;
      target = next.top;
      targetSetAt = now;
      element.scrollTo({ top: next.top, behavior: "smooth" });
    };

    // Where the page stood when the finger went down; the swipe and the fling after it may reach the next stop only.
    let swipeFrom: number | null = null;
    let still: ReturnType<typeof setTimeout> | undefined;

    const onTouchStart = () => {
      touching = true;
      swipeFrom = element.scrollTop;
    };
    const onTouchEnd = () => {
      touching = false;
    };

    const onScroll = () => {
      clearTimeout(still);
      still = setTimeout(() => {
        if (touching) return;
        swipeFrom = null;
        settle();
      }, settleTime);
      if (swipeFrom === null) return;
      const from = swipeFrom;
      const top = element.scrollTop;
      const down = top > from;
      const all = stops();
      const limit = down
        ? all.find((stop) => stop.top > from + 2)
        : all.findLast((stop) => stop.top < from - 2);
      if (!limit || (down ? top <= limit.top : top >= limit.top)) return;
      // Hiding the overflow for a frame is what ends a fling in every browser, iOS included.
      swipeFrom = null;
      element.style.overflowY = "hidden";
      element.scrollTop = limit.top;
      requestAnimationFrame(() => (element.style.overflowY = ""));
    };

    // Dragging the rail scrolls the page freely; letting go settles it like the end of any other scroll.
    const dragging = new MutationObserver(settle);
    dragging.observe(element, { attributeFilter: ["data-dragging"] });

    element.addEventListener("wheel", onWheel, { passive: false });
    element.addEventListener("touchstart", onTouchStart, { passive: true });
    element.addEventListener("touchend", onTouchEnd, { passive: true });
    element.addEventListener("touchcancel", onTouchEnd, { passive: true });
    element.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(still);
      dragging.disconnect();
      element.removeEventListener("wheel", onWheel);
      element.removeEventListener("touchstart", onTouchStart);
      element.removeEventListener("touchend", onTouchEnd);
      element.removeEventListener("touchcancel", onTouchEnd);
      element.removeEventListener("scroll", onScroll);
    };
  }, [story]);
}
