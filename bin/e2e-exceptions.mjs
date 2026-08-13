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
// you nothing either way. Each line carries the hashes that disagreed and how
// many shots it took to catch them, so the claim can be checked rather than
// believed.
//
// Measured over five independent passes of three cold shots, run until two
// consecutive passes caught nothing new. Each pass only re-shot what the last
// one still called stable, because UNSTABLE is proof and needs no repeat while
// "stable" is only an absence of one:
//
//   pass 1   162 examples   28 caught
//   pass 2   134 survivors   7 caught
//   pass 3   127 survivors   2 caught
//   pass 4   124 survivors   0
//   pass 5   124 survivors   0
//
// The middle rows are why this was not stopped at three. Seven examples that
// three shots called stable were not, and two more survived six -- so three
// settles nothing, and a list built on three would have published nine drifting
// examples with a measurement stamped on them.
//
// The last two rows are why it stops here. Everything published has now held
// the same canvas across fifteen cold shots, and the two passes that cost the
// most found the least: nothing. That is as close to closed as sampling gets.
// It is still sampling -- the nightly, which shoots five times on the runner
// that actually takes the picture, is what keeps the claim honest over time.
//
// Two absences from this list are deliberate. `svg-renderer` reports "no
// canvas" by construction -- it swaps its canvas for an `<svg>`, which
// Chromatic archives as DOM, so there is nothing here to be flaky about.
// `minecraft` could not be measured at all: it does not build on the machine
// this ran on (a missing rapier dependency) though it builds in CI, so the
// nightly gets the first word on it.
//
export const UNPUBLISHED = {
  aquarium: "2 canvases in 3 shots: d3f6a86f7103, 0d8dd7384ac0",
  "backdrop-and-cables": "2 canvases in 6 shots: 350486b815b9, 70adbce4ef64",
  "bloom-hdr-workflow-gltf":
    "2 canvases in 6 shots: c8891071d7ec, 57ff01daeab4",
  "bounds-and-makedefault": "2 canvases in 3 shots: 5f92bc3f91cb, e95595f50825",
  "bruno-simons-20k-challenge":
    "3 canvases in 3 shots: aa618731777f, ca8e33d30ec9, 73bfe55fd994",
  "camera-shake": "2 canvases in 9 shots: aec6545a48a1, 1d5339483013",
  caustics: "2 canvases in 3 shots: d1775d7e0beb, 90460cd587e1",
  clones: "3 canvases in 3 shots: 26b4a0ef757f, 6e7394cc476f, 8e284f7877d0",
  "gltfjsx-400kb-drone":
    "3 canvases in 3 shots: ec0d9b2fe09d, 57c384a82886, 0bdc00ff550e",
  "html-input-fields": "2 canvases in 3 shots: 392b03eb2d9c, adf82f519618",
  "html-markers": "2 canvases in 3 shots: 208ab6f9aeb8, 335602fd188f",
  "image-gallery":
    "3 canvases in 3 shots: 8949d072482b, fba50d9b6a51, bc09175a9357",
  "instanced-particles-effects":
    "3 canvases in 3 shots: 3d94d4ef0d6f, 71dfd65eb4d8, 651ac53adf90",
  "inverted-stencil-buffer":
    "2 canvases in 6 shots: d881d7a3bd21, 23492ebc13d1",
  "iridescent-decals": "2 canvases in 3 shots: 23111f0386cb, 1a1c9b85e77b",
  "lusion-connectors": "2 canvases in 6 shots: 6fbdf8ea09f6, 7c36d5ccde45",
  "mixing-html-and-webgl-w-occlusion":
    "2 canvases in 9 shots: 795f651106ab, e351a41a74af",
  monitors: "2 canvases in 3 shots: b88238564eb2, cb7c4d34622b",
  motionpathcontrols: "2 canvases in 3 shots: d4e8dfd0fea7, 27cb03b86fe8",
  portals: "2 canvases in 3 shots: 0cc8be025ed8, b7e49c963536",
  "react-pp-outlines": "2 canvases in 3 shots: facbb0ecdd8f, b446575fa4d1",
  "room-with-soft-shadows": "2 canvases in 3 shots: f4e044d4ec72, 304b616fc7c5",
  "simple-physics-example-with-debug-bounds":
    "3 canvases in 3 shots: a02c996ee4f8, 72b6f6ffa743, 05b287c017c8",
  "space-game":
    "3 canvases in 3 shots: 13baa491a2d3, 6824835d33ee, 4da0a1107c3e",
  "sport-hall": "2 canvases in 6 shots: 61b6397a4653, fce5bdde00a1",
  "springy-boxes":
    "3 canvases in 3 shots: 651bf6641f1b, f08df57944ec, e1df6c71e657",
  "ssgi-spheres-with-rapier-physics":
    "2 canvases in 3 shots: b45418b5bb92, c8a9b1f2ef9d",
  "threejs-journey-lv-1-fisheye":
    "2 canvases in 3 shots: da4ae62c5a6b, 088d8b64a20e",
  "thunder-clouds":
    "3 canvases in 6 shots: 1d505dfb52cd, 635f5c4316fc, 050d7406562d",
  "transformcontrols-and-makedefault":
    "2 canvases in 3 shots: 463de95d6242, 6fa59a5cce08",
  "video-cookies":
    "3 canvases in 3 shots: b53f5b2661be, 8d64de626c18, 17446eddb86f",
  "video-textures": "2 canvases in 6 shots: 1daa4cefebef, 8afe2467e6ba",
  "view-tracking":
    "3 canvases in 3 shots: e18095014d7f, 60408229779d, 008cfa4a07a6",
  "viking-ship": "2 canvases in 3 shots: a6a037281f60, b75ddeedab49",
  "volumetric-light-godray":
    "3 canvases in 3 shots: a6f86faeb565, 55689a37abfb, 64b6808eb278",
};
