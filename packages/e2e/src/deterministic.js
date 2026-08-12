import seedrandom from "seedrandom";

const sayCheeseParam = new URLSearchParams(window.location.search).has(
  "saycheese",
);
if (sayCheeseParam) {
  seedrandom("hello.", { global: true });

  //
  // Seeding fixes the *sequence*; it does not fix who draws from it in what
  // order. Assets resolve in whatever order the network hands them back, the
  // components waiting on them mount in that order, and every draw they make
  // -- a spread position, a phase, the four values three.js burns per object
  // for a UUID -- lands on a different point of the same fixed sequence.
  //
  // The harness deals with that by mounting the scene twice (see
  // `CheesyCanvas`), and the second mount only helps if it starts from the top
  // of the sequence. This is the rewind.
  //
  window.__cheeseReseed = () => seedrandom("hello.", { global: true });

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
  // Draw order must not depend on which asset finished decoding first.
  //
  // three's default opaque sort (`painterSortStable`) orders by `material.id`
  // before depth -- and that id is a global counter, burned in whatever order
  // GLTFLoader's async pipeline happened to construct materials: Draco decodes
  // in a four-worker pool, textures land when they land, and
  // `assignFinalMaterial` mints its clones as each mesh's Promise.all
  // resolves. The loader cache then hands those same instances to the second
  // mount, so the remount cannot renumber them and the reseed cannot reach a
  // module-private counter. Wherever two of those materials meet on a
  // coplanar surface -- or anywhere at all inside a depthTest=false overdraw
  // pass like ContactShadows' depth bake -- the draw order IS the picture.
  //
  // Measured as the entire remaining drift of `bloom-hdr-workflow-gltf` (one
  // MSAA-contested pixel, 10/10 identical with this in place) and
  // `bruno-simons-20k-challenge` (9/9), and the same mechanism was traced in
  // `bounds-and-makedefault`, `clones` and `html-markers`.
  //
  // Same keys the default uses, minus `material.id`. The `id` tiebreaker is
  // `object.id`, which the second take mints in JSX order. Installed through
  // the `__THREE_DEVTOOLS__` hook because every renderer announces itself
  // there at construction, whichever version of three and whoever created it
  // -- this module just has to exist first, and it is the entry's first
  // import.
  //
  const opaqueSort = (a, b) =>
    a.groupOrder - b.groupOrder ||
    a.renderOrder - b.renderOrder ||
    a.z - b.z ||
    a.id - b.id;
  window.__THREE_DEVTOOLS__ = {
    dispatchEvent(event) {
      const it = event.detail;
      if (it && it.isWebGLRenderer && it.setOpaqueSort)
        it.setOpaqueSort(opaqueSort);
    },
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

  //
  // Timers move onto the virtual clock too -- but only once the shot starts.
  //
  // `setTimeout` is how a scene schedules anything it does not want to do right
  // now, and it was still keeping wall time: `threejs-journey-lv-1-fisheye`
  // re-aims its subject on `setTimeout(wander, (1 + Math.random() * 2) * 800)`,
  // so how many of our frames elapse before it fires depended entirely on how
  // fast the machine drew them.
  //
  // Only once the shot starts, and that boundary was measured rather than
  // guessed. Virtualising from page load instead -- to catch `clones`, which
  // recolours its light on `setInterval(..., 3000)` a machine-dependent number
  // of times *while loading* -- deadlocked the load: the clock does not move
  // until we pump, so anything waiting on a long timer waits forever.
  // `bruno-simons-20k-challenge` never finished loading and spent all three of
  // its shots hitting the 300s budget. Exempting short delays was not enough.
  //
  // So a scene that does something time-based before the shot is beyond this,
  // and has to stop doing it -- see `clones`.
  //
  const realSetTimeout = window.setTimeout.bind(window);
  const pending = new Map();
  let nextId = 1;
  let shooting = false;

  const realSetInterval = window.setInterval.bind(window);

  function schedule(callback, delay, args, every) {
    const id = -nextId++; // negative, so it cannot collide with a real handle
    pending.set(id, { at: virtual + delay, callback, args, every });
    return id;
  }

  window.setTimeout = (callback, delay = 0, ...args) =>
    shooting
      ? schedule(callback, delay, args, 0)
      : realSetTimeout(callback, delay, ...args);

  // `clones` recolours its light on `setInterval(..., 3000)`, drawing from the
  // shared sequence each time it fires -- so what it had drawn by the shot
  // depended on how long the shot took to reach.
  window.setInterval = (callback, delay = 0, ...args) =>
    shooting
      ? schedule(callback, delay, args, delay)
      : realSetInterval(callback, delay, ...args);

  const realClearTimeout = window.clearTimeout.bind(window);
  const realClearInterval = window.clearInterval.bind(window);
  window.clearTimeout = (id) =>
    id < 0 ? pending.delete(id) : realClearTimeout(id);
  window.clearInterval = (id) =>
    id < 0 ? pending.delete(id) : realClearInterval(id);

  // Called by the pump in CheesyCanvas, once per frame, before it advances r3f.
  window.__cheeseAdvanceClock = (ms) => {
    shooting = true;
    virtual += ms;

    // Due callbacks, oldest first, and taken out of the map before they run so
    // that one rescheduling itself cannot loop inside this frame.
    for (const [id, timer] of [...pending].sort((a, b) => a[1].at - b[1].at)) {
      if (timer.at > virtual) break;

      if (timer.every) timer.at += timer.every;
      else pending.delete(id);

      timer.callback(...timer.args);
    }
  };

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
