import React, { useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";

function SayCheese({ pauseAt = 0 }) {
  const { advance, setFrameloop, clock } = useThree();

  useEffect(() => {
    console.log(`😬 Say cheeese (shooting photo in ${pauseAt}ms)`);

    function shoot() {
      // const secs = clock.elapsedTime;
      const secs = 0;
      console.log("📸 Shooting", secs);

      setFrameloop("never");
      advance(secs);
      advance(secs); // not exactly sure why a 2nd-time, but needed 🤷‍♂️

      document.dispatchEvent(new Event("playwright:snapshot-ready")); // will tell Playright to take a screenshot
    }

    setTimeout(shoot, pauseAt);

    return () => {
      clearTimeout(shoot);
    };
  }, []);

  return null;
}

export default function CheesyCanvas({ children, gl, ...props }) {
  useEffect(() => {
    console.log(
      "CheesyCanvas: use ?saycheese in the URL to stop the animation",
    );
  }, []);

  const sayCheeseParam = new URLSearchParams(window.location.search).has(
    "saycheese",
  );

  //
  // Chromatic archives the frozen page by serialising the DOM, and a <canvas>
  // only survives that as whatever `toDataURL()` returns. WebGL clears its
  // drawing buffer right after compositing, so by the time the archive is
  // taken the read comes back blank -- unless the context was created with
  // `preserveDrawingBuffer`. Only under `?saycheese`: it costs an extra
  // buffer copy per frame, which no visitor should pay for.
  //
  // A `gl` callback builds its own renderer, so there is nothing to merge
  // into; those examples archive an empty canvas. None of the tested ones do.
  //
  const cheesyGl =
    sayCheeseParam && (typeof gl === "object" || gl === undefined)
      ? { ...gl, preserveDrawingBuffer: true }
      : gl;

  return (
    <Canvas {...props} gl={cheesyGl}>
      {sayCheeseParam && <SayCheese pauseAt={3000} />}

      {children}
    </Canvas>
  );
}
