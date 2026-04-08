"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ComponentProps,
  createRef,
  ElementRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useParams } from "next/navigation";
import clsx from "clsx";

import { getDemos } from "@/lib/helper";
import { Style } from "./Style";

const STORAGE_KEY = "nav-collapsed";

export default function Nav({
  demos,
  ...props
}: { demos: ReturnType<typeof getDemos> } & ComponentProps<"nav">) {
  const ulRef = useRef<ElementRef<"ul">>(null);
  const lisRef = useRef(
    Array.from({ length: demos.length }).map(() => createRef<HTMLLIElement>()),
  );

  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }, []);

  const { demoname } = useParams();

  const firstRef = useRef(true);
  useEffect(() => {
    const i = demos.findIndex(({ name }) => name === demoname);
    const li = lisRef.current[i]?.current;
    if (li)
      li.scrollIntoView({
        inline: "center",
        block: "center",
        behavior: firstRef.current ? "instant" : "smooth",
      });
    firstRef.current = false;
  }, [demoname, demos]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "[" && e.metaKey) toggle();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggle]);

  return (
    <div className="Nav" data-collapsed={collapsed || undefined}>
      <Style
        css={`
          @scope {
            :scope {
              position: relative;
              height: 100dvh;
              min-width: 0;
              overflow: visible;
              z-index: 2;
            }

            nav {
              height: 100%;
              overflow-y: auto;
              overscroll-behavior: contain;
              scrollbar-gutter: stable;
              opacity: 1;
              transform: translateX(0);
              transition:
                opacity 0.2s linear,
                transform 1078ms var(--motion-curve);
            }

            :scope[data-collapsed] nav {
              opacity: 0;
              pointer-events: none;
              transform: translateX(-1rem);
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
              backdrop-filter: blur(12px);

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
              translate: 15% -50%;
            }

            :scope[data-collapsed] .toggle::before {
              content: "";
              position: absolute;
              inset: -1rem;
              inset-inline-end: -3rem;
            }

            :scope[data-collapsed] .toggle:hover {
              translate: 65% -50%;
            }

            :scope[data-collapsed] .toggle svg {
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
              transition: outline-color 0.2s ease, box-shadow 0.2s ease;
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

            a img {
              object-fit: cover;
              width: 100%;
              height: 100%;
              display: block;
              color: inherit !important;
              font-size: 0.7rem;
              background: none;
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
          <svg viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M5 1L1 5L5 9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="toggleLabel">{collapsed ? "show" : "hide"}</span>
        </span>
      </button>

      <nav {...props}>
        <ul ref={ulRef}>
          {demos.map(({ name, thumb }, i) => (
            <li key={thumb} ref={lisRef.current[i]}>
              <Link
                href={`/demos/${name}`}
                className={clsx({ active: demoname === name })}
              >
                <div className="thumb">
                  <Image src={thumb} fill sizes="227px" alt={name} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
