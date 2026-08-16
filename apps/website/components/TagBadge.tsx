"use client";

import { useTagFilter } from "@/components/TagFilterProvider";
import { Badge } from "@/components/ui/badge";

/**
 * A tag, and the only way into the tag filter — there is no picker. The list
 * of tags is 117 long and most of them sit on a single example, so a control
 * that enumerated them would be a menu nobody reads, whereas "show me the
 * others like this one" is the gesture people actually have.
 *
 * Which leaves the badge to say what a picker would have said: pressed, it is
 * the reason the list is short, and clicking it again is how that is undone.
 *
 * Tags AND together, and a second one usually intersects to nothing — so a
 * badge that would empty the list is disabled rather than left to be found by
 * falling into it. On a card that never happens: a card is in the list because
 * it carries every active tag, so every pill on it has at least that card
 * behind it. It is the info panel, whose example may not be in the list at all,
 * that needs the check.
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
  const { isActive, isAvailable, toggle } = useTagFilter();
  const active = isActive(tag);
  const available = isAvailable(tag);

  return (
    <Badge
      variant={active ? "outline" : variant}
      render={<button type="button" disabled={!available} />}
      aria-pressed={active}
      aria-label={
        active
          ? `Stop filtering by ${tag}`
          : available
            ? `Also filter examples by ${tag}`
            : `${tag}, no example carries it alongside the tags already picked`
      }
      onClick={() => toggle(tag)}
      {...(focusable ? {} : { tabIndex: -1, "data-roving-skip": "" })}
      className="cursor-pointer disabled:cursor-default disabled:opacity-40"
    >
      {tag}
    </Badge>
  );
}
