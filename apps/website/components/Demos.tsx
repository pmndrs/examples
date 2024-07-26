"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import type { Demo } from "../app/page";

export default function Demos({ demos }: { demos: Demo[] }) {
  // console.log("demos", demos);
  const [hash, setHash] = useHash();

  const [demoIndex, setDemoIndex] = useState(0);

  useEffect(() => {
    if (!hash)
      return setHash(
        window.location.hash.substring(1) || demos[demoIndex].name
      );

    const currentIndex = demos.findIndex(({ name }) =>
      hash === `#${name}` ? true : false
    );
    if (currentIndex !== -1) {
      setDemoIndex(currentIndex);
    }
  }, [demoIndex, demos, hash, setHash]);

  return (
    <>
      <nav className="fixed right-0 top-0">
        <ul className="flex flex-col gap-4 m-8">
          {demos.map(({ name, thumb, url }, i) => {
            return (
              <li key={thumb}>
                <a
                  href={url}
                  onClick={(e) => {
                    e.preventDefault();
                    setHash(name);
                  }}
                  className={"block border-2"}
                  style={{
                    borderColor: i === demoIndex ? "black" : "transparent",
                  }}
                >
                  <Image src={thumb} alt="" className="object-cover h-32" />
                </a>
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
