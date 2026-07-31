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
import { useParams } from "next/navigation";
import {
  ChevronLeftIcon,
  ListFilterIcon,
  SearchIcon,
  XIcon,
} from "lucide-react";

import { getLibraryLabel, getLibraryPopularity } from "@/const/libraries";
import { useRovingTabIndex } from "@/hooks/use-roving-tabindex";
import type { Demo } from "@/lib/helper";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
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
/* `library` is "" for no filter, but Radix rejects an empty SelectItem value —
   it reserves it for clearing the selection. The sentinel is what the option
   carries; the state stays "". */
const ALL_LIBRARIES = "__all__";

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
  const { open, openMobile, isMobile, toggleSidebar } = useSidebar();

  /* Under `md` the panel is a sheet with its own open state, and `open` still
     holds whatever the rail was left at. `toggleSidebar` already picks the
     right one; the label has to agree with it. */
  const shown = isMobile ? openMobile : open;

  const [ready, setReady] = useState(false);
  const [near, setNear] = useState(false);

  useEffect(() => setReady(true), []);

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
    <ButtonGroup
      orientation="vertical"
      className={cn(
        /* The group is what the page positions now, and it carries the pill's
           box: `inset-y-0` + `my-auto` centres it without a `-translate-y-1/2`
           that would fight the button's own `active:translate-y-px`. Above the
           panel's `z-10`, since the pill overlaps its edge. */
        "absolute inset-y-0 right-0 z-20 my-auto h-22 w-11 transition-transform",
        shown
          ? /* Right edge halfway across the gutter between the rail and the
               demo — which is `main`'s padding, since the two are flush. Half
               its own width would put the edge at 22px, past the gutter's
               midpoint and nearly onto the demo. The collapsed offsets below
               are a different measure: there the wrapper has no width, so they
               are just how much sliver is left against the page edge. */
            "translate-x-[calc(var(--main-p)/2)]"
          : near
            ? "translate-x-3/4"
            : "translate-x-1/4",
      )}
    >
      <Button
        variant="secondary"
        size="xs"
        onClick={toggleSidebar}
        aria-label={shown ? "Hide demos" : "Show demos"}
        aria-pressed={shown}
        /* No `rounded-full` here: the group forces `rounded-b-4xl` on its last
           child, and a browser scales *every* corner by the same factor once
           one side overflows — 9999px on top against 26px below would collapse
           the bottom pair to nothing. At 44px wide the stock 4xl is already
           past the 22px cap, so it draws the very same pill. */
        className="size-full flex-col gap-1.5 px-0 shadow-lg"
      >
        <ChevronLeftIcon
          className={cn("transition-transform", !shown && "rotate-180")}
        />
        <span className="tracking-wider uppercase [writing-mode:vertical-rl]">
          {/* Blank until mounted: the collapsed state comes out of
              `localStorage`, so before then the word would be a coin flip. */}
          {ready ? (shown ? "hide" : "show") : ""}
        </span>
      </Button>
    </ButtonGroup>
  );
}

export default function Nav({
  demos,
  className,
  style,
  ...props
}: { demos: Demo[] } & ComponentProps<"div">) {
  const ulRef = useRef<ElementRef<"ul">>(null);
  const roving = useRovingTabIndex(ulRef);
  const searchRef = useRef<HTMLInputElement>(null);

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
    const libraries = new Set(demos.flatMap((demo) => demo.libraries));

    libraries.forEach((demoLibrary) => {
      const label = getLibraryLabel(demoLibrary);
      popularityByLabel.set(
        label,
        (popularityByLabel.get(label) ?? 0) + getLibraryPopularity(demoLibrary),
      );
    });

    demos.forEach((demo) => {
      const labels = new Set(demo.libraries.map(getLibraryLabel));
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
  }, [demos]);

  const filteredDemos = useMemo(() => {
    const terms = search
      .trim()
      .toLocaleLowerCase()
      .split(/\s+/)
      .filter(Boolean);

    return demos.filter((demo) => {
      if (
        library &&
        !demo.libraries.some(
          (demoLibrary) => getLibraryLabel(demoLibrary) === library,
        )
      ) {
        return false;
      }

      if (terms.length === 0) return true;

      const searchableText = [
        demo.name,
        demo.title,
        demo.description,
        ...demo.tags,
        ...demo.authors,
        ...demo.libraries.map(getLibraryLabel),
      ]
        .join(" ")
        .toLocaleLowerCase();

      return terms.every((term) => searchableText.includes(term));
    });
  }, [demos, library, search]);

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

  const { demoname } = useParams();

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

  const firstRef = useRef(true);
  useEffect(() => {
    const hasDemoSelected = typeof demoname === "string" && demoname.length > 0;
    if (!hasDemoSelected) return;
    const li = ulRef.current?.querySelector(
      `[data-demo="${CSS.escape(demoname)}"]`,
    );
    if (li)
      li.scrollIntoView({
        inline: "center",
        block: "center",
        behavior: firstRef.current ? "instant" : "smooth",
      });
    firstRef.current = false;
  }, [demoname, filteredDemos]);

  return (
    <SidebarProvider
      open={open}
      onOpenChange={setOpen}
      /* The provider writes `--sidebar-width` inline, so the site's own
         responsive rail width has to arrive the same way — a class would lose
         to the inline style. `w-auto` undoes the provider's `w-full`, which
         assumes it wraps the page; here it only wraps the rail and its
         handle. */
      style={
        { "--sidebar-width": "var(--sidebar-w)", ...style } as CSSProperties
      }
      className={cn("relative w-auto shrink-0", className)}
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
            <InputGroup className="animate-in duration-200 fade-in slide-in-from-top-1">
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
                aria-controls="demo-list"
                aria-describedby="search-results"
                className="[&::-webkit-search-cancel-button]:hidden"
              />
              <InputGroupAddon>
                <SearchIcon />
              </InputGroupAddon>
              <InputGroupAddon align="inline-end">
                <InputGroupText className="text-xs tabular-nums">
                  {filteredDemos.length}
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
                  className="min-w-0 flex-1"
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
                <SelectContent position="popper">
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
              >
                <SearchIcon />
              </Button>
            </div>
          )}
          <span id="search-results" className="sr-only" aria-live="polite">
            {filteredDemos.length} examples
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
              ref={ulRef}
              /* One tab stop for the whole list, arrows to move inside it —
                 otherwise the ~160 cards sit between the filter row and
                 everything after the rail. */
              {...roving}
              id="demo-list"
              /* The block padding is not decoration: the selected card's ring
                 sits outside its border box, and the scroller would clip it on
                 the first and last item without it. The inline half of it moved
                 up to `SidebarContent`, so the header lines up with the list. */
              className="flex flex-col gap-3 py-2"
            >
              {filteredDemos.map(({ name, title, thumb, isNew, tags }) => (
                <li
                  key={thumb}
                  data-demo={name}
                  className="transition-transform active:scale-97"
                >
                  <Item
                    asChild
                    variant="outline"
                    className={cn(
                      "relative overflow-hidden bg-muted p-0",
                      /* `accent` is the same value as `muted` under the neutral
                         base colour, so the selected card reads through the
                         paired `accent-foreground` ring. */
                      demoname === name &&
                        "bg-accent ring-2 ring-accent-foreground",
                    )}
                  >
                    <Link
                      href={`/demos/${name}`}
                      aria-current={demoname === name ? "page" : undefined}
                      className="no-underline"
                    >
                      {/* Full-bleed: the media is the only thing in the box, so
                          the card ends up with the thumbnail's aspect ratio. */}
                      <ItemMedia
                        variant="image"
                        className="relative aspect-video size-auto w-full rounded-none"
                      >
                        {/* Thumbnails are served by each demo, not by this
                            site, so in dev every card but the running one
                            404s — and a built site can still meet a demo
                            whose thumbnail was never generated. A broken
                            `img` stops being a replaced element, which is
                            exactly when its pseudo-elements start rendering:
                            `after` covers the browser's glyph with the card's
                            own colour and puts the alt text back as text. On
                            an image that loads, nothing of this exists. */}
                        <Image
                          src={thumb}
                          fill
                          sizes="(min-width: 640px) 260px, 200px"
                          alt={title}
                          className="after:absolute after:inset-0 after:grid after:place-items-center after:bg-muted after:px-3 after:text-center after:text-xs after:text-muted-foreground after:content-[attr(alt)]"
                        />
                      </ItemMedia>
                      {isNew && (
                        <Badge
                          variant="secondary"
                          className="absolute top-1.5 right-1.5"
                        >
                          New
                        </Badge>
                      )}
                      {tags.length > 0 && (
                        <ItemFooter className="absolute inset-x-0 bottom-0">
                          {/* Same fade as the demo list, on the other axis.
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
              ))}
            </ul>
          </nav>

          {filteredDemos.length === 0 && (
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
