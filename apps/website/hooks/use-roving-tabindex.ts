"use client";

import {
  useCallback,
  useEffect,
  type FocusEvent,
  type KeyboardEvent,
  type RefObject,
} from "react";

/** What would otherwise be a tab stop of its own inside the group. */
const ITEMS = "a[href], button:not([disabled])";

/**
 * Roving tabindex: a group of controls that answers to Tab once, and to the
 * arrow keys inside.
 *
 * Every item but one carries `tabindex="-1"`, so the whole group is a single
 * stop in the page's tab sequence; the arrow keys move focus within it and
 * take the `0` along. Without it the example list is ~160 consecutive tab stops
 * between the filter row and everything after it, and the example bar is five.
 *
 * The entry point is whichever item is `aria-current="page"` — for the example
 * list, the example you are looking at — and otherwise the first.
 *
 * Reads the DOM rather than taking the items as an argument: at both call
 * sites the item is rendered by something else (`Item asChild` around a
 * `Link`, `Button asChild` inside a `TooltipTrigger`), so there is no single
 * place a `tabIndex` prop could be threaded through.
 */
export function useRovingTabIndex<T extends HTMLElement>(
  ref: RefObject<T | null>,
  {
    orientation = "vertical",
  }: { orientation?: "vertical" | "horizontal" } = {},
) {
  const items = useCallback(
    () => Array.from(ref.current?.querySelectorAll<HTMLElement>(ITEMS) ?? []),
    [ref],
  );

  const setActive = useCallback((active: HTMLElement, list: HTMLElement[]) => {
    for (const item of list) item.tabIndex = item === active ? 0 : -1;
  }, []);

  /* Deliberately no dependency array. The item set is whatever the last
     render left in the DOM, so the tabbable one has to be re-picked just as
     often — which is also what keeps this right when the list is filtered
     down to nothing and back, or when the current example changes. Reading the
     `0` back out of the DOM rather than remembering it in a ref is what makes
     that idempotent: a re-render on its own moves nothing. */
  useEffect(() => {
    const list = items();
    if (list.length === 0) return;

    const active =
      list.find(
        (item) => item.tabIndex === 0 && item.hasAttribute("tabindex"),
      ) ??
      list.find((item) => item.getAttribute("aria-current") === "page") ??
      list[0];

    setActive(active, list);
  });

  const onKeyDown = (event: KeyboardEvent) => {
    const [back, forward] =
      orientation === "vertical"
        ? ["ArrowUp", "ArrowDown"]
        : ["ArrowLeft", "ArrowRight"];

    const item = (event.target as HTMLElement).closest<HTMLElement>(ITEMS);
    const list = items();
    const from = item ? list.indexOf(item) : -1;
    if (from === -1) return;

    let to;
    if (event.key === back) to = from - 1;
    else if (event.key === forward) to = from + 1;
    else if (event.key === "Home") to = 0;
    else if (event.key === "End") to = list.length - 1;
    else return;

    /* Clamped rather than wrapped, and the key is swallowed either way: at the
       ends these are the arrows the scroller would otherwise act on, and 160
       examples is far enough that ArrowUp on the first landing on the last would
       read as a glitch rather than as a shortcut. */
    event.preventDefault();
    to = Math.min(Math.max(to, 0), list.length - 1);
    if (to === from) return;

    setActive(list[to], list);
    list[to].focus();
  };

  /* Focus also arrives by click and by Tab, and the `0` has to follow it —
     otherwise tabbing out of the group and back lands on wherever the arrows
     last were rather than on what the user just used. */
  const onFocus = (event: FocusEvent) => {
    const item = (event.target as HTMLElement).closest<HTMLElement>(ITEMS);
    if (!item) return;

    const list = items();
    if (list.includes(item)) setActive(item, list);
  };

  return { onKeyDown, onFocus };
}
