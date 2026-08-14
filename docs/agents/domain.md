# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

This repo is **multi-context**. A context is a workspace package, and there are three kinds:

| Context                | Where              | Covers                                                         |
| ---------------------- | ------------------ | -------------------------------------------------------------- |
| The website            | `apps/website/`    | The catalog UI — Next.js static export, shadcn/ui, m3 tokens   |
| The e2e harness        | `packages/e2e/`    | Playwright + Chromatic visual regression, snapshot determinism |
| One per example (×170) | `examples/<demo>/` | That single demo — its scene, its loaders, its own vocabulary  |

Everything that spans packages — the build pipeline (`bin/`, `turbo.json`), CI (`.github/`), dependency policy (`pnpm-workspace.yaml` overrides and patches, `syncpack`) — is **system-wide** and lives in the root `docs/adr/`, not in any one context.

## Resolving the context for a path

Resolution is **by path**, not by lookup in a map — with 172 contexts a hand-maintained index goes stale on the first `examples/` addition. Given a file you are about to work on, walk up from it:

1. `examples/<demo>/…` → the context is `examples/<demo>/`
2. `apps/website/…` → the context is `apps/website/`
3. `packages/e2e/…` → the context is `packages/e2e/`
4. anything else (`bin/`, `test/`, `schemas/`, `.github/`, root config) → system-wide only

`CONTEXT-MAP.md` at the root, if it exists, is a human-facing reading list — it does not need to be exhaustive, and the path rule above wins when the two disagree.

## Before exploring, read these

For the context you resolved:

- **`<context>/CONTEXT.md`** — its glossary
- **`<context>/docs/adr/`** — its context-scoped decisions

Then, always:

- **`docs/adr/`** at the root — system-wide decisions. Read the ones that touch the area you're about to work in.

When a change spans contexts (a website feature that reads example metadata, an e2e change driven by an example), read every affected context's `CONTEXT.md`, not just the one you started in.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront; don't scaffold empty stubs across `examples/`. The `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates them lazily when terms or decisions actually get resolved — so on most demos there will be nothing to read, and that is the expected state.

## Who writes an example's `CONTEXT.md`

`/domain-modeling` is not the only producer. **`teach` is the other one**, reached through `/describe-example <name> --explain`: it runs `/mattpocock-skills:teach` in sub-agents over one demo's source, and two things come back out of the ephemeral workspace — the reference distillation, which becomes the explainer in that example's `README.md`, and the glossary, which becomes its `CONTEXT.md`. Everything else the passes grew (`MISSION.md`, `learning-records/`, `lessons/`) is one person's learning state and stays outside the repo.

Both producers write the same file to the same contract, so a `CONTEXT.md` does not record which one wrote it.

**No demo gets a `CONTEXT.md` that merely restates its `README.md`.** The explainer holds the technique — the problem, how it works, what it costs. The glossary holds terms that are genuinely local to the demo and that a reader would otherwise have to infer. When the only content would be a paraphrase of the explainer, the file should not exist: it doubles the surface that has to be kept true and says nothing the reader did not already have.

## File structure

```
/
├── CONTEXT-MAP.md                     ← optional reading list
├── docs/adr/                          ← system-wide decisions
│   ├── 0001-….md
│   └── 0002-….md
├── bin/                               ← system-wide, no context of its own
├── apps/website/
│   ├── CONTEXT.md
│   └── docs/adr/
├── packages/e2e/
│   ├── CONTEXT.md
│   └── docs/adr/
└── examples/
    ├── aquarium/
    │   ├── CONTEXT.md
    │   └── docs/adr/
    ├── arkanoid/
    │   ├── CONTEXT.md
    │   └── docs/adr/
    └── …  (one context per demo, 170 of them)
```

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in the relevant `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal — either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

Terms shared by every demo — example, scene, canvas, snapshot, the `pmndrs.json` metadata — belong to the **system-wide** vocabulary, not to any one example's `CONTEXT.md`. A per-demo glossary should only hold what is genuinely local to that demo.

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0007 (event-sourced orders) — but worth reopening because…_

A context-scoped ADR binds only its context; a root ADR binds all of them. If a context ADR contradicts a root ADR, the root one wins and the conflict is worth raising.
