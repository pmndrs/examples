//
// Examples the e2e run does not open, and why.
//
// three.js keeps the same list for the same reason: a suite that is red for
// known reasons is a suite nobody reads, and "known" has to mean written down.
// Everything here is a bug with an owner, not a scene that is merely awkward to
// screenshot -- an entry is a promise to come back to it.
//
// The list is the source of truth: an example is in the run if and only if it
// has a `test` script, and `test/e2e-exceptions.test.ts` fails if the two ever
// disagree. To bring one back: fix it, delete its line, add the script.
//
// Measured on 2026-08-11, one example at a time, against `?saycheese`.
//

export const EXCEPTIONS = {
  //
  // Never built. Their `build2` script is spelled `bbuild2` -- disabled by
  // prefix in #152 and never restored -- so there is no `dist` for the preview
  // to serve, and the test waits 180s on a page that was never there. Nothing
  // to do with the shot.
  //
  "building-dynamic-envmaps": "no build2 script (spelled `bbuild2` since #152)",
  "ssr-test": "no build2 script (spelled `bbuild2` since #152)",
  starwars: "no build2 script (spelled `bbuild2` since #152)",

  //
  // Throws on mount, and React takes the canvas down with it.
  //
  arkanoid: "TypeError: null.getWorldPosition, then the GL context is lost",
  "horizontal-tiles": "R3F: ThreeLine is not part of the THREE namespace",

  //
  // Draws, but never finishes: the shader it compiles is not the one three
  // 0.165 will resolve.
  //
  "stage-presets-gltfjsx":
    "shader error: cannot resolve #include <lightmap_fragment>",

  //
  // Waits for a human. The scene is behind a ▶️ button because its audio needs
  // a user gesture, so nothing mounts until something clicks it.
  //
  "simple-audio-analyser": "the scene only mounts after clicking ▶️",

  //
  // Too slow, and honestly so: 177s for thirty frames on a machine *with* a
  // GPU, where the whole set averages ~20s. It re-renders the scene into a cube
  // map every frame, which is the example's entire subject. The budget is 300s
  // and the runner has no GPU, so this is not a margin, it is a coin toss.
  //
  "building-live-envmaps": "177s for the shot on a GPU, ~9x the median",
};
