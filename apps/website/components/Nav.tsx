"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ComponentProps,
  CSSProperties,
  ElementRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useParams } from "next/navigation";
import { createSerializer, parseAsString, useQueryStates } from "nuqs";
import { type Options, useHotkeys } from "react-hotkeys-hook";
import { useEventListener, useIsClient } from "usehooks-ts";
import {
  ChevronLeftIcon,
  ListFilterIcon,
  SearchIcon,
  XIcon,
} from "lucide-react";

import { getLibraryLabel, getLibraryPopularity } from "@/const/libraries";
import { useRovingTabIndex } from "@/hooks/use-roving-tabindex";
import type { Example } from "@/lib/helper";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Item, ItemFooter, ItemMedia } from "@/components/ui/item";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";

/* Where the rail's collapsed preference lives. `bootNav` in `app/layout.tsx`
   reads it before first paint; this is the end that writes it. */
const STORAGE_KEY = "nav-collapsed";
const MAX_TAGS = 4;
const INITIAL_THUMBNAILS = 6;
/* Tag-strip widths for the placeholder cards a filtered arrival waits in
   front of — one row per card, the same handful the list mounts eagerly.
   Written out rather than drawn at random: the markup has to come out the
   same on both sides of hydration, and real strips are two or three pills of
   uneven length. */
const SKELETON_TAGS = [
  [56, 88],
  [72],
  [64, 104, 48],
  [96, 60],
  [52, 76],
  [80, 44, 92],
];

/* Filters are shareable: `?q=` carries the search text, `?library=` the
   library filter. nuqs owns the round trip — the URL *is* the state, so the
   defaults below double as the "no filter" values and `clearOnDefault` (on by
   default) drops the empty param rather than leaving `?q=` behind.

   Its defaults also cover what the hand-rolled version had to spell out: a
   shallow `history.replaceState` instead of a router navigation per keystroke,
   throttled to stay under Safari's History API rate limit. */
const filterParsers = {
  q: parseAsString.withDefault(""),
  library: parseAsString.withDefault(""),
};

/* Same parsers, used to hang the active filter off every card link so it
   survives the client navigation into an example. */
const serializeFilters = createSerializer(filterParsers);

/* `data-nav-collapsed` is put on <html> before first paint by `bootNav`
   (`app/layout.tsx`) — the only way a statically exported page can weigh
   `localStorage`, the `?nav=` override and the current route that early.
   React reads the verdict back through `useSyncExternalStore` rather than from
   a mount effect: the value is already there at hydration, and the server
   snapshot is what keeps the first render agreeing with the prerendered HTML.

   The read is cached because React hands the attribute back as soon as the
   panel is its own (see the effect below); a later read would report a rail
   that is open no matter how the page was painted. */
let paintedCollapsed: boolean | undefined;

const subscribeToPaintedCollapsed = () => () => {};
const getPaintedCollapsed = () =>
  (paintedCollapsed ??=
    document.documentElement.hasAttribute("data-nav-collapsed"));
const getPaintedCollapsedOnServer = () => false;

/**
 * Keep the list itself complete for links, roving focus and stable scroll
 * geometry, but only mount expensive thumbnail/tag subtrees near the visible
 * part of the SidebarContent scroller. One observer handles the whole list;
 * the hook reruns when filtering changes its children or the mobile Sheet
 * mounts its list.
 */
function useNearbyExamples(
  list: HTMLUListElement | null,
  visibleExamples: readonly Example[],
) {
  const [nearby, setNearby] = useState<ReadonlySet<string>>(() => new Set());

  useLayoutEffect(() => {
    /* No list, nothing rendered from `nearby`: leaving the old set alone
       spares a render, and the seed below replaces it wholesale anyway. */
    if (!list) return;

    const items = Array.from(
      list.querySelectorAll<HTMLElement>("[data-example]"),
    );

    const observable = "IntersectionObserver" in window;
    const root = list.closest<HTMLElement>("[data-slot='sidebar-content']");
    const rootRect = observable ? root?.getBoundingClientRect() : undefined;
    /* An unbounded window is also the answer for a browser without
       IntersectionObserver: nothing will narrow it later, so every card
       counts as nearby and the seed below is the whole of the fallback. */
    const nearTop = rootRect ? rootRect.top - rootRect.height / 2 : -Infinity;
    const nearBottom = rootRect
      ? rootRect.bottom + rootRect.height / 2
      : Infinity;

    /* IntersectionObserver reports after layout, which leaves a blank frame
       when filtering moves an unmounted thumbnail into view. Seed the same
       50% margin synchronously so the next render is ready before paint.

       This is the measure-then-render pass `useLayoutEffect` exists for, and
       the one shape `set-state-in-effect` cannot tell apart from a cascading
       render; the observer below, where this state spends the rest of its
       life, is the subscription the rule asks for. */
    // eslint-disable-next-line react-hooks/set-state-in-effect -- measured layout, see above
    setNearby(
      new Set(
        items.flatMap((item) => {
          const rect = item.getBoundingClientRect();
          return item.dataset.example &&
            rect.bottom > nearTop &&
            rect.top < nearBottom
            ? [item.dataset.example]
            : [];
        }),
      ),
    );

    if (!observable) return;

    let active = true;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!active) return;

        setNearby((current) => {
          const next = new Set(current);
          let changed = false;

          for (const entry of entries) {
            if (!list.contains(entry.target)) continue;

            const name = (entry.target as HTMLElement).dataset.example;
            if (!name) continue;

            if (entry.isIntersecting && !next.has(name)) {
              next.add(name);
              changed = true;
            } else if (!entry.isIntersecting && next.delete(name)) {
              changed = true;
            }
          }

          return changed ? next : current;
        });
      },
      { root, rootMargin: "50% 0px" },
    );

    items.forEach((item) => observer.observe(item));
    return () => {
      active = false;
      observer.disconnect();
    };
  }, [list, visibleExamples]);

  return nearby;
}

function hasInteractiveFocus(element: Element | null) {
  return (
    element instanceof HTMLElement &&
    (element.isContentEditable ||
      Boolean(
        element.closest(
          "a, button, input, select, textarea, [role='button'], [role='link']",
        ),
      ))
  );
}

/**
 * The rail's own handle, deliberately a sibling of `<Sidebar>` rather than a
 * child: once the panel is off-canvas the only thing left on screen is this
 * pill, so it has to live in the `<SidebarProvider>` wrapper and straddle the
 * panel's edge from there.
 */
function NavToggle() {
  const { open, openMobile, isMobile, setOpenMobile, toggleSidebar } =
    useSidebar();
  const { examplename } = useParams();

  /* Under `md` the panel is a sheet with its own open state, and `open` still
     holds whatever the rail was left at. `toggleSidebar` already picks the
     right one; the label has to agree with it. */
  const shown = isMobile ? openMobile : open;

  const [near, setNear] = useState(false);

  useEffect(() => {
    if (isMobile) setOpenMobile(!examplename);
  }, [examplename, isMobile, setOpenMobile]);

  /* Collapsed, the pill mostly tucks itself into the page edge; bringing the
     pointer over there nudges it back out. Expanded, the proximity is moot —
     the class list below never reaches `near` — so the listener stays put and
     simply reports `false`, which keeps the state honest for the next
     collapse without a second effect to reset it. */
  useEventListener("mousemove", (event) =>
    setNear(!shown && event.clientX < 120),
  );

  return (
    <Button
      variant="secondary"
      size="lg"
      onClick={toggleSidebar}
      aria-label={shown ? "Hide examples" : "Show examples"}
      aria-pressed={shown}
      className={cn(
        /* `inset-y-0` + `my-auto` centres the capsule without a Y transform.
           Cancel Button's pressed translate so pointer-up cannot introduce a
           one-pixel hop while the rail is already moving horizontally. */
        "absolute inset-y-0 right-0 z-20 my-auto h-22 w-11 flex-col gap-1.5 rounded-full px-0 text-[0.6rem] leading-none shadow-2xl transition-transform duration-250 ease-out [--secondary:var(--card)] active:not-aria-[haspopup]:translate-y-0 [&_svg]:size-3",
        shown
          ? /* Right edge halfway across the gutter between the rail and the
               example — which is `main`'s padding, since the two are flush. Half
               its own width would put the edge at 22px, past the gutter's
               midpoint and nearly onto the example. The collapsed offsets below
               are a different measure: there the wrapper has no width, so they
               are just how much sliver is left against the page edge. */
            "translate-x-[calc(var(--main-p)/2)]"
          : near
            ? "translate-x-3/4"
            : "translate-x-1/4",
      )}
    >
      <ChevronLeftIcon
        className={cn(
          "transition-transform duration-1078 ease-expressive",
          !shown && "rotate-180",
        )}
      />
      {/* Written out from the first client render, not once mounted: `shown`
          reaches back to the pre-paint mark through `useSyncExternalStore`, so
          the word is already right where a `localStorage` read would have made
          it a coin flip — and the pill no longer reflows around a label that
          turns up late. */}
      <span className="tracking-wider uppercase [writing-mode:vertical-rl]">
        {shown ? "hide" : "show"}
      </span>
    </Button>
  );
}

export default function Nav({
  examples,
  className,
  style,
  ...props
}: { examples: Example[] } & ComponentProps<"div">) {
  const ulRef = useRef<ElementRef<"ul">>(null);
  const [listElement, setListElement] = useState<HTMLUListElement | null>(null);
  const roving = useRovingTabIndex(ulRef);
  const searchRef = useRef<HTMLInputElement>(null);

  const setListRef = useCallback((node: HTMLUListElement | null) => {
    ulRef.current = node;
    setListElement(node);
  }, []);

  const [openState, setOpenState] = useState<boolean | null>(null);
  const ready = useIsClient();
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const [{ q: search, library }, setFilters] = useQueryStates(filterParsers);
  const setSearch = useCallback(
    (value: string | ((current: string) => string)) =>
      setFilters((current) => ({
        q: typeof value === "function" ? value(current.q) : value,
      })),
    [setFilters],
  );
  const setLibrary = useCallback(
    (value: string) => setFilters({ library: value }),
    [setFilters],
  );

  const searchVisible = searchOpen || search !== "";

  const paintedCollapsed = useSyncExternalStore(
    subscribeToPaintedCollapsed,
    getPaintedCollapsed,
    getPaintedCollapsedOnServer,
  );

  const setOpen = useCallback((next: boolean) => {
    setOpenState(next);
    localStorage.setItem(STORAGE_KEY, next ? "0" : "1");
  }, []);

  /* Until this visitor touches the rail there is nothing to restore: the panel
     stays as the page was painted. */
  const open = openState ?? !paintedCollapsed;

  /* Except for a shared filter link, which has to be able to show what it
     filtered down to — so the first non-empty filter wins over a collapsed
     rail, covering a link opened cold as much as one whose params only reach
     the client after hydration. Adjusting state while rendering, rather than
     from an effect, is React's own answer to "a value changed and some state
     has to follow": it lands in the same commit instead of a second pass.

     Plain state, not `setOpen`: following someone's filter link should not
     overwrite this visitor's stored collapse preference. */
  const hasFilters = search !== "" || library !== "";
  const [filtersRevealed, setFiltersRevealed] = useState(hasFilters);
  if (hasFilters && !filtersRevealed) {
    setFiltersRevealed(true);
    setOpenState(true);
    if (search) setSearchOpen(true);
  }

  const libraryOptions = useMemo(() => {
    const popularityByLabel = new Map<string, number>();
    const usageByLabel = new Map<string, number>();
    const libraries = new Set(examples.flatMap((example) => example.libraries));

    libraries.forEach((exampleLibrary) => {
      const label = getLibraryLabel(exampleLibrary);
      popularityByLabel.set(
        label,
        (popularityByLabel.get(label) ?? 0) +
          getLibraryPopularity(exampleLibrary),
      );
    });

    examples.forEach((example) => {
      const labels = new Set(example.libraries.map(getLibraryLabel));
      labels.forEach((label) => {
        usageByLabel.set(label, (usageByLabel.get(label) ?? 0) + 1);
      });
    });

    return Array.from(popularityByLabel)
      .sort(
        ([labelA, popularityA], [labelB, popularityB]) =>
          (usageByLabel.get(labelB) ?? 0) - (usageByLabel.get(labelA) ?? 0) ||
          popularityB - popularityA ||
          labelA.localeCompare(labelB),
      )
      .map(([label]) => label);
  }, [examples]);

  const filteredExamples = useMemo(() => {
    const terms = search
      .trim()
      .toLocaleLowerCase()
      .split(/\s+/)
      .filter(Boolean);

    return examples
      .filter((example) => {
        if (
          library &&
          !example.libraries.some(
            (exampleLibrary) => getLibraryLabel(exampleLibrary) === library,
          )
        ) {
          return false;
        }

        if (terms.length === 0) return true;

        const searchableText = [
          example.name,
          example.title,
          example.description,
          ...example.tags,
          ...example.authors,
          ...example.libraries.map(getLibraryLabel),
        ]
          .join(" ")
          .toLocaleLowerCase();

        return terms.every((term) => searchableText.includes(term));
      })
      .sort(
        (exampleA, exampleB) => Number(exampleB.isNew) - Number(exampleA.isNew),
      );
  }, [examples, library, search]);
  const nearbyExamples = useNearbyExamples(listElement, filteredExamples);

  const focusSearch = useCallback(
    (select = false) => {
      setOpen(true);
      setSearchOpen(true);

      requestAnimationFrame(() => {
        searchRef.current?.focus();
        if (select) searchRef.current?.select();
      });
    },
    [setOpen],
  );

  const dismissSearch = useCallback(() => {
    setSearch("");
    setSearchOpen(false);
    searchRef.current?.blur();
  }, [setSearch]);

  /* The rail's keyboard layer, one hotkey at a time rather than a single
     window listener with a ladder of early returns: every branch of it reads
     state that changes as fast as the visitor types, and `useHotkeys` keeps
     the callbacks in refs, so nothing is torn down and re-subscribed per
     keystroke. What the ladder said by falling through, `enabled` and
     `ignoreEventWhen` now say out loud.

     `enabled: !libraryOpen` is the ladder's first rung kept whole: the open
     dropdown is portalled out of the nav, so `activeElement` is nowhere near
     the trigger and the type-to-search below would eat the list's own
     typeahead. It owns the keyboard while it is open. */
  const shortcut = {
    enabled: !libraryOpen,
    enableOnFormTags: true,
    preventDefault: true,
  } satisfies Options;

  useHotkeys(
    "meta+f, ctrl+f, meta+k, ctrl+k",
    () => focusSearch(true),
    shortcut,
  );

  useHotkeys("escape", dismissSearch, {
    ...shortcut,
    enabled: !libraryOpen && searchVisible,
  });

  /* Type-to-search, which unlike the shortcuts above must not fire while
     something else holds the keyboard: leaving `enableOnFormTags` off covers
     the fields, `ignoreEventWhen` the links and buttons. `useKey` matches the
     character the visitor typed rather than the physical key, so `/` stays `/`
     on a layout that puts it elsewhere. */
  const typeAhead = {
    enabled: !libraryOpen,
    ignoreEventWhen: () => hasInteractiveFocus(document.activeElement),
    preventDefault: true,
    useKey: true,
  } satisfies Options;

  useHotkeys("slash", () => focusSearch(), typeAhead);

  useHotkeys(
    "backspace",
    () => {
      setSearch((value) => value.slice(0, -1));
      focusSearch();
    },
    { ...typeAhead, enabled: !libraryOpen && search !== "" },
  );

  /* Anything else printable lands in the field. `preventDefault` is the
     callback's business here and not the options': this one matches every key
     there is, and swallowing Tab or the arrows would take the list's roving
     focus with it. `/` and Backspace are already spoken for above. */
  useHotkeys(
    "*",
    (event) => {
      if (
        event.key.length !== 1 ||
        event.key === "/" ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        (event.key === " " && search.length === 0)
      ) {
        return;
      }

      event.preventDefault();
      setSearch((value) => `${value}${event.key}`);
      focusSearch();
    },
    { ...typeAhead, preventDefault: false },
  );

  const { examplename } = useParams();

  /* React hands the pre-paint marks back once it has rendered a panel and a
     list of its own: from here on the state above is the truth, and a stale
     attribute would fight it (see the pre-paint rules in `app/globals.css`).
     By this render `q` and `library` have reached the client — the adapter
     reads them through `useSyncExternalStore`, which settles during the
     hydration commit, before this effect. */
  useEffect(() => {
    if (!ready) return;
    document.documentElement.removeAttribute("data-nav-collapsed");
    document.documentElement.removeAttribute("data-nav-filtering");
  }, [ready]);

  const firstRef = useRef(true);
  useEffect(() => {
    const hasExampleSelected =
      typeof examplename === "string" && examplename.length > 0;
    if (!hasExampleSelected) return;
    const li = ulRef.current?.querySelector(
      `[data-example="${CSS.escape(examplename)}"]`,
    );
    if (li)
      li.scrollIntoView({
        inline: "center",
        block: "center",
        behavior: firstRef.current ? "instant" : "smooth",
      });
    firstRef.current = false;
  }, [examplename, filteredExamples]);

  return (
    <SidebarProvider
      open={open}
      onOpenChange={setOpen}
      /* The provider writes `--sidebar-width` inline, so the site's responsive
         rail width has to arrive the same way. On desktop this wrapper owns
         the entire collapse motion, matching the old implementation: its
         width stays fixed and a negative inline margin gives that space back
         to the example. The stock Sidebar gap and panel remain static inside it,
         avoiding simultaneous width + left animations. Mobile still uses the
         component's Sheet branch and ignores the desktop-only margin. */
      style={
        {
          "--sidebar-width": "var(--sidebar-w)",
          "--nav-offset": open ? "0px" : "calc(var(--sidebar-width) * -1)",
          ...style,
        } as CSSProperties
      }
      className={cn(
        "relative w-0 shrink-0 md:ms-(--nav-offset) md:w-(--sidebar-width) md:transition-[margin-inline-start] md:duration-1078 md:ease-expressive md:will-change-[margin-inline-start]",
        "**:data-[slot=sidebar-gap]:w-(--sidebar-width)! **:data-[slot=sidebar-gap]:transition-none!",
        "**:data-[slot=sidebar-container]:absolute! **:data-[slot=sidebar-container]:left-0! **:data-[slot=sidebar-container]:transition-none!",
        className,
      )}
      {...props}
    >
      {/* The rail paints the same colour as the page, so the component's own
          divider is the only thing left drawing a seam down the middle of a
          flush surface. Same variant as the rule it cancels, so `cn`'s merge
          drops that one outright rather than out-specifying it. */}
      <Sidebar className="group-data-[side=left]:border-r-0">
        {/* 16px down both edges, in place of the components' stock 8px. It has
            to be set on the two children: `className` here lands on the fixed
            container, and the panel's background is painted a level deeper. */}
        <SidebarHeader className="px-4">
          {/* Both branches read the URL, so on a filtered arrival both are
              wrong until React knows it: the row would paint the library
              filter unset, or paint the dropdown where the search field
              belongs. `display: contents` so standing in front of them
              changes nothing about how they lay out. */}
          <Skeleton id="nav-filters-skeleton" className="h-9 rounded-full" />
          <div id="nav-filters" className="contents">
            {searchVisible ? (
              <InputGroup className="animate-in border-border bg-input shadow-lg duration-200 fade-in slide-in-from-top-1">
                {/* Addons come after the control in the DOM — they focus it on
                  click and take their visual side from `align`. */}
                <InputGroupInput
                  ref={searchRef}
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  onFocus={() => setSearchOpen(true)}
                  placeholder="Search examples"
                  aria-label="Search examples"
                  aria-controls="example-list"
                  aria-describedby="search-results"
                  className="[&::-webkit-search-cancel-button]:hidden"
                />
                <InputGroupAddon>
                  <SearchIcon />
                </InputGroupAddon>
                <InputGroupAddon align="inline-end">
                  <InputGroupText className="text-xs tabular-nums">
                    {filteredExamples.length}
                  </InputGroupText>
                  <InputGroupButton
                    size="icon-xs"
                    onClick={dismissSearch}
                    aria-label="Close search"
                  >
                    <XIcon />
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            ) : (
              <div className="flex items-center gap-2">
                <Select
                  open={libraryOpen}
                  onOpenChange={setLibraryOpen}
                  value={library || null}
                  onValueChange={(value) => setLibrary(value ?? "")}
                >
                  <SelectTrigger
                    className="min-w-0 flex-1 border-border bg-input shadow-lg"
                    aria-label="Filter examples by library"
                  >
                    <ListFilterIcon className="text-muted-foreground" />
                    <SelectValue placeholder="All libraries" />
                  </SelectTrigger>
                  <SelectContent className="backdrop-blur-sm">
                    <SelectGroup>
                      {/* `null` is Base UI's cleared value, so the option that
                        drops the filter is the one that carries it and the
                        state stays "". */}
                      <SelectItem value={null}>All libraries</SelectItem>
                      {libraryOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => focusSearch()}
                  aria-label="Search examples"
                  aria-keyshortcuts="Meta+F Control+F Meta+K Control+K"
                  title="Search examples (⌘F)"
                  className="bg-input shadow-lg"
                >
                  <SearchIcon />
                </Button>
              </div>
            )}
          </div>
          <span id="search-results" className="sr-only" aria-live="polite">
            {filteredExamples.length} examples
          </span>
        </SidebarHeader>

        {/* `scroll-fade` goes on the scroller, not on the header it softens:
            the utility masks the element it sits on and reads that element's
            own scroll position. It reveals each edge over the first 96px of
            travel, so a list sitting at the top is not faded into its own
            first card. Without scroll-driven-animation support the two fades
            are simply always on. */}
        <SidebarContent className="relative scroll-fade px-4">
          {/* What a filtered arrival looks at while the JS that will narrow
              the list is still loading — the pre-paint rules in
              `app/globals.css` swap the two, and the effect above drops the
              mark once React has rendered the real thing. Laid over the list
              rather than above it, because the list keeps its box (see those
              rules); inert, because the list underneath is the real content
              and is what gets announced. */}
          <ul
            id="example-skeletons"
            aria-hidden
            className="absolute inset-x-4 top-2 flex flex-col gap-3"
          >
            {SKELETON_TAGS.map((widths, index) => (
              <li key={index} className="relative">
                <Skeleton className="aspect-video w-full rounded-md" />
                {/* Same corner as the real strip, so the shape the eye is
                    waiting for is already there when the cards land. Darker
                    than the card it sits on, the way the real pills are —
                    at the card's own tone they read as holes in it. */}
                <div className="absolute inset-x-0 bottom-0 flex gap-1 p-1.5">
                  {widths.map((width, tag) => (
                    <Skeleton
                      key={tag}
                      style={{ width }}
                      className="h-5 rounded-full bg-foreground/10"
                    />
                  ))}
                </div>
              </li>
            ))}
          </ul>

          <nav aria-label="Examples">
            <ul
              ref={setListRef}
              /* One tab stop for the whole list, arrows to move inside it —
                 otherwise the ~160 cards sit between the filter row and
                 everything after the rail. */
              {...roving}
              id="example-list"
              /* The block padding is not decoration: the selected card's ring
                 sits outside its border box, and the scroller would clip it on
                 the first and last item without it. The inline half of it moved
                 up to `SidebarContent`, so the header lines up with the list. */
              className="flex flex-col gap-3 py-2"
            >
              {filteredExamples.map(
                ({ name, title, thumb, isNew, tags }, index) => {
                  const renderDetails =
                    index < INITIAL_THUMBNAILS ||
                    nearbyExamples.has(name) ||
                    examplename === name;

                  return (
                    <li
                      key={thumb}
                      data-example={name}
                      className="transition-transform duration-1078 ease-expressive active:scale-97"
                    >
                      <Item
                        render={
                          <Link
                            /* The filter rides along: the rail stays mounted
                               across this navigation, but the URL is the state
                               now, so a bare `/examples/<name>` would clear
                               it. */
                            href={serializeFilters(`/examples/${name}`, {
                              q: search,
                              library,
                            })}
                            aria-label={title}
                            aria-current={
                              examplename === name ? "page" : undefined
                            }
                            className="no-underline"
                          />
                        }
                        variant="default"
                        className={cn(
                          "relative overflow-hidden rounded-md bg-card p-0 transition-[color,box-shadow] duration-200 hover:shadow-lg",
                          examplename === name && "ring-2 ring-foreground",
                        )}
                      >
                        {/* Every card keeps its aspect-ratio box mounted, so
                              observing and arrow-key focus never change scroll
                              geometry. Only the costly contents are windowed. */}
                        <ItemMedia
                          variant="image"
                          className="relative aspect-video size-auto w-full rounded-none"
                        >
                          {renderDetails && (
                            /* Thumbnails are served by each example, not by
                                 this site, so in dev every card but the running
                                 one 404s. A broken img stops being a replaced
                                 element, which is when its pseudo-elements
                                 render: `after` covers the browser glyph and
                                 restores the alt text. */
                            <Image
                              src={thumb}
                              fill
                              sizes="(min-width: 640px) 260px, 200px"
                              alt={title}
                              className="after:absolute after:inset-0 after:grid after:place-items-center after:bg-card after:px-3 after:text-center after:text-xs after:text-muted-foreground after:content-[attr(alt)]"
                            />
                          )}
                        </ItemMedia>
                        {isNew && (
                          <Badge
                            variant="secondary"
                            className="absolute top-1.5 right-1.5 bg-new text-new-foreground"
                          >
                            New
                          </Badge>
                        )}
                        {renderDetails && tags.length > 0 && (
                          <ItemFooter className="absolute inset-x-0 bottom-0">
                            {/* Same fade as the example list, on the other axis.
                                  It has to be aimed at the viewport: `ScrollArea`
                                  puts its `className` on the root, and the root is
                                  not what scrolls. */}
                            <ScrollArea className="w-full *:data-[slot=scroll-area-viewport]:scroll-fade-x">
                              {/* Padding sits inside the viewport so the
                                    scrollable strip itself runs edge to edge. */}
                              <div className="flex w-max gap-1 p-1.5">
                                {tags.slice(0, MAX_TAGS).map((tag) => (
                                  <Badge key={tag}>{tag}</Badge>
                                ))}
                              </div>
                              <ScrollBar orientation="horizontal" />
                            </ScrollArea>
                          </ItemFooter>
                        )}
                      </Item>
                    </li>
                  );
                },
              )}
            </ul>
          </nav>

          {filteredExamples.length === 0 && (
            /* Stock padding is p-12, which leaves nothing to read in a rail
               this narrow — and the inline half now comes from the scroller. */
            <Empty className="py-6">
              <EmptyHeader>
                <EmptyTitle>No matching examples</EmptyTitle>
              </EmptyHeader>
              <EmptyContent>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    dismissSearch();
                    setLibrary("");
                  }}
                >
                  Clear filters
                </Button>
              </EmptyContent>
            </Empty>
          )}
        </SidebarContent>
      </Sidebar>

      <NavToggle />
    </SidebarProvider>
  );
}
