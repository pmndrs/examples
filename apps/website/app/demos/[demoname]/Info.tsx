"use client";

import { useEffect, useRef, useState } from "react";
import { RxCross2, RxInfoCircled } from "react-icons/rx";

import { Style } from "@/components/Style";
import { getLibraryLabel } from "@/const/libraries";
import type { Demo } from "@/lib/helper";

function formatDate(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function Info({ demo }: { demo: Demo }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="Info">
      <Style
        css={`
          @scope {
            :scope {
              position: relative;
            }

            .trigger {
              position: relative;
              display: grid;
              place-items: center;
              width: 2.4rem;
              height: 2.4rem;
              padding: 0;
              border: none;
              border-radius: 999px;
              background: rgb(255 255 255 / 0.82);
              backdrop-filter: blur(10px);
              box-shadow: 0 1px 6px rgb(0 0 0 / 0.1);
              color: #555;
              cursor: pointer;
              transition:
                background 0.15s ease,
                color 0.15s ease;
            }

            .trigger:hover {
              color: #111;
            }

            .trigger[aria-expanded="true"] {
              background: #222;
              color: white;
            }

            .trigger svg {
              width: 1.05rem;
              height: 1.05rem;
            }

            .trigger > span {
              position: absolute;
              top: 100%;
              left: 50%;
              translate: -50% 0;
              margin-top: 0.45rem;
              padding: 0.25em 0.5em;
              border-radius: 4px;
              background: #222;
              color: white;
              font-size: 0.65rem;
              white-space: nowrap;
              pointer-events: none;
              opacity: 0;
              transition: opacity 0.15s ease;
            }

            .trigger:hover > span {
              opacity: 1;
            }

            .trigger[aria-expanded="true"] > span {
              opacity: 0;
            }

            .panel {
              position: absolute;
              top: calc(100% + 0.6rem);
              right: 0;
              width: min(24rem, calc(100vw - 1.5rem));
              max-height: min(70dvh, 34rem);
              overflow-y: auto;
              overscroll-behavior: contain;
              padding: 1.1rem 1.2rem 1.2rem;
              border: 1px solid #d4d4d4;
              border-radius: 12px;
              background: rgb(255 255 255 / 0.92);
              backdrop-filter: blur(10px);
              box-shadow: 0 10px 30px rgb(0 0 0 / 0.12);
              animation: info-in 0.2s ease both;
            }

            @keyframes info-in {
              from {
                opacity: 0;
                translate: 0 -0.35rem;
              }
              to {
                opacity: 1;
                translate: 0 0;
              }
            }

            header {
              display: flex;
              align-items: baseline;
              justify-content: space-between;
              gap: 0.75rem;
            }

            h2 {
              margin: 0;
              font-size: 1rem;
              font-weight: 700;
              color: #111;
            }

            .close {
              flex-shrink: 0;
              display: grid;
              place-items: center;
              width: 1.6rem;
              height: 1.6rem;
              padding: 0;
              border: none;
              border-radius: 50%;
              background: none;
              color: #555;
              cursor: pointer;
              transition:
                background 0.15s ease,
                color 0.15s ease;
            }

            .close:hover {
              background: rgb(0 0 0 / 0.06);
              color: #111;
            }

            .close svg {
              width: 0.85rem;
              height: 0.85rem;
            }

            .description {
              margin: 0.5rem 0 0;
              font-size: 0.8rem;
              line-height: 1.5;
              color: #333;
            }

            section {
              margin-top: 0.9rem;
            }

            h3 {
              margin: 0 0 0.4rem;
              color: #555;
              font-size: 0.65rem;
              font-weight: 700;
              letter-spacing: 0.06em;
              text-transform: uppercase;
            }

            .pills {
              display: flex;
              flex-wrap: wrap;
              gap: 0.3rem;
              margin: 0;
              padding: 0;
              list-style: none;
            }

            .pills li {
              padding: 2px 8px;
              border-radius: 999px;
              background: rgb(0 0 0 / 0.06);
              color: #333;
              font-size: 0.65rem;
              line-height: 1.5;
            }

            .text {
              margin: 0;
              font-size: 0.8rem;
              line-height: 1.5;
              color: #333;
            }

            .assets {
              display: grid;
              gap: 0.6rem;
              margin: 0;
              padding: 0;
              list-style: none;
            }

            .assets li {
              font-size: 0.75rem;
              line-height: 1.45;
              color: #333;
            }

            .assets .meta {
              color: #666;
            }

            .assets .notes {
              display: block;
              color: #666;
              font-size: 0.7rem;
            }
          }
        `}
      />

      <button
        className="trigger"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls="demo-info-panel"
        aria-label={open ? "Hide demo info" : "Show demo info"}
      >
        <RxInfoCircled />
        <span>info</span>
      </button>

      {open && (
        <div id="demo-info-panel" className="panel" role="region">
          <header>
            <h2>{demo.title}</h2>
            <button
              className="close"
              onClick={() => setOpen(false)}
              aria-label="Dismiss demo info"
            >
              <RxCross2 />
            </button>
          </header>

          {demo.description && <p className="description">{demo.description}</p>}

          {demo.tags.length > 0 && (
            <section>
              <h3>Tags</h3>
              <ul className="pills">
                {demo.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            </section>
          )}

          {demo.libraries.length > 0 && (
            <section>
              <h3>Libraries</h3>
              <ul className="pills">
                {demo.libraries.map((library) => (
                  <li key={library}>{getLibraryLabel(library)}</li>
                ))}
              </ul>
            </section>
          )}

          {demo.authors.length > 0 && (
            <section>
              <h3>{demo.authors.length > 1 ? "Authors" : "Author"}</h3>
              <p className="text">{demo.authors.join(", ")}</p>
            </section>
          )}

          {demo.publishedAt && (
            <section>
              <h3>Published</h3>
              <p className="text">{formatDate(demo.publishedAt)}</p>
            </section>
          )}

          {demo.source && (
            <section>
              <h3>Source</h3>
              <p className="text">
                <a target="_blank" rel="noopener noreferrer" href={demo.source}>
                  Original demo
                </a>
              </p>
            </section>
          )}

          {demo.assets.length > 0 && (
            <section>
              <h3>Assets</h3>
              <ul className="assets">
                {demo.assets.map((asset) => (
                  <li key={asset.name}>
                    {asset.source ? (
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href={asset.source}
                      >
                        {asset.name}
                      </a>
                    ) : (
                      asset.name
                    )}
                    {asset.creator && (
                      <span className="meta"> by {asset.creator}</span>
                    )}
                    {asset.license && (
                      <span className="meta">
                        {" — "}
                        {asset.licenseUrl ? (
                          <a
                            target="_blank"
                            rel="noopener noreferrer"
                            href={asset.licenseUrl}
                          >
                            {asset.license}
                          </a>
                        ) : (
                          asset.license
                        )}
                      </span>
                    )}
                    {asset.modified && <span className="meta"> (modified)</span>}
                    {asset.notes && <span className="notes">{asset.notes}</span>}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
