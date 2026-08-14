# `--explain`

The one-line `description` is what the index can afford. It is not what a reader wants once they have opened the example. That reader gets a second artifact:

| Written to                   | Holds                                                    | Read by                                      |
| ---------------------------- | -------------------------------------------------------- | -------------------------------------------- |
| `examples/<name>/README.md`  | the explainer — the problem, the technique, the pitfalls | humans on GitHub, and agents via `<name>.md` |
| `examples/<name>/CONTEXT.md` | the glossary — terms local to this demo                  | agents, before exploring                     |

`README.md` already exists in all 170 examples: badges, the `degit` line, the thumbnail, and nothing else. The explainer goes under that whole block, which stays intact — the three lines are one header and splitting prose into the middle of them separates the scaffold command from the badges that link to the same thing. Additive: no new file, no new convention, and `degit` carries it into whatever the reader scaffolds.

**Absence is the normal state.** This is multi-session, interactive work driven by curiosity about a particular demo, not a programme across 170. An example with an explainer is better; one without is fine.

## It does not read the source and write

That is the whole design. A direct read produces a confident paragraph about a demo nobody understood, and there is no way to tell one of those from the real thing by reading it. So `--explain` runs `/mattpocock-skills:teach` in sub-agents first, and writes only from what they distil.

`teach` sets `disable-model-invocation`, so the Skill tool will not launch it — the sub-agent reads the skill file and follows it. The repo's `.claude/settings.json` enables `mattpocock-skills@mattpocock`, which puts it at `~/.claude/plugins/marketplaces/mattpocock/skills/productivity/teach/SKILL.md`. If the plugin layout has moved, find it: `find ~/.claude/plugins -path '*productivity/teach/SKILL.md'`.

### 1. The workspace is ephemeral and outside the repo

One temp directory per example — `mktemp -d`, or the session scratchpad. `teach` treats the current directory as the workspace, and a sub-agent's working directory resets between bash calls, so hand it the absolute path and say plainly that this directory is the workspace root: every path the skill names (`MISSION.md`, `./lessons/`, `./reference/`) resolves under it.

Everything it grows there is scaffolding: `MISSION.md`, `learning-records/`, `lessons/*.html`, `RESOURCES.md`, `NOTES.md`, `assets/`. Half of it is one person's learning state — why _they_ wanted to learn this, what _they_ have already understood — and it has no business in a public repo of 170 shared demos. It dies with the directory. Never point the workspace at `examples/<name>/`.

### 2. The skill supplies the mission

`teach` is built for a human learner, and its first move is to ask why _you_ want to learn this. Headless there is nobody to ask, and a pass without a mission runs on nothing — the lessons come out abstract and the distillation comes out generic. So write `MISSION.md` into the workspace before launching the first pass, answering on the example's behalf:

```md
# Mission: <Title> — <the technique, in a few words>

## Why

An r3f developer has opened this example because they want the technique it
demonstrates, in their own scene. They need it explained well enough to carry
over: what problem it solves, how it works, and what it costs.

## Success looks like

- The technique can be named and explained without opening the source again.
- The APIs that carry it are identified, and what each contributes is clear.
- The pitfalls are known — where the approach breaks, and what it trades away.

## Constraints

- The source is `examples/<name>/src/`, against the versions pinned in that
  example's `package.json`. Read the code that is there, not the API you
  remember.
- The explanation must not walk the code: no line numbers, no local variable
  names, no "the file X does Y".

## Out of scope

- Everything the demo also happens to contain — staging, lighting, model
  loading — that is not the technique.
```

Headless, the sub-agent is both teacher and learner: it writes the lesson and it sits the quiz. That is awkward, and it is fine, because the artifact that matters here is the reference distillation, not the score. The quiz is what forces the pass to find out whether it actually knows the thing.

### 3. The first pass judges, and the cap is three

Each pass ends by answering one question in its report: **is a load-bearing sub-topic still unclear enough to warrant another pass, and which one?** If yes, launch another sub-agent on the same workspace with that sub-topic as its focus — `teach` is stateful, so it reads the learning records the previous pass left and picks up from them.

**Three passes total, then stop regardless.** Without a cap an obscure demo chains passes indefinitely, and the marginal pass stops paying long before the sub-agent runs out of things it would like to understand better. A sub-topic still unclear after the third pass is a caveat in the proposal, not a fourth pass.

### 4. Only the distillation comes back

Two things leave the workspace, rewritten as markdown:

- **the reference documents** — `teach` calls them "the compressed essence", designed for quick reference — become the explainer in `README.md`
- **the glossary** becomes `CONTEXT.md`

Nothing else. Lessons, quizzes and learning records stay in the temp directory.

## The writing contract

**Structure is fixed, length is not** — the problem, the technique, the pitfalls. A fixed structure resists drift better than a word ceiling, and a demo that needs 200 words should not be padded to 400 nor one that needs 600 be truncated.

**It names the technique and its APIs; it never walks the code.** No line numbers, no local variable names, no "the file X does Y". Same principle as the one-liner: what cannot be checked mechanically is at least made hard to write wrong.

**Every identifier the prose puts in backticks must appear somewhere in the example's `src/`.** This is looser than the check on `apis`, deliberately — `apis` is a list of library APIs, so an entry that is not _imported_ has no business there, whereas prose may legitimately name the demo's own components (`Aquarium`, `Turtle`) and its props (`stencil` in `gl={{ stencil: true }}`).

It is also what keeps the prose from rotting, and it is checkable by concatenation and search — no import parsing, no package resolution. `useMask` disappears in a drei migration and the rule fires on precisely the explainers that named it, and on no others; a prettier sweep never wakes it. And it reaches further than renames — in a declarative r3f scene the technique _is_ the set of components used, so an explainer saying "the spheres are instanced" names `Instances`, and the day instancing goes, the identifier goes with it.

**No `CONTEXT.md` that merely restates the README.** The glossary holds terms genuinely local to this demo; the README explains the technique. If the only content would be a paraphrase, the file should not exist.

## Then the bare pass

Write `description` and `apis` last, from the same distillation — not from a second reading of the source. They are the compression of what the passes established, and deriving them separately is how the one-liner and the explainer end up describing two different demos.

Everything in [SKILL.md](./SKILL.md) still holds: propose before writing, one example per run, and `pnpm lint:metadata` before you are done.
