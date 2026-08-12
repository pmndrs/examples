import seedrandom from "seedrandom";

const sayCheeseParam = new URLSearchParams(window.location.search).has(
  "saycheese",
);
if (sayCheeseParam) {
  seedrandom("hello.", { global: true });

  //
  // Chromatic archives the frozen page by serialising the DOM, and a <canvas>
  // only survives that as whatever `toDataURL()` returns. WebGL clears its
  // drawing buffer right after compositing, so by the time the archive is
  // taken the read comes back blank -- unless the context was created with
  // `preserveDrawingBuffer`.
  //
  // Patched onto `getContext` rather than merged into the `<Canvas gl>` prop,
  // because this module is imported from `src/index.[jt]sx` -- which every
  // example has -- and runs before anything creates a context. So it catches
  // every canvas whatever shape `gl` takes (`svg-renderer` passes a callback
  // and builds its own renderer, leaving nothing to merge into) and wherever
  // the `<Canvas>` lives, which is not always where the plugin looks.
  //
  // Only under `?saycheese`: it costs an extra buffer copy per frame, which no
  // visitor should pay for.
  //
  const getContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, attributes) {
    return getContext.call(
      this,
      type,
      /^(webgl2?|experimental-webgl)$/.test(type)
        ? { ...attributes, preserveDrawingBuffer: true }
        : attributes,
    );
  };

  //
  // The clock the whole page reads, replaced by one that only moves when we
  // move it -- the same thing three.js does in its own screenshot harness.
  //
  // `frameloop="never"` freezes r3f's loop. It does not freeze the *page*, and
  // that turned out to be most of what was left: `@react-spring/three` animates
  // on its own `rafz` loop reading `performance.now()`, never through
  // `useFrame`, so it kept advancing by however long our thirty frames happened
  // to take -- which varies with shader compilation, run to run, by seconds.
  // That is why postprocessing and physics never correlated with drift (they
  // live inside `useFrame`) while springs and easings did.
  //
  // So: time starts at zero, stays there through loading, and advances exactly
  // `1/60` per frame we pump. `rAF` callbacks get the same virtual timestamp,
  // for anything that reads the argument rather than the clock.
  //
  // `Date.now` moves with it off a fixed epoch. `new Date()` is deliberately
  // left alone: patching the constructor breaks `instanceof` for very little,
  // since animation libraries read `performance.now` or `Date.now`.
  //
  const EPOCH = 1767225600000; // 2026-01-01T00:00:00Z, an arbitrary fixed point
  let virtual = 0;

  // Kept for the one thing that still wants wall clock: reporting how long the
  // shot really took, which is what tells us whether the budget still fits.
  window.__cheeseRealNow = performance.now.bind(performance);

  performance.now = () => virtual;
  Date.now = () => EPOCH + virtual;
  // three.js patches this one too, and it is not redundant: `new Date().getTime()`
  // never goes through `Date.now`.
  Date.prototype.getTime = () => EPOCH + virtual;

  const rAF = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (callback) => rAF(() => callback(virtual));

  // Called by the pump in CheesyCanvas, once per frame, before it advances r3f.
  window.__cheeseAdvanceClock = (ms) => (virtual += ms);

  //
  // A `<video>` answers to none of the above: it plays off the media clock, in
  // its own thread, and a texture sampled from it lands on whatever frame the
  // decoder had reached. It is the single strongest predictor of drift we
  // measured -- ten times over-represented among the examples that will not
  // hold still.
  //
  // three.js pins it by letting playback start and pausing on the first
  // `timeupdate`, and calls the result "semi-deterministic" for good reason:
  // `timeupdate` fires about four times a second, so where playback stops still
  // depends on how quickly the machine got there. We measured that as still
  // drifting.
  //
  // So it never plays. It seeks to a fixed position instead, and waits for the
  // decoder to say it landed -- `seeked` is the guarantee that this exact frame
  // is the one a texture will sample. Half a second in, because the first frame
  // of a video is often black or a fade.
  //
  const SEEK = 0.5;
  HTMLVideoElement.prototype.play = function () {
    const seek = () => {
      this.pause();
      this.currentTime = SEEK;
    };

    // `currentTime` before metadata is a no-op, so wait for the duration to
    // exist when it does not yet.
    if (this.readyState >= 1) seek();
    else this.addEventListener("loadedmetadata", seek, { once: true });

    return Promise.resolve();
  };

  var style = document.createElement("style");
  style.innerHTML = `
  canvas[data-engine] {
    animation: none !important;
    transition: none !important;

    opacity: 1!important;
  }
`;
  document.head.appendChild(style);
}
