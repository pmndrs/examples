"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ComponentProps,
  createRef,
  ElementRef,
  useEffect,
  useRef,
} from "react";
import { useParams } from "next/navigation";
import clsx from "clsx";

import { getDemos } from "@/lib/helper";
import { Style } from "./Style";

export default function Nav({
  demos,
  ...props
}: { demos: ReturnType<typeof getDemos> } & ComponentProps<"nav">) {
  const ulRef = useRef<ElementRef<"ul">>(null);
  const lisRef = useRef(
    Array.from({ length: demos.length }).map(() => createRef<HTMLLIElement>())
  );

  const { demoname } = useParams();

  // const firstRef = useRef(true);
  useEffect(() => {
    const i = demos.findIndex(({ name }) => name === demoname);
    const li = lisRef.current[i]?.current;

    // const behavior = firstRef.current ? "instant" : "smooth";
    // console.log("behavior", behavior);
    if (li)
      li.scrollIntoView({
        inline: "center",
        block: "center",
        behavior: "smooth",
      });
    // firstRef.current = false;
  }, [demoname, demos]);

  return (
    <div className="Nav">
      <Style
        css={`
          @scope {
            nav {
              @media (min-aspect-ratio: 1/1) {
                ul {
                  display: inline-flex;
                  flex-direction: column;
                }
              }
            }

            ul {
              padding-inline-start: unset;
              list-style: none;

              padding: 2rem;
              display: flex;
              gap: 1rem;
              position: relative;
              > li {
                flex: none;
              }
            }

            li {
              padding-inline-start: unset;
            }

            a {
              display: block;
              background: white;
            }

            a.active {
              outline: 1px solid black;
            }

            a img {
              object-fit: cover;
              aspect-ratio: 16/9;
              width: auto;
              height: 7rem;
              color: inherit !important;
              font-size: 0.8rem;
              background: none;
            }
            a img:after {
              content: "";
            }
          }
        `}
      />

      <nav {...props}>
        <ul ref={ulRef}>
          {demos.map(({ name, thumb }, i) => {
            return (
              <li key={thumb} ref={lisRef.current[i]}>
                <Link
                  href={`/demos/${name}`}
                  className={clsx({ active: demoname === name })}
                >
                  <Image src={thumb} width={16} height={9} alt={name} />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
