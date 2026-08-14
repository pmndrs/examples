# Pilot — 19/20 (95%)

The "after" number, measured on eight examples described under the contract
(#198). The baseline it is read against is [baseline.md](./baseline.md), 15/20.

| What      | Value                                                           |
| --------- | --------------------------------------------------------------- |
| Score     | **19/20 (95%)**, baseline **15/20 (75%)**                       |
| Date      | 2026-08-14                                                      |
| Model     | `openai/gpt-oss-120b`, via the Vercel AI Gateway, temperature 0 |
| Index     | 167 examples, 19,370 bytes, generated from `pilot-eight`        |
| Questions | `bin/eval/questions.json`, the same 20                          |
| Command   | `node bin/build-llms.mjs && node bin/eval.mjs`                  |

## The comparison is not all else equal

`baseline.md` says it was taken "while every description in the gallery is
still the one it shipped with", and that is no longer true of `aquarium`: it was
written before this pilot, as the case the skill and the explainer were built
on. One of the baseline's five misses is its question. So the four questions
that flipped do not all belong to these eight lines:

| Asked for                                | Baseline                    | Now                    | Whose         |
| ---------------------------------------- | --------------------------- | ---------------------- | ------------- |
| a glass tank you can see objects inside  | `transparent-aesop-bottles` | `aquarium`             | not the pilot |
| a camera travelling through a doorway    | `camera-scroll`             | `pass-through-portals` | the pilot     |
| a third-person character controller      | _no example named_          | `ecctrl-fisheye`       | the pilot     |
| click a part, outline it, frame it       | `react-pp-outlines`         | `react-pp-outlines`    | still missed  |
| a glass ornament, bloomed and LUT-graded | `color-grading`             | `glass-flower`         | the pilot     |

**+1 to `aquarium`, +3 to the pilot.** And the `aquarium` point is the softest
of the four: `baseline.md` records an aborted earlier pass that answered that
question correctly on the _old_ index, so some of it is noise. The pilot's three
are not — the baseline puts the run-to-run swing at ±1, and three is past it.

The fifteen controls all held. Nothing that worked before stopped working.

## The miss that stayed a miss is the result

`faucets-select-highlight` was left out of the eight on purpose, while the four
other misses were taken. It is still empty, and the model still answers
`react-pp-outlines` — a described near neighbour — exactly as it did before.

That is what separates "the index got better" from "the eval got easier". Had
the sample covered all five misses, 20/20 would have proved nothing except that
the questions were answerable by the examples chosen from their answers.

## Two runs, because one line went back

The first run scored 19/20 with `transparent-aesop-bottles` rewritten. The line
was then reverted to its author's, and the second run — the one recorded above,
and the one matching the commit — scored 19/20 again.

The only difference: "how do I do refractive glass?" answers
`transparent-aesop-bottles` on the author's line and `diamond-refraction` on the
rewrite. Both are in `expected`, so it is a hit either way. The rewrite moved no
question, which is the answer to the slot that asked for it.

## What is not measured

Five of the eight lines are touched by no question: `water-shader`,
`react-ellipsecurve`, `ssgi-spheres-with-rapier-physics`, `bubbles` and
`transparent-aesop-bottles`. Twenty questions cannot cover 170 examples, and
adding questions aimed at the examples just described would measure nothing.
The eval says the empty lines were the problem; it does not, and cannot, say
these five lines are good.

## Rerunning it

```sh
node bin/build-llms.mjs   # llms.txt is generated, and gitignored
node bin/eval.mjs
```

Expect ±1, and expect it to take fifteen to twenty minutes: the gateway's free
tier answers a handful of questions and then rate-limits, and each 429 costs a
60-second backoff. A workspace with credits never waits. The score is only
comparable within one model — see the last section of `baseline.md`.

This file is temporary, on the same terms as `baseline.md`: it goes when
`bin/eval.mjs` goes, and the decision it argues for outlives it in #198.
