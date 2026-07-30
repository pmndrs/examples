"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ComponentProps,
  ElementRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useParams } from "next/navigation";
import clsx from "clsx";

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

export default function Nav({
  demos,
  ...props
}: { demos: Demo[] } & ComponentProps<"nav">) {
  const ulRef = useRef<ElementRef<"ul">>(null);

  const [collapsed, setCollapsed] = useState(false);
  const [ready, setReady] = useState(false);

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
  }, [demoname, demos]);

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
              padding: 1rem 0.75rem 1rem 1rem;
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
        <ul ref={ulRef}>
          {demos.map(({ name, title, thumb, isNew, tags }) => (
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
      </nav>
    </div>
  );
}
