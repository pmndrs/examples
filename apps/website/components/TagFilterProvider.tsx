"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useQueryStates } from "nuqs";

import { filterParsers } from "@/lib/filters";
import type { Example } from "@/lib/helper";

/** Which examples carry each tag — the whole catalog, indexed once. */
const TagIndexContext = createContext<Map<string, Set<string>> | null>(null);

/**
 * Tags are ANDed, and almost no two of them intersect: 117 tags make 6,786
 * pairs, of which 336 occur together at all and 263 of those on a single
 * example. Left alone, a second click empties the list nine times out of ten.
 *
 * So the second click is not offered when it would: `useTagAvailability` walks
 * the intersection and the badge goes disabled. Which turns the dead end from
 * something you discover by falling into it into something you can see.
 *
 * It weighs the tags only, not `?q=` or `?library=` — a pill greyed out because
 * of what is in the search box reads as broken rather than as narrow.
 *
 * Sits in the layout because both ends of the filter need it: the cards in the
 * rail and the example page's info panel.
 */
export function TagFilterProvider({
  examples,
  children,
}: {
  examples: Example[];
  children: ReactNode;
}) {
  const index = useMemo(() => {
    const byTag = new Map<string, Set<string>>();
    for (const example of examples) {
      for (const tag of example.tags) {
        let names = byTag.get(tag);
        if (!names) byTag.set(tag, (names = new Set()));
        names.add(example.name);
      }
    }
    return byTag;
  }, [examples]);

  return (
    <TagIndexContext.Provider value={index}>
      {children}
    </TagIndexContext.Provider>
  );
}

/**
 * `{ active, toggle, available }` for a tag. `available` is false only for a
 * tag that is not selected and would take the list to nothing — an already
 * selected tag stays live, because clicking it is how it comes off.
 */
export function useTagFilter() {
  const index = useContext(TagIndexContext);
  const [{ tag: activeTags }, setFilters] = useQueryStates(filterParsers);

  /* The examples that survive the tags picked so far. `null` stands for "all
     of them", so the no-filter case costs no set at all. */
  const matching = useMemo<Set<string> | null>(() => {
    if (!index || activeTags.length === 0) return null;

    const carriersOf = (tag: string) => index.get(tag) ?? new Set<string>();
    const [first, ...rest] = activeTags;
    let names = new Set(carriersOf(first));

    for (const tag of rest) {
      const carriers = carriersOf(tag);
      const kept: string[] = [];
      names.forEach((name) => {
        if (carriers.has(name)) kept.push(name);
      });
      names = new Set(kept);
    }

    return names;
  }, [index, activeTags]);

  return useMemo(
    () => ({
      activeTags,
      isActive: (tag: string) => activeTags.includes(tag),
      isAvailable: (tag: string) => {
        if (activeTags.includes(tag)) return true;
        if (matching === null) return true;
        const carriers = index?.get(tag);
        if (!carriers) return false;
        for (const name of matching) if (carriers.has(name)) return true;
        return false;
      },
      toggle: (tag: string) =>
        setFilters({
          tag: activeTags.includes(tag)
            ? activeTags.filter((other) => other !== tag)
            : [...activeTags, tag],
        }),
    }),
    [activeTags, index, matching, setFilters],
  );
}
