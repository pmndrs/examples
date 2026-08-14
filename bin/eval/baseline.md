# Baseline — 15/20 (75%)

The "before" number, taken deliberately while every description in the gallery
is still the one it shipped with. Once a rewrite lands this run is not
repeatable, which is the whole reason it is recorded here rather than measured
later.

| What      | Value                                                           |
| --------- | --------------------------------------------------------------- |
| Score     | **15/20 (75%)**                                                 |
| Date      | 2026-08-14                                                      |
| Model     | `openai/gpt-oss-120b`, via the Vercel AI Gateway, temperature 0 |
| Index     | 167 examples, 18,608 bytes, generated from `main` at `74eae31d` |
| Questions | `bin/eval/questions.json`, 20 of them                           |
| Command   | `node bin/eval.mjs`                                             |

One question, one answer: the model is handed `llms.txt` and nothing else and
names the single example it would open. A hit is that name appearing in the
question's `expected`, so the score is `hits / 20`.

## The five it got wrong

| Asked for                                | Opened                                  | Expected                                |
| ---------------------------------------- | --------------------------------------- | --------------------------------------- |
| a glass tank you can see objects inside  | `transparent-aesop-bottles`             | `aquarium`                              |
| a camera travelling through a doorway    | `camera-scroll`                         | `enter-portals`, `pass-through-portals` |
| a third-person character controller      | _named no example — wrote code instead_ | `ecctrl-fisheye`                        |
| click a part, outline it, frame it       | `react-pp-outlines`                     | `faucets-select-highlight`              |
| a glass ornament, bloomed and LUT-graded | `color-grading`                         | `glass-flower`                          |

**Every miss is an example whose `description` is empty.** `aquarium`,
`enter-portals`, `pass-through-portals`, `ecctrl-fisheye`,
`faucets-select-highlight` and `glass-flower` reach the index as a directory
name plus, at best, one tag — and the reader either picks a near neighbour that
does carry words (`transparent-aesop-bottles`, `react-pp-outlines`,
`color-grading`) or gives up on the index entirely, as it did on the character
controller.

Nothing was wrong with the fifteen it got right either: those questions point at
examples that already say what they are. The index is not uniformly bad, it is
bad exactly where the prose is missing — which is the claim the rewrite is
supposed to act on, now measured instead of asserted.

Ten of the twenty questions point at an example with no description at all,
which is the population the pilot draws from — `aquarium` among them, the case
whose technique is carried by a prop rather than an import and so has to be said
in prose or not at all. That is the room the pilot has to move the number. The
other ten are the control: if they start missing, the rewrite broke something
that already worked.

## Rerunning it

```sh
node bin/build-llms.mjs   # llms.txt is generated, and gitignored
node bin/eval.mjs
```

Expect ±1 rather than an identical transcript. `temperature: 0` is the least
noise on offer, not determinism, and an aborted earlier pass on the same index
and the same model answered `aquarium` correctly for the glass-tank question
that the recorded run missed. A one-question swing is noise; the pilot has to
beat that to have shown anything.

The score is only comparable within one model. `openai/gpt-oss-120b` is the
default because it is what the gateway's free tier serves — the hosted Anthropic
and OpenAI models need credits on the workspace. With credits, pass
`--model anthropic/claude-opus-5` and take a fresh baseline before comparing
against it; do not read a run on one model against a number from another.

## This file is temporary

It records one run of a harness that is itself scaffolding. When every example
carries a description, an `apis` list and an explainer, `bin/eval.mjs` and these
records go, and `questions.json` stays. The numbers will have done their work by
then: they exist to decide whether the rewrite is worth continuing, not to be
kept as a score.
