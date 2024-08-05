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
          nav {display:inline-block;}

          ul {
            padding-inline-start:unset;
            list-style:none;

            padding:2rem;
            display:flex; flex-direction:column; gap:1rem; position:relative;
          }

          a {display:block; background:white;}

          a img {
            object-fit:cover; aspect:16/9; width:auto; height:7rem;
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
