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
