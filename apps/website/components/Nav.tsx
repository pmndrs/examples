"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ComponentProps,
  CSSProperties,
  ElementRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useParams, usePathname } from "next/navigation";
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

const STORAGE_KEY = "nav-collapsed";
const MAX_TAGS = 4;
const INITIAL_THUMBNAILS = 6;
/* `library` is "" for no filter, but Radix rejects an empty SelectItem value —
   it reserves it for clearing the selection. The sentinel is what the option
   carries; the state stays "". */
const ALL_LIBRARIES = "__all__";

/**
 * Keep the list itself complete for links, roving focus and stable scroll
 * geometry, but only mount expensive thumbnail/tag subtrees near the visible
 * part of the SidebarContent scroller. One observer handles the whole list;
 * importantly, the hook reruns when Radix mounts the mobile Sheet's list.
 */
function useNearbyExamples(list: HTMLUListElement | null) {
  const [nearby, setNearby] = useState<ReadonlySet<string>>(() => new Set());

  useEffect(() => {
    if (!list) {
      setNearby((current) => (current.size === 0 ? current : new Set()));
      return;
    }

    const items = Array.from(
      list.querySelectorAll<HTMLElement>("[data-example]"),
    );

    if (!("IntersectionObserver" in window)) {
      setNearby(
        new Set(
          items.flatMap((item) =>
            item.dataset.example ? [item.dataset.example] : [],
          ),
        ),
      );
      return;
    }

    const root = list.closest<HTMLElement>("[data-slot='sidebar-content']");
    const observer = new IntersectionObserver(
      (entries) => {
        setNearby((current) => {
          const next = new Set(current);
          let changed = false;

          for (const entry of entries) {
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
    return () => observer.disconnect();
  }, [list]);

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
  const {
    open,
    openMobile,
    isMobile,
    setOpenMobile,
    toggleSidebar,
  } = useSidebar();
  const { examplename } = useParams();

  /* Under `md` the panel is a sheet with its own open state, and `open` still
     holds whatever the rail was left at. `toggleSidebar` already picks the
     right one; the label has to agree with it. */
  const shown = isMobile ? openMobile : open;

  const [ready, setReady] = useState(false);
  const [near, setNear] = useState(false);

  useEffect(() => setReady(true), []);

  useEffect(() => {
    if (isMobile) setOpenMobile(!examplename);
  }, [examplename, isMobile, setOpenMobile]);

  /* Collapsed, the pill mostly tucks itself into the page edge; bringing the
     pointer over there nudges it back out. */
  useEffect(() => {
    if (shown) {
      setNear(false);
      return;
    }

    const onMove = (event: MouseEvent) => setNear(event.clientX < 120);
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [shown]);

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
        "absolute inset-y-0 right-0 z-20 my-auto h-22 w-11 flex-col gap-1.5 rounded-full px-0 text-[0.6rem] leading-none shadow-2xl transition-transform duration-[250ms] ease-out [--secondary:var(--card)] active:not-aria-[haspopup]:translate-y-0 [&_svg]:size-3",
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
          "transition-transform duration-[1078ms] ease-expressive",
          !shown && "rotate-180",
        )}
      />
      <span className="tracking-wider uppercase [writing-mode:vertical-rl]">
        {/* Blank until mounted: the collapsed state comes out of
              `localStorage`, so before then the word would be a coin flip. */}
        {ready ? (shown ? "hide" : "show") : ""}
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
  const nearbyExamples = useNearbyExamples(listElement);

  const setListRef = useCallback((node: HTMLUListElement | null) => {
    ulRef.current = node;
    setListElement(node);
  }, []);

  const [open, setOpenState] = useState(true);
  const [ready, setReady] = useState(false);
  const [library, setLibrary] = useState("");
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const searchVisible = searchOpen || search !== "";

  const setOpen = useCallback((next: boolean) => {
    setOpenState(next);
    localStorage.setItem(STORAGE_KEY, next ? "0" : "1");
  }, []);

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
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const activeElement = document.activeElement;

      /* The open dropdown is portalled out of the nav, so `activeElement` is
         nowhere near the trigger and the type-to-search fallthrough below
         would eat the list's own typeahead. It owns the keyboard while open. */
      if (libraryOpen) return;

      if (
        (event.metaKey || event.ctrlKey) &&
        ["f", "k"].includes(event.key.toLocaleLowerCase())
      ) {
        event.preventDefault();
        focusSearch(true);
        return;
      }

      if (searchVisible && event.key === "Escape") {
        event.preventDefault();
        dismissSearch();
        return;
      }

      if (hasInteractiveFocus(activeElement)) return;

      if (event.key === "/") {
        event.preventDefault();
        focusSearch();
        return;
      }

      if (event.key === "Backspace" && search) {
        event.preventDefault();
        setSearch((value) => value.slice(0, -1));
        focusSearch();
        return;
      }

      if (
        event.key.length !== 1 ||
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
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dismissSearch, focusSearch, libraryOpen, search, searchVisible]);

  const { examplename } = useParams();

  /* `data-nav-collapsed` is put on <html> before first paint by the inline
     script in `app/layout.tsx` — the only way a statically exported page can
     know about `localStorage` that early. React picks the state up here. */
  useEffect(() => {
    setOpenState(!document.documentElement.hasAttribute("data-nav-collapsed"));
    setReady(true);
  }, []);

  /* …and hands the attribute back once that state has rendered: from here on
     the panel is React's, and a stale attribute would fight it (see the
     pre-paint rule in `app/globals.css`). */
  useEffect(() => {
    if (!ready) return;
    document.documentElement.removeAttribute("data-nav-collapsed");
  }, [ready]);

  /* Filters are shareable: `?q=` carries the search text, `?library=` the
     library filter. Read once on mount — declared after the collapse
     restore above so a shared link can win over a collapsed rail. Written
     with `history.replaceState` rather than the router: per-keystroke
     navigations are pointless work, and Safari rate-limits the History API
     anyway, hence the debounce. */
  const pathname = usePathname();
  const urlReadRef = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    const lib = params.get("library");

    if (q) {
      setSearch(q);
      setSearchOpen(true);
      /* Plain state, not `setOpen`: following someone's filter link should
         not overwrite this visitor's stored collapse preference. */
      setOpenState(true);
    }
    if (lib) setLibrary(lib);

    urlReadRef.current = true;
  }, []);

  /* `pathname` is a dependency so the params survive client navigation:
     clicking a card pushes a bare `/examples/<name>`, and this puts the
     active filter back into the address bar. */
  useEffect(() => {
    if (!urlReadRef.current) return;

    const id = setTimeout(() => {
      const url = new URL(window.location.href);

      if (search) url.searchParams.set("q", search);
      else url.searchParams.delete("q");
      if (library) url.searchParams.set("library", library);
      else url.searchParams.delete("library");

      if (url.href !== window.location.href)
        history.replaceState(history.state, "", url);
    }, 150);

    return () => clearTimeout(id);
  }, [search, library, pathname]);

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
        "relative w-0 shrink-0 md:[margin-inline-start:var(--nav-offset)] md:w-(--sidebar-width) md:transition-[margin-inline-start] md:duration-[1078ms] md:ease-expressive md:will-change-[margin-inline-start]",
        "[&_[data-slot=sidebar-gap]]:w-(--sidebar-width)! [&_[data-slot=sidebar-gap]]:transition-none!",
        "[&_[data-slot=sidebar-container]]:absolute! [&_[data-slot=sidebar-container]]:left-0! [&_[data-slot=sidebar-container]]:transition-none!",
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
                value={library || ALL_LIBRARIES}
                onValueChange={(value) =>
                  setLibrary(value === ALL_LIBRARIES ? "" : value)
                }
              >
                <SelectTrigger
                  className="min-w-0 flex-1 border-border bg-input shadow-lg"
                  aria-label="Filter examples by library"
                >
                  <ListFilterIcon className="text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                {/* `item-aligned` — this registry's default, where Radix lays
                    the menu over the trigger with the selected option on top
                    of it — cannot do that for a trigger sitting 26px from the
                    top of the window. It clamps the menu and makes up the
                    difference by scrolling the viewport, here by the 4px of
                    `SelectGroup` padding above the first option. That is a
                    non-zero `scrollTop`, which is the whole of what mounts
                    `SelectScrollUpButton`: an arrow offering to scroll back to
                    an option already in view. `popper` anchors the menu below
                    the trigger instead and never pre-scrolls, so the arrows
                    are left to mean what they say. It also gives
                    `--radix-select-content-available-height` a value, which
                    the component's own `max-h-` reads and item-aligned never
                    sets. */}
                <SelectContent position="popper" className="backdrop-blur-sm">
                  <SelectGroup>
                    <SelectItem value={ALL_LIBRARIES}>All libraries</SelectItem>
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
        <SidebarContent className="scroll-fade px-4">
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
                      className="transition-transform duration-[1078ms] ease-expressive active:scale-97"
                    >
                      <Item
                        asChild
                        variant="default"
                        className={cn(
                          "relative overflow-hidden rounded-md bg-card p-0 transition-[color,box-shadow] duration-200 hover:shadow-lg",
                          examplename === name && "ring-2 ring-foreground",
                        )}
                      >
                        <Link
                          href={`/examples/${name}`}
                          aria-label={title}
                          aria-current={
                            examplename === name ? "page" : undefined
                          }
                          className="no-underline"
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
                              <ScrollArea className="w-full [&>[data-slot=scroll-area-viewport]]:scroll-fade-x">
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
                        </Link>
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
