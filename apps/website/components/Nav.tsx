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
import clsx from "clsx";

import { getLibraryLabel, getLibraryPopularity } from "@/const/libraries";
import type { Demo } from "@/lib/helper";
import { Style } from "./Style";

const STORAGE_KEY = "nav-collapsed";
const MAX_TAGS = 4;

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
  }, [dismissSearch, focusSearch, search, searchVisible]);

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
              background: linear-gradient(#eee 75%, rgb(238 238 238 / 0));
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

            .search,
            .filter {
              position: relative;
              display: flex;
              align-items: center;
              width: 100%;
              min-width: 0;
              border: 1px solid #d4d4d4;
              border-radius: 999px;
              background: rgb(255 255 255 / 0.92);
              box-shadow: 0 1px 6px rgb(0 0 0 / 0.1);
              color: #555;
              transition:
                border-color 0.15s ease,
                box-shadow 0.15s ease;
            }

            .search:focus-within,
            .filter:focus-within {
              border-color: #888;
              box-shadow:
                0 1px 6px rgb(0 0 0 / 0.1),
                0 0 0 2px rgb(0 0 0 / 0.08);
            }

            .search {
              position: absolute;
              inset: 0.65rem 0.75rem auto 1rem;
              z-index: 3;
              width: auto;
              border-radius: 8px;
              background: white;
              box-shadow: 0 8px 24px rgb(0 0 0 / 0.18);
              animation: search-in 200ms ease;
            }

            .filter {
              flex: 1;
              width: auto;
            }

            .searchIcon,
            .filterIcon,
            .filterChevron {
              position: absolute;
              pointer-events: none;
            }

            .searchIcon,
            .filterIcon {
              left: 0.7rem;
              width: 0.75rem;
              height: 0.75rem;
            }

            .filterChevron {
              right: 0.7rem;
              width: 0.6rem;
              height: 0.6rem;
            }

            .search input,
            .filter select {
              width: 100%;
              min-width: 0;
              height: 2.15rem;
              padding: 0 1.75rem 0 1.8rem;
              border: 0;
              outline: 0;
              appearance: none;
              background: transparent;
              color: #333;
              cursor: pointer;
              font: inherit;
              font-size: 0.7rem;
              font-weight: 600;
              text-overflow: ellipsis;
            }

            .search input {
              padding-right: 4.2rem;
              cursor: text;
            }

            .search input::placeholder {
              color: #777;
              font-weight: 500;
              opacity: 1;
            }

            .search input::-webkit-search-cancel-button {
              display: none;
            }

            .searchCount {
              position: absolute;
              right: 2rem;
              color: #777;
              font-size: 0.52rem;
              font-weight: 600;
              line-height: 1;
              pointer-events: none;
            }

            .searchClose,
            .searchTrigger {
              display: grid;
              place-items: center;
              padding: 0;
              border: 1px solid #d4d4d4;
              background: rgb(255 255 255 / 0.92);
              color: #666;
              cursor: pointer;
              transition:
                background 0.15s ease,
                color 0.15s ease,
                box-shadow 0.15s ease;
            }

            .searchTrigger {
              flex: 0 0 2.15rem;
              width: 2.15rem;
              height: 2.15rem;
              border-radius: 50%;
              box-shadow: 0 1px 6px rgb(0 0 0 / 0.1);
            }

            .searchClose {
              position: absolute;
              right: 0.42rem;
              width: 1.3rem;
              height: 1.3rem;
              border: 0;
              border-radius: 50%;
              background: rgb(0 0 0 / 0.06);
            }

            .searchClose:hover,
            .searchTrigger:hover {
              background: rgb(0 0 0 / 0.1);
              color: #222;
            }

            .searchClose:focus-visible,
            .searchTrigger:focus-visible {
              outline: 2px solid #888;
              outline-offset: 2px;
            }

            .searchClose svg {
              width: 0.55rem;
              height: 0.55rem;
            }

            .searchTrigger svg {
              width: 0.8rem;
              height: 0.8rem;
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

            a {
              display: block;
              background: white;
              border-radius: 6px;
              overflow: hidden;
              outline: 2px solid transparent;
              outline-offset: 2px;
              transition:
                outline-color 0.2s ease,
                box-shadow 0.2s ease;
            }

            a:hover {
              box-shadow: 0 2px 12px rgb(0 0 0 / 0.1);
            }

            a.active {
              outline-color: black;
            }

            .thumb {
              position: relative;
              aspect-ratio: 16/9;
              width: 100%;
              overflow: hidden;
            }

            .pill {
              position: absolute;
              top: 6px;
              right: 6px;
              padding: 2px 7px;
              font-size: 0.55rem;
              font-weight: 700;
              letter-spacing: 0.06em;
              text-transform: uppercase;
              line-height: 1.5;
              color: white;
              background: #e8756a;
              border-radius: 999px;
              z-index: 1;
            }

            a img {
              object-fit: cover;
              width: 100%;
              height: 100%;
              display: block;
              color: inherit !important;
              font-size: 0.7rem;
              background: none;
            }

            .tags {
              position: absolute;
              inset: auto 0 0 0;
              z-index: 1;
              display: flex;
              flex-wrap: nowrap;
              gap: 3px;
              padding: 5px;
              /* whatever runs past the right edge is simply clipped */
              overflow: hidden;
            }

            .tag {
              flex-shrink: 0;
              padding: 1px 6px;
              border-radius: 999px;
              background: #222;
              color: white;
              font-size: 0.5rem;
              line-height: 1.7;
              white-space: nowrap;
            }
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
            <div className="search">
              <svg
                className="searchIcon"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  cx="5.25"
                  cy="5.25"
                  r="3.25"
                  stroke="currentColor"
                  strokeWidth="1.25"
                />
                <path
                  d="m7.75 7.75 2.25 2.25"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                />
              </svg>
              <input
                ref={searchRef}
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onFocus={() => setSearchOpen(true)}
                placeholder="Search examples"
                aria-label="Search examples"
                aria-controls="demo-list"
                aria-describedby="search-results"
              />
              <span className="searchCount">{filteredDemos.length}</span>
              <button
                className="searchClose"
                type="button"
                onClick={dismissSearch}
                aria-label="Close search"
              >
                <svg viewBox="0 0 8 8" fill="none" aria-hidden="true">
                  <path
                    d="m1 1 6 6M7 1 1 7"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          )}
          <div className="filterRow" data-covered={searchVisible || undefined}>
            <label className="filter">
              <span className="srOnly">Filter examples by library</span>
              <svg
                className="filterIcon"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M2 3h8M3.5 6h5M5 9h2"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                />
              </svg>
              <select
                value={library}
                onChange={(event) => setLibrary(event.target.value)}
              >
                <option value="">All libraries</option>
                {libraryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <svg
                className="filterChevron"
                viewBox="0 0 10 6"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="m1 1 4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </label>
            <button
              className="searchTrigger"
              type="button"
              onClick={() => focusSearch()}
              aria-label="Search examples"
              aria-keyshortcuts="Meta+F Control+F Meta+K Control+K"
              title="Search examples (⌘F)"
            >
              <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <circle
                  cx="5.25"
                  cy="5.25"
                  r="3.25"
                  stroke="currentColor"
                  strokeWidth="1.25"
                />
                <path
                  d="m7.75 7.75 2.25 2.25"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
          <span id="search-results" className="srOnly" aria-live="polite">
            {filteredDemos.length} examples
          </span>
        </div>
        <ul ref={ulRef} id="demo-list">
          {filteredDemos.map(({ name, title, thumb, isNew, tags }) => (
            <li key={thumb} data-demo={name}>
              <Link
                href={`/demos/${name}`}
                className={clsx({ active: demoname === name })}
              >
                <div className="thumb">
                  {isNew && <span className="pill">New</span>}
                  <Image src={thumb} fill sizes="227px" alt={title} />
                  {tags.length > 0 && (
                    <div className="tags">
                      {tags.slice(0, MAX_TAGS).map((tag) => (
                        <span key={tag} className="tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
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
