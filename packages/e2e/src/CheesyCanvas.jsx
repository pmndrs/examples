import React, { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { Canvas, useThree } from "@react-three/fiber";

//
// How much of the scene's life happens before the shot: half a second, the
// same half second on every machine, which is the whole point.
//
// Determinism only asks that the count be fixed, so one frame would do -- but
// the count does two other jobs that one frame cannot.
//
// It has to leave a picture worth comparing. At one frame `aquarium` has a
// black band where its transmission buffers have not been filled yet, and
// `baking-soft-shadows` -- an example whose entire subject is its shadows --
// has none at all. Ten is enough for both.
//
// And it has to *contract* whatever nondeterminism is left. Damping and
// springs converge on their target, so any residual difference between two
// runs shrinks with every frame: `backdrop-and-cables` is reproducible at
// twenty and at sixty, and not at ten. Thirty is that threshold with room
// either side, which matters more than the seconds do -- one example crying
// wolf is enough to make nobody read the report.
//
// The seconds, for the record. This browser has no GPU (SwiftShader, shaders
// compiled through LLVM) and the bill is overwhelmingly shader compilation
// rather than rasterisation -- on `aquarium`, ~16s of it, all paid between
// the first frame and the fourth:
//
//   1: 0.8s    4: 16.2s    10: 18.3s    30: 24.5s    60: 32.5s
//
// Which is why cutting the count saves so much less than it looks like it
// should, and why sixty timed out on a CI runner -- it pays that same fixed
// toll about three times over -- while thirty does not.
//
const FRAMES = 30;
const STEP = 1 / 60;

//
// The shot starts when the harness sets `window.__cheeseShoot`, once it has
// watched the network go idle -- assets, not a stopwatch. A page opened by
// hand has nobody to do that, so it shoots on its own after this long.
//
// Only when no harness announced itself. A timer that fires anyway would race
// the very wait it stands in for, and win on exactly the slow loads that wait
// exists for.
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
    let started = 0;
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
        //
        // Not while a physics worker still owes a reply. Cannon steps by
        // transferring its buffers to a worker and skips every step until
        // they come back, so how many steps land inside our thirty frames
        // would otherwise be the machine's choice -- see `deterministic.js`,
        // which keeps the count this reads. Skipping the advance (rather
        // than blocking) keeps the compositor pixel moving above.
        //
        if (window.__cheesePhysicsSettled?.() === false) {
          raf = requestAnimationFrame(tick);
          return;
        }

        if (frame === 0) started = window.__cheeseRealNow?.() ?? 0;

        //
        // The page's clock moves here, and only here -- see `deterministic.js`.
        // Before `advance`, so that anything reading `performance.now()` inside
        // this frame (a spring, an easing, a `rafz` tick) sees the same instant
        // r3f is about to render.
        //
        window.__cheeseAdvanceClock?.(STEP * 1000);

        flushSync(() => advance(++frame * STEP));

        if (frame === FRAMES) {
          console.log(
            `📸 Shot ${FRAMES} frames in ${Math.round((window.__cheeseRealNow?.() ?? 0) - started)}ms`,
          );
          window.__cheeseReady = true; // tells the harness to take its screenshot
        }
      }

      raf = requestAnimationFrame(tick);
    }

    console.log("😬 Say cheeese (waiting for the go-ahead)");
    tick();

    const unattended = setTimeout(() => {
      if (!window.__cheeseHarness) window.__cheeseShoot = true;
    }, UNATTENDED);

    return () => {
      clearTimeout(unattended);
      cancelAnimationFrame(raf);
      pixel.remove();
    };
  }, [advance]);

  return null;
}

export default function CheesyCanvas({ children, frameloop, ...props }) {
  useEffect(() => {
    console.log(
      "CheesyCanvas: use ?saycheese in the URL to stop the animation",
    );
  }, []);

  const sayCheeseParam = new URLSearchParams(window.location.search).has(
    "saycheese",
  );

  //
  // Held from the very first render, not switched off after a wait. That is
  // the difference between a deterministic shot and the previous one: letting
  // the loop run for three seconds and *then* freezing it captured whatever
  // number of frames the machine had managed, and every `useFrame` had
  // already integrated that many deltas of wall clock into the scene.
  //
  // The one thing here that `deterministic.js` cannot do from outside React,
  // and the reason the plugin still has to reach the file holding the
  // `<Canvas>` -- `preserveDrawingBuffer` moved there, this cannot.
  //
  const cheesyFrameloop = sayCheeseParam ? "never" : frameloop;

  //
  // The second take.
  //
  // The first mount happens in asset-arrival order: each suspense boundary
  // resolves when its download does, so which component mounts first -- and
  // with it the order `useFrame` callbacks register, the order children land
  // in the scene graph, the order physics bodies enter the world, the order
  // draws are taken from the seeded `Math.random` sequence -- is decided by
  // the network, run to run. That order is the drift no amount of waiting
  // fixed: serialising `fetch` was measured and changed nothing, because
  // arrival is only the first domino.
  //
  // So once everything has arrived, the harness asks for a second mount, by
  // key. Every `useLoader` is now warm in the suspend-react cache and answers
  // synchronously, so nothing suspends: the whole scene mounts in one
  // synchronous render, in JSX order -- the same order every run, on every
  // machine. The seeded sequence is rewound first (see `deterministic.js`) so
  // the draws land on the same values too. The canvas, its GL context and its
  // compiled shaders survive, since the key sits below `<Canvas>`; what gets
  // rebuilt is exactly the part whose order was wrong.
  //
  const [take, setTake] = useState(0);

  useEffect(() => {
    if (!sayCheeseParam) return;

    window.__cheeseRemount = () => {
      window.__cheeseReseed?.();
      flushSync(() => setTake((take) => take + 1));
    };
    return () => delete window.__cheeseRemount;
  }, [sayCheeseParam]);

  return (
    <Canvas {...props} frameloop={cheesyFrameloop}>
      {sayCheeseParam && <SayCheese />}

      <React.Fragment key={take}>
        {children}
        {sayCheeseParam && <Probe take={take} />}
      </React.Fragment>
    </Canvas>
  );
}

//
// Announces that a take has *finished* mounting -- render committed, effects
// run -- which `flushSync` in `__cheeseRemount` cannot promise: the children
// live behind the `<Canvas>` bridge, in r3f's own root, whose render the DOM
// side schedules rather than flushes. Measured on `trails` under CPU
// throttle: both flushSyncs long returned, and the second take still
// assembled itself at frames 1-2 of the pump -- its physics worker created,
// connected and populated across running frames, at whichever frame the
// machine chose (and the first take's, not yet unmounted, stepping in the
// meantime). The harness waits for this signal before it starts the shot --
// see `shoot.mjs`.
//
// Last in the fragment, because effects flush in tree order: by the time this
// one runs, every sibling before it has run its own -- for physics, that is
// where the worker is created and every body added.
//
function Probe({ take }) {
  useEffect(() => {
    window.__cheeseTake = take;
  }, [take]);
  return null;
}
