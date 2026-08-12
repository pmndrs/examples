//
// The two lists that carve out exceptions from "every example", and the reason
// for each one.
//
//   EXCEPTIONS   not opened by the e2e run at all
//   UNPUBLISHED  opened and archived, but not sent to Chromatic
//
// ---------------------------------------------------------------------------
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

  //
  // Slow *and* wildly variable, which is worse than slow. Three runs of the
  // same commit on the runner: 3.2 minutes, then over five, then over five
  // again -- the first one under a shard that was fighting ten other browsers,
  // the later ones with the runner to itself. Raising the budget from 180s to
  // 300s did not catch it, and there is no number that would, because the
  // spread is the problem. Why it costs what it costs is worth its own look.
  //
  "merged-instance": "3.2min to over 5min for the same shot, run to run",
};

//
// Examples the run opens and archives, but does not send to Chromatic.
//
// Everything with a `test` script is published; this is the subtraction, and it
// is the only thing that still has to be *measured*. Chromatic has no pixel
// tolerance to hide behind, so an example that draws a different canvas on two
// runs of the same commit flags a change nobody made, on every build, forever
// -- and one example crying wolf is enough for nobody to read the report.
//
// `e2e-flaky` is what decides, never a reading of the source: `useFrame` tells
// you nothing either way. An entry carries the hashes that disagreed and how
// many shots it took to catch them, so the claim can be checked rather than
// believed.
//
// The list is empty, and that emptiness was bought, not assumed. Thirty-five
// examples used to live here -- every one measured drifting, some flipping
// between three canvases within three shots. Understanding why emptied it:
// the page keeping its own clock (react-spring's rafz never goes through
// `useFrame`), wall-clock timers, the media clock, mount order following
// asset-arrival order, three's draw sorts keying on ids that are dealt in
// Draco-worker completion order, CSS animations on the compositor's timeline,
// and one MSAA sample resolved inside the driver. Each mechanism is documented
// where it is closed, in `packages/e2e/src/deterministic.js` and
// `CheesyCanvas.jsx`; two examples also stopped scheduling real timers
// (`clones`, `springy-boxes`).
//
// Measured under that harness over repeated passes of three cold shots each,
// on every former drifter plus three always-stable controls, until two
// consecutive passes caught nothing. The first protocol run came back clean
// at six shots per example -- and doubling it under full-machine load caught
// three more, each flipping once in ten to fifteen shots and only under
// load. That is the measurement lesson next to "warm is not cold" and
// "three shots settle nothing": an idle machine hides flakers, so the
// certifying run keeps the machine busy on purpose. All three were
// diagnosed to a proven mechanism (an async Worker reply landing mid-shot,
// networkidle saying "arrived" when Draco had not finished decoding, and a
// texture() sampled where GLSL leaves derivatives undefined), fixed, and
// re-measured 9/9 under load each. The final certification -- all 38 under
// sustained load, plus a parallel sweep hammering the six heaviest with
// ~135 extra shots -- caught nothing, twice over.
//
// It is still sampling -- the nightly, which shoots five times on the runner
// that actually takes the picture, is what keeps the claim honest over time,
// and this list is where its catches land. An entry here is a promise to
// diagnose, not a place to rest.
//
// Two absences never belonged on this list. `svg-renderer` reports "no
// canvas" by construction -- it swaps its canvas for an `<svg>`, which
// Chromatic archives as DOM, so there is nothing here to be flaky about.
// `minecraft` could not be measured at all: it does not build on the machine
// this ran on (a missing rapier dependency) though it builds in CI, so the
// nightly gets the first word on it.
//
export const UNPUBLISHED = {};
