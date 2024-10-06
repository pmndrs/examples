"use client";

import { Style } from "@/components/Style";
import { useEffect, useState } from "react";
import { GoCommandPalette } from "react-icons/go";
import { RxOpenInNewWindow } from "react-icons/rx";
import { SiCodesandbox, SiGithub, SiStackblitz } from "react-icons/si";

export function Social({
  demoname,
  embed_url,
}: {
  demoname: string;
  embed_url: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    await navigator.clipboard.writeText(
      `cd $(mktemp -d ${demoname}.XXX) && npx -y degit pmndrs/examples/demos/${demoname} . && npm i && npm run dev`
    );
    setCopied(true);
  };

  useEffect(() => {
    if (!copied) return;
    const int = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(int);
  }, [copied]);

  return (
    <nav className="Social">
      <Style
        css={`
          @scope {
            & {
              display: flex;
              flex-direction: column;
              justify-content: center;
              gap: 0.5em;
              @media (min-aspect-ratio: 1/1) {
                gap: 0.75em;
              }

              color: #333;
            }

            a svg {
              width: 1.25em;
              @media (min-aspect-ratio: 1/1) {
                width: 1.5em;
              }
              aspect-ratio: 1;
            }

            a {
              position: relative;
              > span {
                position: absolute;
                right: 100%;
                margin-inline-end: 0.75em;
                top: 50%;
                transform: translateY(-50%);
                white-space: nowrap;
                font-size: 80%;
              }

              > span {
                opacity: 0;
                transform: translate(-0.5em, -50%);
                transition-property: opacity transform;
                transition-duration: 0.2s;
              }
              @media (hover: hover) {
                &:hover > span {
                  opacity: 1;
                  transform: translate(0rem, -50%);
                }
              }
            }
          }
        `}
      />

      <a target="_blank" rel="noopener noreferrer" href={embed_url}>
        <RxOpenInNewWindow />

        <span>fullpage</span>
      </a>
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={`https://github.com/pmndrs/examples/tree/main/demos/${demoname}`}
      >
        <SiGithub />
        <span>code</span>
      </a>
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={`https://stackblitz.com/github/pmndrs/examples/tree/main/demos/${demoname}`}
      >
        <SiStackblitz />
        <span>stackblitz</span>
      </a>
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={`https://codesandbox.io/s/github/pmndrs/examples/tree/main/demos/${demoname}`}
      >
        <SiCodesandbox />
        <span>codesandbox</span>
      </a>
      <a href="javascript:void(0);" onClick={handleClick}>
        <GoCommandPalette />
        <span>{copied ? "copied command!" : "degit"}</span>
      </a>
    </nav>
  );
}
