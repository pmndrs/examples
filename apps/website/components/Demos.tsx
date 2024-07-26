"use client";

import { createRef, ElementRef, useEffect, useRef, useState } from "react";
import Image from "next/image";

import type { Demo } from "../app/page";

export default function Demos({ demos }: { demos: Demo[] }) {
  // console.log("demos", demos);
  const liRefs = useRef(
    Array.from({ length: demos.length }).map(() =>
      createRef<ElementRef<"li">>()
    )
  );
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
    } else {
      setHash(demos[demoIndex].name); // not found hash => fallback to default demo
    }
  }, [demoIndex, demos, hash, setHash]);

  const scrolled = useRef(false);
  useEffect(() => {
    const $li = liRefs.current[demoIndex]?.current;
    // if (!$li || scrolled.current) return;

    $li?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    scrolled.current = true;
  }, [demoIndex]);

  return (
    <>
      <nav className="fixed right-0 top-0">
        <ul className="flex flex-col gap-4 p-8  h-dvh overflow-auto">
          {demos.map(({ name, thumb, url }, i) => {
            return (
              <li ref={liRefs.current[i]} key={thumb}>
                <a
                  href={url}
                  onClick={(e) => {
                    e.preventDefault();
                    setHash(name);
                  }}
                  className={"block bg-white"}
                  style={{
                    outline: `2px solid ${demoIndex === i ? "black" : "transparent"}`,
                  }}
                >
                  <Image
                    src={thumb}
                    alt=""
                    className="object-cover aspect-video h-28"
                  />
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
