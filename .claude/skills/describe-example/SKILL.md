---
name: describe-example
description: Writes one example's `description` and `apis` in `examples/<name>/pmndrs.json` from its source, and with `--explain` the long-form explainer in its `README.md`. Use when asked to describe, re-describe or explain an example in this gallery, or when a `pmndrs.json` description is empty, stale, or names the code rather than the technique.
argument-hint: "<example-name> [--explain]"
---

# describe-example

Two fields of one example's `pmndrs.json`, written by reading its source: the one-line `description` the index carries, and the `apis` list that its per-example document carries. With `--explain`, also the long-form explainer — see [explain.md](./explain.md).

## Why this is a skill

The gallery publishes an agent-readable surface — `llms.txt`, `/examples/<name>.md`, `/examples/<name>.json`, built by `bin/build-llms.mjs` and served both over the pmndrs docs MCP server and by `rel="alternate"` on every example page. The pipeline is sound. The content it carries is not: **39 of the 170 descriptions are empty**, and the rest run to a median of **56 characters** that generally name no technique.

`aquarium` is the case that names the problem, and the one this skill has been run on. It shipped an empty description and the single tag `transmission`, while what actually makes the demo work is a **stencil mask** — `useMask` plus a backside `MeshTransmissionMaterial` — named nowhere. An agent asking "how do I do refractive glass" cannot tell it from the other 169, and having opened it, pays full token price to rediscover the trick by reading 200 lines of TSX.

Fixing that is 170 acts of judgement. The two contracts below are what keeps those 170 acts consistent, which is why they live in this file rather than in a reviewer's memory.

## Three rules that shape everything

- **One example per run.** The argument is one example name. Batching is what turns review into rubber-stamping, and a rubber-stamped line is worth no more than the empty string it replaced.
- **Nothing is written before the maintainer says yes.** Propose, then write. The only check on judgement is a human who can say no; a skill that writes first has converted that into a diff-read after the fact, which is not the same thing.
- **The output is committed to git, and no model runs in `bin/`.** Git is the source of truth and `bin/lib/render-llms.mjs` stays dumb and deterministic. Those scripts sit on the critical path of the site build and of `turbo`'s cache: a model call there makes the build non-reproducible, offline-hostile, and cache-busting on every run. If generating this at build time starts to look attractive, that is the reason it is not.

## The `description` contract

One sentence, and it is the only thing most readers of `llms.txt` will ever see about this example.

- **English.**
- **≤ 120 characters.** Five descriptions exceed this today; they are rewrites, not truncations.
- **Prose only — no identifiers.** They have their own field. Three median-length API names cost ~34 characters, 28% of the budget, which is exactly why `apis` exists.
- **Names the _technique_, not the code.** A line that describes what the code does rots at the first refactor; a line that names which technique is employed survives.
- **Says nothing the index line already says.** `summaryLine()` in `bin/lib/render-llms.mjs` prints the directory name, the non-implied libraries, the tags and a size marker around this sentence. "Physics simulation using cannon" spends the whole budget on `+cannon · #physics`, which the reader already has. `@react-three/fiber` and `@react-three/drei` are implied on every line and are never worth a word.
- **No throat-clearing.** Not "This example shows…", not "A demo that…". The surrounding line has already established that this is an example.

```jsonc
// examples/aquarium/pmndrs.json
"description": "Glass rendered as a stencil mask rather than transparency, with a backside transmission material."
```

97 characters. Note what it does not claim. `useMask` appears in six examples, one of them called `stencil-mask` — "uses a stencil mask" would discriminate nothing. The line earns its place by saying what _this_ demo does with the mask: glass, in place of transparency, with the transmission material on the backside. When a technique is shared, the line has to reach past it.

A technique carried by a prop rather than an import — `gl={{ stencil: true }}`, `frameloop="demand"` — is said here, in prose, because `apis` cannot hold it. The `aquarium` line above does exactly that without naming the prop.

## The `apis` contract

Identifiers are data, not prose. Keeping them out of `description` is what makes the 120-character budget comfortable.

```jsonc
"apis": ["useMask", "MeshTransmissionMaterial"]
```

- **Imported identifiers only, and only from this example's own `src/`.** Not props, not local component names, not types. `apis ⊆ imports` is the whole mechanical check `lint:metadata` carries — purely local and textual, no network, no type resolution — and it is what catches silent rot: drei renames an API, someone fixes the import, `apis` still lists the old name, the lint breaks.
- **A short selection, not a list.** An example imports 9 identifiers at the median and up to 34. The criterion is _what you would have to bring over to reproduce the effect_; everything the example happens to also import stays out. Typically two or three. No number is fixed, because how many the technique needs depends on the demo — but "no ceiling" is not "as many as you like". The limit is editorial: this skill selects, the maintainer reviews.
- **What every example imports discriminates nothing.** `Canvas`, `useFrame`, `OrbitControls`, `* as THREE` are in most of the gallery. They are never the answer to "what makes this one different".
- **Order it for a reader**, with the API that carries the technique first.
- **Not every example has one.** A demo whose trick is a prop or a shader gets `[]`, and the prose carries it alone. An empty list is a finding, not a failure.

`apis` is rendered in `<name>.md`, not in `llms.txt` — adding ~34 characters to every index line would take that file from ~19 kB to ~25 kB, on a document read at the start of every question. The identifiers are there the moment you open the example, which is when they matter.

## Working an example

1. **Read it.** `examples/<name>/pmndrs.json`, `README.md`, and every file under `src/` — the median example is 5 kB, so read it whole rather than grepping. `thumbnail.webp` is worth a look: it is what the reader is choosing from.

2. **Collect the imports properly.** Grepping `from "` misses most of them, because the identifiers sit in multi-line member lists above it:

   ```tsx
   import {
     useMask,
     …
   } from "@react-three/drei";
   ```

   Read the import block at the top of each source file instead.

3. **Find the technique.** The question is what this demo knows that the other 169 do not. Follow it from the imports into the code and confirm it is actually load-bearing — `useMask` in `aquarium` is not decoration, the demo does not work without it. An example whose only distinguishing feature is its subject matter (a watch, a pinball table) has that as its technique, and the line should say so plainly.

4. **Propose both fields together**, with the character count and one sentence on which technique you concluded and from what. Both fields describe the same finding; splitting the proposal invites approving one against a reading of the other.

5. **Write, on the maintainer's ok.** Edit `examples/<name>/pmndrs.json` and nothing else. Keep the field order matching `schemas/pmndrs.schema.json` — every file in the gallery follows it today. Do not touch `title`, `tags`, `authors` or `libraries`: they are someone else's contract, and a description PR that quietly retags is one nobody can review.

6. **Verify.**

   ```sh
   pnpm lint:metadata
   node -e 'const m=require("./examples/<name>/pmndrs.json");console.log(m.description.length, "|", m.description)'
   ```

   `lint:metadata` carries `apis ⊆ imports`, so `api "X" is not imported in src/` means the entry names something this example does not import — a typo, a prop, or a local component. What it can never check is whether the sentence is true or well turned. That stays human, and is why step 4 exists.

## `--explain`

The long-form explainer, in the example's own `README.md`, plus its glossary in `CONTEXT.md`. It does not read the source and write: it runs `teach` in sub-agents first, and only its distillation comes back. The orchestration, the mission it has to supply, and the writing contract are in [explain.md](./explain.md).

Both modes live in one skill because both enforce contracts that must not drift apart — the one-liner is the compression of the same understanding the explainer spends 400 words on, and writing them from two separate readings is how they end up describing two different demos.

## When this file goes away

This skill is scaffolding for a finite job: every example in the gallery carrying a `description`, an `apis` list and a `README.md` explainer. **When that is done, delete it** — along with `bin/eval.mjs` and the measurement records under `bin/eval/`, keeping only `questions.json`, whose twenty hand-written answers are the expensive part and the only part worth a second run.

What survives is what runs on its own and fails loudly: `apis ⊆ imports`, the description bound and non-emptiness, and the backticked-identifiers check on `README.md` and `CONTEXT.md` — all in `lint:metadata`. The `description` and `apis` contracts above are stated again, in one paragraph each, on those two fields in `schemas/pmndrs.schema.json`, which is where the author of a *new* example meets them and which outlives this file.

A skill nobody runs is a document that rots while claiming to be a tool. This one has a finish line; the note is here so that reaching it is not mistaken for a reason to keep it.
