import React, { useEffect } from "react";
import { flushSync } from "react-dom";
import { Canvas, useThree } from "@react-three/fiber";

//
// How much of the scene's life happens before the shot. 60 steps of 1/60 is
// one second: enough for damping to settle, for a spring to arrive, and for
// `<AccumulativeShadows>` to converge -- and the same second on every machine,
// which is the whole point.
//
const FRAMES = 60;
const STEP = 1 / 60;

//
// The shot normally starts when the harness sets `window.__cheeseShoot`, once
// it has watched the network go idle -- assets, not a stopwatch. This is the
// fallback for a human who opened `?saycheese` by hand with nobody to set it.
//
const UNATTENDED = 3000;

//
// Keeps the compositor producing frames while the render loop is held at
// `never`.
//
// Playwright will not capture a page until the browser hands it a fresh
// composited frame, and drawing into a WebGL canvas does not itself schedule
// one: with nothing else moving, Chrome simply stops committing. The first
// screenshot then waits for a frame that never comes -- measured at ~29s on
// `aquarium`, against ~80ms with this in place, and every screenshot after the
// first is instant either way, which is what makes it look like a mystery
// rather than a stall.
//
// One off-screen pixel on its own layer, moved every frame. It costs nothing,
// it cannot reach the canvas we screenshot, and it is the entire fix.
//
function SayCheese() {
  const advance = useThree((state) => state.advance);

  useEffect(() => {
    const pixel = document.createElement("div");
    pixel.style.cssText =
      "position:fixed;top:-10px;left:-10px;width:1px;height:1px;will-change:transform";
    document.body.appendChild(pixel);

    let frame = 0;
    let odd = 0;
    let raf;

    function tick() {
      pixel.style.transform = `translateX(${(odd ^= 1)}px)`; // keep the compositor honest, before, during and after the shot

      //
      // Every frame the scene will ever see, one per animation frame. Under
      // `frameloop="never"` r3f takes the delta from the timestamp we pass
      // rather than from the wall clock, so `useFrame` receives exactly `STEP`
      // each time and `clock.elapsedTime` lands on `FRAMES * STEP` -- how long
      // the browser really took between two of them changes nothing.
      //
      // One per animation frame rather than sixty in a row: a synchronous
      // burst holds the main thread for as long as the heaviest scene needs,
      // and Playwright is on the other end of that thread.
      //
      // `flushSync`, because a `useFrame` that calls `setState` would
      // otherwise have its commit scheduled rather than applied, and how many
      // of our frames elapse before it lands would be the scheduler's
      // business rather than ours. Nothing in this repo does that today; the
      // 158 examples still to be covered will.
      //
      if (window.__cheeseShoot === true && frame < FRAMES) {
        flushSync(() => advance(++frame * STEP));

        if (frame === FRAMES) {
          console.log(`📸 Shot ${FRAMES} frames`);
          window.__cheeseReady = true; // tells the harness to take its screenshot
        }
      }

      raf = requestAnimationFrame(tick);
    }

    console.log("😬 Say cheeese (waiting for the go-ahead)");
    tick();

    const unattended = setTimeout(() => {
      if (window.__cheeseShoot === undefined) window.__cheeseShoot = true;
    }, UNATTENDED);

    return () => {
      clearTimeout(unattended);
      cancelAnimationFrame(raf);
      pixel.remove();
    };
  }, [advance]);

  return null;
}

export default function CheesyCanvas({ children, gl, frameloop, ...props }) {
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
  // into; those examples archive an empty canvas.
  //
  const cheesyGl =
    sayCheeseParam && (typeof gl === "object" || gl === undefined)
      ? { ...gl, preserveDrawingBuffer: true }
      : gl;

  //
  // Held from the very first render, not switched off after a wait. That is
  // the difference between a deterministic shot and the previous one: letting
  // the loop run for three seconds and *then* freezing it captured whatever
  // number of frames the machine had managed, and every `useFrame` had
  // already integrated that many deltas of wall clock into the scene.
  //
  const cheesyFrameloop = sayCheeseParam ? "never" : frameloop;

  return (
    <Canvas {...props} gl={cheesyGl} frameloop={cheesyFrameloop}>
      {sayCheeseParam && <SayCheese />}

      {children}
    </Canvas>
  );
}
