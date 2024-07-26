"use client";

import { useEffect, useState } from "react";
import Image from "../components/Image";
import Link from "next/link";

const demos = [
  { thumb: "/aquarium/thumbnail.png", url: "/aquarium" },
  { thumb: "/baking-soft-shadows/thumbnail.png", url: "/baking-soft-shadows" },
  { thumb: "/basic-demo/thumbnail.png", url: "/basic-demo" },
];

export default function Home() {
  const [demoIndex, setDemoIndex] = useState(0);

  const [hash, setHash] = useHash();

  useEffect(() => {
    const currentIndex = demos.findIndex(({ url }) =>
      hash === `#${url}` ? true : false
    );
    if (currentIndex) {
      setDemoIndex(currentIndex);
    }
  }, [hash]);

  return (
    <>
      <nav className="fixed right-0 top-0">
        <ul className="flex flex-col gap-4 m-8">
          {demos.map(({ thumb, url }, i) => {
            return (
              <li key={thumb}>
                <Link
                  href={url}
                  onClick={(e) => {
                    e.preventDefault();
                    setHash(url);
                  }}
                  className={"block border-2"}
                  style={{
                    borderColor: i === demoIndex ? "black" : "transparent",
                  }}
                >
                  <Image
                    src={thumb}
                    alt=""
                    className="object-cover h-32"
                    onClick={(e) => setDemoIndex(i)}
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <iframe src={demos.at(demoIndex)?.url} className="w-full min-h-dvh" />
    </>
  );
}

function useHash() {
  const [hash, setHash] = useState("");

  useEffect(() => {
    setHash(window.location.hash);
  }, []);

  useEffect(() => {
    function handler() {
      setHash(window.location.hash);
    }

    window.addEventListener("hashchange", handler);
    return () => {
      window.removeEventListener("hashchange", handler);
    };
  }, []);

  function updateHash(newHash: string) {
    if (newHash !== hash) window.location.hash = newHash;
  }

  return [hash, updateHash] as const;
}
