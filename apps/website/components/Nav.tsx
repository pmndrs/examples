"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ComponentProps,
  ElementRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useParams } from "next/navigation";
import { ListFilterIcon, SearchIcon, XIcon } from "lucide-react";

import { getLibraryLabel, getLibraryPopularity } from "@/const/libraries";
import type { Demo } from "@/lib/helper";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Style } from "./Style";

const STORAGE_KEY = "nav-collapsed";
const MAX_TAGS = 4;
/* `library` is "" for no filter, but Radix rejects an empty SelectItem value —
   it reserves it for clearing the selection. The sentinel is what the option
   carries; the state stays "". */
const ALL_LIBRARIES = "__all__";

function getPreferredCollapsed() {
  const nav = new URLSearchParams(window.location.search).get("nav");
  if (nav === "closed") return true;
  if (nav === "open") return false;

  return localStorage.getItem(STORAGE_KEY) === "1";
}

function syncCollapsedAttr(collapsed: boolean) {
  document.documentElement.toggleAttribute("data-nav-collapsed", collapsed);
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

export default function Nav({
  demos,
  ...props
}: { demos: Demo[] } & ComponentProps<"nav">) {
  const ulRef = useRef<ElementRef<"ul">>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const [collapsed, setCollapsed] = useState(false);
  const [ready, setReady] = useState(false);
  const [library, setLibrary] = useState("");
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const searchVisible = searchOpen || search !== "";

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
      if (collapsed) {
        setCollapsed(false);
        localStorage.setItem(STORAGE_KEY, "0");
      }

      setSearchOpen(true);

      requestAnimationFrame(() => {
        searchRef.current?.focus();
        if (select) searchRef.current?.select();
      });
    },
    [collapsed],
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

  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }, []);

  const { demoname } = useParams();

  useEffect(() => {
    const next = document.documentElement.hasAttribute("data-nav-collapsed");
    setCollapsed(next);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    syncCollapsedAttr(collapsed);
  }, [collapsed, ready]);

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

  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!collapsed) {
      navRef.current?.removeAttribute("data-near");
      return;
    }
    const onMove = (e: MouseEvent) => {
      if (e.clientX < 120) navRef.current?.setAttribute("data-near", "");
      else navRef.current?.removeAttribute("data-near");
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [collapsed]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "[" && e.metaKey) toggle();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggle]);

  return (
    <div ref={navRef} className="Nav" data-collapsed={collapsed || undefined}>
      <Style
        css={`
          @scope {
            :scope {
              position: relative;
              width: var(--sidebar-w);
              flex-shrink: 0;
              height: 100dvh;
              overflow: visible;
              z-index: 2;
              margin-inline-start: 0;
              transition: margin-inline-start 1078ms var(--motion-curve);
              will-change: margin-inline-start;
            }

            :scope[data-collapsed] {
              margin-inline-start: calc(-1 * var(--sidebar-w));
            }

            html[data-nav-collapsed] .Nav {
              margin-inline-start: calc(-1 * var(--sidebar-w));
            }

            nav {
              height: 100%;
              overflow-y: auto;
              overscroll-behavior: contain;
              scrollbar-gutter: stable;
              opacity: 1;
              transition: opacity 0.15s linear;
            }

            :scope[data-collapsed] nav {
              opacity: 0;
              pointer-events: none;
            }

            html[data-nav-collapsed] .Nav nav {
              opacity: 0;
              pointer-events: none;
            }

            .filters {
              position: sticky;
              top: 0;
              z-index: 2;
              padding: 0.65rem 0.75rem 0.35rem 1rem;
              /* This is the page background, fading out under the scrolling
                 list — it has to follow --background. */
              background: linear-gradient(var(--background) 75%, transparent);
            }

            .filterRow {
              display: flex;
              align-items: center;
              gap: 0.4rem;
            }

            .filterRow[data-covered] {
              visibility: hidden;
            }

            @keyframes search-in {
              from {
                opacity: 0;
                translate: 0 -0.35rem;
              }
            }

            /* The search field is a shadcn <InputGroup>; all this block may
               hold is the geometry that lifts it over the filter row, plus the
               width: auto that keeps the component's own w-full from fighting
               the left/right insets. Anything else here is unlayered and would
               outrank the component's utilities. */
            .search {
              position: absolute;
              inset: 0.65rem 0.75rem auto 1rem;
              z-index: 3;
              width: auto;
              animation: search-in 200ms ease;
            }

            .empty {
              display: grid;
              justify-items: center;
              gap: 0.6rem;
              padding: 1.5rem 1rem;
              color: #666;
              font-size: 0.72rem;
              text-align: center;
            }

            .empty p {
              margin: 0;
            }

            .empty button {
              padding: 0.35rem 0.7rem;
              border: 1px solid #d4d4d4;
              border-radius: 999px;
              background: white;
              color: #444;
              cursor: pointer;
              font: inherit;
              font-weight: 600;
            }

            .empty button:hover {
              background: #f7f7f7;
              color: #111;
            }

            .srOnly {
              position: absolute;
              width: 1px;
              height: 1px;
              padding: 0;
              margin: -1px;
              overflow: hidden;
              clip: rect(0, 0, 0, 0);
              white-space: nowrap;
              border: 0;
            }

            .toggle {
              position: absolute;
              top: 50%;
              right: 0;
              translate: 50% -50%;
              z-index: 10;

              width: 2.75rem;
              height: 5.5rem;
              border-radius: 999px;
              background: rgb(255 255 255 / 0.92);
              border: 1px solid #d4d4d4;
              cursor: pointer;
              display: grid;
              place-items: center;
              color: #666;
              transition:
                background 0.15s ease,
                color 0.15s ease,
                box-shadow 0.15s ease,
                translate 0.25s ease;
              box-shadow: 0 10px 30px rgb(0 0 0 / 0.12);

              &:hover {
                background: #f5f5f5;
                color: #222;
                box-shadow: 0 14px 36px rgb(0 0 0 / 0.16);
              }
            }

            .toggleInner {
              display: grid;
              gap: 0.35rem;
              justify-items: center;
            }

            .toggleLabel {
              font-size: 0.6rem;
              line-height: 1;
              letter-spacing: 0.08em;
              text-transform: uppercase;
              writing-mode: vertical-rl;
              text-orientation: mixed;
            }

            .toggle svg {
              width: 0.7rem;
              height: 0.7rem;
              transform: rotate(0deg);
              transition: transform 1078ms var(--motion-curve);
            }

            :scope[data-collapsed] .toggle {
              translate: 25% -50%;
            }

            html[data-nav-collapsed] .Nav .toggle {
              translate: 25% -50%;
            }

            :scope[data-collapsed][data-near] .toggle {
              translate: 75% -50%;
            }

            html[data-nav-collapsed] .Nav[data-near] .toggle {
              translate: 75% -50%;
            }

            :scope[data-collapsed] .toggle svg {
              transform: rotate(180deg);
            }

            html[data-nav-collapsed] .Nav .toggle svg {
              transform: rotate(180deg);
            }

            ul {
              padding-inline-start: unset;
              list-style: none;
              padding: 0.4rem 0.75rem 1rem 1rem;
              display: flex;
              flex-direction: column;
              gap: 0.75rem;
              margin: 0;
            }

            li {
              padding-inline-start: unset;
              transform: scale(1);
              transition: transform 1078ms var(--motion-curve);
            }

            li:active {
              transform: scale(0.97);
            }

            /* The demo cards are shadcn <Item>/<Badge>; they style themselves
               with Tailwind. Nothing scoped here may target them — this block
               is unlayered and would outrank every utility. */
          }
        `}
      />

      <button
        className="toggle"
        onClick={toggle}
        aria-label={collapsed ? "Show demos" : "Hide demos"}
        aria-pressed={!collapsed}
      >
        <span className="toggleInner">
          <svg
            viewBox="0 0 6 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 1L1 5L5 9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="toggleLabel">
            {ready ? (collapsed ? "show" : "hide") : ""}
          </span>
        </span>
      </button>

      <nav {...props}>
        <div className="filters">
          {searchVisible && (
            /* Opaque: this floats over the filter row, and the sticky
               `.filters` gradient behind it goes transparent at the bottom. */
            <InputGroup className="search bg-background">
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
          )}
          <div className="filterRow" data-covered={searchVisible || undefined}>
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
              <SelectContent>
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
          <span id="search-results" className="srOnly" aria-live="polite">
            {filteredDemos.length} examples
          </span>
        </div>
        <ul ref={ulRef} id="demo-list">
          {filteredDemos.map(({ name, title, thumb, isNew, tags }) => (
            <li key={thumb} data-demo={name}>
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
                  {/* Full-bleed: the media is the only thing in the box, so the
                      card ends up with the thumbnail's aspect ratio. */}
                  <ItemMedia
                    variant="image"
                    className="relative aspect-video size-auto w-full rounded-none"
                  >
                    <Image
                      src={thumb}
                      fill
                      sizes="(min-width: 640px) 260px, 200px"
                      alt={title}
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
                      <ScrollArea className="w-full">
                        {/* Padding sits inside the viewport so the scrollable
                            strip itself runs edge to edge. */}
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
        {filteredDemos.length === 0 && (
          <div className="empty">
            <p>No matching examples.</p>
            <button
              type="button"
              onClick={() => {
                dismissSearch();
                setLibrary("");
              }}
            >
              Clear filters
            </button>
          </div>
        )}
      </nav>
    </div>
  );
}
