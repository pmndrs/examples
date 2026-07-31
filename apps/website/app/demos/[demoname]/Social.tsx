"use client";

import { Style } from "@/components/Style";
import { Toast } from "@/components/Toast";
import { ReactNode, useEffect, useRef, useState } from "react";
import { GoCommandPalette } from "react-icons/go";
import { RxChevronDown, RxOpenInNewWindow } from "react-icons/rx";
import { SiCodesandbox, SiGithub, SiStackblitz } from "react-icons/si";

export function Social({
  demoname,
  embed_url,
}: {
  demoname: string;
  embed_url: string;
}) {
  const [show, setShow] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const command = `npx -y degit pmndrs/examples/demos/${demoname} ${demoname} && cd ${demoname} && npm i && npm run dev`;

  const handleClick = async () => {
    await navigator.clipboard.writeText(command);
    setShow(true);
  };

  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;

    const onToggle = (event: ToggleEvent) => {
      setMoreOpen(event.newState === "open");
    };

    menu.addEventListener("toggle", onToggle);
    return () => menu.removeEventListener("toggle", onToggle);
  }, []);

  const actions: { label: string; icon: ReactNode; href?: string }[] = [
    { label: "fullpage", icon: <RxOpenInNewWindow />, href: embed_url },
    {
      label: "code",
      icon: <SiGithub />,
      href: `https://github.com/pmndrs/examples/tree/main/demos/${demoname}`,
    },
    {
      label: "stackblitz",
      icon: <SiStackblitz />,
      href: `https://stackblitz.com/github/pmndrs/examples/tree/main/demos/${demoname}`,
    },
    {
      label: "codesandbox",
      icon: <SiCodesandbox />,
      href: `https://codesandbox.io/s/github/pmndrs/examples/tree/main/demos/${demoname}`,
    },
    { label: "degit", icon: <GoCommandPalette /> },
  ];

  return (
    <>
      <nav className="Social">
        <Style
          css={`
            @scope {
              & {
                display: flex;
                gap: 0.1rem;
                padding: 0.3rem;
                border-radius: 999px;
                background: rgb(255 255 255 / 0.82);
                backdrop-filter: blur(10px);
                box-shadow: 0 1px 6px rgb(0 0 0 / 0.1);
              }

              :scope > a,
              .more {
                position: relative;
                display: grid;
                place-items: center;
                width: 1.8rem;
                height: 1.8rem;
                border-radius: 50%;
                color: #555;
                transition:
                  background 0.15s ease,
                  color 0.15s ease;
              }

              .more {
                display: none;
                padding: 0;
                border: 0;
                background: none;
                cursor: pointer;
              }

              :scope > a:hover,
              .more:hover,
              .more[aria-expanded="true"] {
                background: rgb(0 0 0 / 0.06);
                color: #111;
              }

              :scope > a svg,
              .more svg {
                width: 0.95rem;
                height: 0.95rem;
              }

              .more svg {
                transition: rotate 0.2s ease;
              }

              .more[aria-expanded="true"] svg {
                rotate: 180deg;
              }

              :scope > a > span {
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

              :scope > a:hover > span {
                opacity: 1;
              }

              .menu {
                position: fixed;
                inset: 3.75rem max(0.75rem, env(safe-area-inset-right)) auto
                  auto;
                margin: 0;
                padding: 0.4rem;
                border: 1px solid #d4d4d4;
                border-radius: 12px;
                background: rgb(255 255 255 / 0.92);
                backdrop-filter: blur(10px);
                box-shadow: 0 10px 30px rgb(0 0 0 / 0.12);
                animation: social-menu-in 0.2s ease both;
              }

              .menu:popover-open {
                display: grid;
                gap: 0.1rem;
              }

              @keyframes social-menu-in {
                from {
                  opacity: 0;
                  translate: 0 -0.35rem;
                }
                to {
                  opacity: 1;
                  translate: 0 0;
                }
              }

              .item {
                display: flex;
                align-items: center;
                gap: 0.6rem;
                padding: 0.5rem 1rem 0.5rem 0.7rem;
                border: 0;
                border-radius: 8px;
                background: none;
                color: #333;
                cursor: pointer;
                font: inherit;
                font-size: 0.75rem;
                font-weight: 600;
                text-align: left;
                transition:
                  background 0.15s ease,
                  color 0.15s ease;
              }

              .item:hover {
                background: rgb(0 0 0 / 0.06);
                color: #111;
              }

              .item svg {
                width: 0.95rem;
                height: 0.95rem;
                flex-shrink: 0;
                color: #555;
              }

              @media (max-width: 40rem) {
                :scope > a {
                  display: none;
                }

                .more {
                  display: grid;
                }
              }

              @media (prefers-reduced-motion: reduce) {
                .menu {
                  animation: none;
                }
              }
            }
          `}
        />

        {actions.map(({ label, icon, href }) =>
          href ? (
            <a key={label} target="_blank" rel="noopener noreferrer" href={href}>
              {icon}
              <span>{label}</span>
            </a>
          ) : (
            <a key={label} href="javascript:void(0);" onClick={handleClick}>
              {icon}
              <span>{label}</span>
            </a>
          ),
        )}

        <button
          popoverTarget="social-more-menu"
          popoverTargetAction="toggle"
          className="more"
          aria-expanded={moreOpen}
          aria-controls="social-more-menu"
          aria-label={moreOpen ? "Hide demo links" : "Show demo links"}
        >
          <RxChevronDown />
        </button>

        <div
          popover="auto"
          ref={menuRef}
          id="social-more-menu"
          className="menu"
        >
          {actions.map(({ label, icon, href }) =>
            href ? (
              <a
                key={label}
                className="item"
                target="_blank"
                rel="noopener noreferrer"
                href={href}
                onClick={() => menuRef.current?.hidePopover()}
              >
                {icon}
                {label}
              </a>
            ) : (
              <button
                key={label}
                className="item"
                type="button"
                onClick={() => {
                  menuRef.current?.hidePopover();
                  handleClick();
                }}
              >
                {icon}
                {label}
              </button>
            ),
          )}
        </div>
      </nav>

      <Toast visible={show} onDone={() => setShow(false)}>
        <p>
          Degit command copied. Paste in your terminal to install{" "}
          <strong>{demoname}</strong> locally.
        </p>
      </Toast>
    </>
  );
}
