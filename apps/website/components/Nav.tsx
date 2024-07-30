import Image from "next/image";
import Link from "next/link";

import { getDemos } from "@/lib/helper";

export const demos = getDemos();

export default function Nav({ current }: { current?: string }) {
  return (
    <nav className="fixed left-0 top-0">
      <ul className="flex flex-col gap-4 p-8  h-dvh overflow-auto">
        {demos.map(({ name, thumb }, i) => {
          return (
            <li key={thumb}>
              <Link
                href={`/demos/${name}`}
                className={"block bg-white"}
                style={{
                  outline: `2px solid ${name === current ? "black" : "transparent"}`,
                }}
              >
                <Image
                  src={thumb}
                  width={16}
                  height={9}
                  alt=""
                  className="object-cover aspect-video w-auto h-28"
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
