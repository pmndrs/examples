"use client";

import { useQueryStates } from "nuqs";

import { filterParsers } from "@/lib/filters";
import { Badge } from "@/components/ui/badge";

/**
 * A tag, and the only way into the tag filter — there is no picker. The list
 * of tags is 117 long and most of them sit on a single example, so a control
 * that enumerated them would be a menu nobody reads; arriving at a tag by
 * having landed on an example that carries it is the actual gesture ("show me
 * the others like this one").
 *
 * Which leaves the badge to say what a picker would have said: pressed, it is
 * the reason the list is short, and clicking it again is how that is undone.
 */
export function TagBadge({
  tag,
  variant = "default",
  focusable = true,
}: {
  tag: string;
  variant?: "default" | "secondary";
  /** Off inside the example list, whose cards are one tab stop between them
      all — see `data-roving-skip` in `use-roving-tabindex`. */
  focusable?: boolean;
}) {
  const [{ tag: activeTag }, setFilters] = useQueryStates(filterParsers);
  const active = activeTag === tag;

  return (
    <Badge
      variant={active ? "outline" : variant}
      render={<button type="button" />}
      aria-pressed={active}
      aria-label={
        active ? `Stop filtering by ${tag}` : `Filter examples by ${tag}`
      }
      onClick={() => setFilters({ tag: active ? "" : tag })}
      {...(focusable ? {} : { tabIndex: -1, "data-roving-skip": "" })}
      className="cursor-pointer"
    >
      {tag}
    </Badge>
  );
}
