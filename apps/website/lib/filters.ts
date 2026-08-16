import { createSerializer, parseAsArrayOf, parseAsString } from "nuqs";

/* Filters are shareable: `?q=` carries the search text, `?library=` the library
   filter, `?tag=` the tag one. nuqs owns the round trip — the URL *is* the
   state, so the defaults below double as the "no filter" values and
   `clearOnDefault` (on by default) drops the empty param rather than leaving
   `?q=` behind.

   Its defaults also cover what the hand-rolled version had to spell out: a
   shallow `history.replaceState` instead of a router navigation per keystroke,
   throttled to stay under Safari's History API rate limit.

   They live here rather than in `Nav` because the tag badges set `?tag=` from
   two places — the cards in the rail, and the example page's info panel — and
   both ends have to agree on the parser. */
export const filterParsers = {
  q: parseAsString.withDefault(""),
  library: parseAsString.withDefault(""),
  /* Comma-separated, ANDed. Of the 6,786 pairs two of the 117 tags can make,
     336 occur together at all — so a second tag reaches an empty list unless
     something stops it being offered. `useTagAvailability` is that something;
     see `TagFilterProvider`. */
  tag: parseAsArrayOf(parseAsString).withDefault([]),
};

/* Same parsers, used to hang the active filters off every card link so they
   survive the client navigation into an example. */
export const serializeFilters = createSerializer(filterParsers);
