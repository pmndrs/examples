import Image from "next/image";
import Link from "next/link";

import { getDemos } from "@/lib/helper";
import { ComponentProps } from "react";

export const demos = getDemos();

export default function Nav({
  current,
  ...props
}: ComponentProps<"nav"> & { current?: string }) {
  return (
    <>
      <style>{`
        @scope {
          nav {
            width:100%; overflow:auto; scroll-snap-type: x mandatory;
            position:fixed;
            bottom:0;

            @media (min-aspect-ratio:1/1) {
              display:inline-block;
              position:static;

              ul {display:inline-flex; flex-direction:column;}
            }
          }

          ul {
            padding-inline-start:unset;
            list-style:none;

            padding:2rem;
            display:flex; gap:1rem; position:relative;
            >* {flex:none;}
          }

          li {
            padding-inline-start:unset;
            scroll-snap-align: center;
          }

          a {display:block; background:white;}

          a img {
            object-fit:cover; aspect-ratio:16/9; width:auto; height:7rem;
          }
        }
      `}</style>
      <nav {...props}>
        <ul>
          {demos.map(({ name, thumb }, i) => {
            return (
              <li key={thumb}>
                <Link
                  href={`/demos/${name}`}
                  style={{
                    outline: `2px solid ${name === current ? "black" : "transparent"}`,
                  }}
                >
                  <Image src={thumb} width={16} height={9} alt="" />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
