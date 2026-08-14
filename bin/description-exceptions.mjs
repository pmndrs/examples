//
// The two lists that carve out exceptions from "every example carries a
// description, and it fits on one line".
//
//   UNDESCRIBED  no description at all
//   OVERLONG     a description past the character bound
//
// ---------------------------------------------------------------------------
//
// `bin/build-llms.mjs` publishes all 170 examples to `llms.txt` and to
// `/examples/<name>.md`, and the description is the only sentence most readers
// of that index will ever see about one of them. An example without one
// arrives there as a directory name and a tag -- a model choosing between 170
// of those is choosing on a filename. That is why an empty description is an
// error and not a gap.
//
// `bin/e2e-exceptions.mjs` already establishes this shape in this repo, down
// to its reasoning: a suite that is red for known reasons is a suite nobody
// reads, and "known" has to mean written down. So the rule goes on at full
// strength today, and the examples that cannot pass it yet are named here,
// once, in a file whose whole subject is that they haven't been written.
//
// The lists are the source of truth. `bin/validate-pmndrs-metadata.mjs`
// errors on any description that is empty or over the bound unless the
// example is named here, and `test/description-exceptions.test.ts` fails when
// the lists and reality disagree -- in both directions, so an entry that has
// since been described is as loud as a description that has since been
// emptied. Neither list is a place to put a new failure: an entry is a promise
// to come back to it, the way out is `/describe-example <name>`, which writes
// the line and deletes the entry in the same change, and the lists reaching
// zero is what closes #192.
//
// `schemas/pmndrs.schema.json` deliberately still types `description` as a
// bare string. `minLength` and `maxLength` there would replay these same 45
// failures inside every editor that opens one of these files -- red for known
// reasons again, in a venue that has no exception list to read. The schema
// tightens when this file is empty.
//

/** What a description has to fit in. Shared with the `describe-example` skill. */
export const DESCRIPTION_MAX_LENGTH = 120;

//
// Examples that ship `"description": ""`. Forty of the hundred and seventy, on
// 2026-08-14; the other hundred and thirty run to a median of 56 characters.
//
// Nothing groups them. They are not the old examples, or the small ones, or
// the ones nobody looks at -- `aquarium`, `caustics` and `portals` are here.
// The field was simply never required to hold anything, so for these forty it
// never got anything.
//
export const UNDESCRIBED = [
  "aquarium",
  "bloom-hdr-workflow-gltf",
  "cards",
  "cards-with-border-radius",
  "caustics",
  "csg-bunny-usegroups",
  "csg-house",
  "csg-operations-rapier-physics",
  "dbismut-furniture",
  "diamond-ring",
  "ecctrl-fisheye",
  "enter-portals",
  "environment-blur-and-transitions",
  "envmap-ground-projection",
  "faucets-select-highlight",
  "gatsby-stars",
  "glass-flower",
  "ground-projected-envmaps-lamina",
  "html-input-fields",
  "inter-epoxy-resin",
  "iridescent-decals",
  "lamina-1x",
  "lusion-connectors",
  "magic-box",
  "monitors",
  "motionpathcontrols",
  "nextjs-prism",
  "pairing-threejs-to-ui",
  "pass-through-portals",
  "pmndrs-vercel",
  "portal-shapes",
  "portals",
  "rapier-physics",
  "react-ellipsecurve",
  "shopping",
  "ssgi-spheres-with-rapier-physics",
  "stage-presets-gltfjsx",
  "starwars",
  "t-shirt-configurator",
  "water-shader",
];

//
// Examples whose description is written, and too long. Five, with the length
// recorded so the entry can be checked rather than believed -- the test reads
// the file and fails on a number that has drifted.
//
// None of them is a truncation away from fitting. Each spends its overflow
// listing the stack in prose -- `bubbles` names five postprocessing effects,
// `pixelation` and `vignette` each spell out a package -- which is the
// identifiers-in-`description` habit that the `apis` field now exists to
// absorb. Cutting the sentence at 120 would leave the same bad line, shorter.
// So they are rewrites, they are `describe-example` work, and this change has
// to land before any description is written.
//
export const OVERLONG = {
  bubbles: 147,
  pixelation: 127,
  "take-control": 133,
  vignette: 122,
  wireframes: 131,
};
