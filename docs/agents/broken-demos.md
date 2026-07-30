# Broken demos: prod monitoring & maintainer notifications

## Maintainers

Every demo declares its maintainers in `demos/<name>/pmndrs.json`:

```json
"maintainers": ["abernier"]
```

- Bare GitHub logins (no `@`), validated by `schemas/pmndrs.schema.json` and
  `pnpm lint:metadata`.
- The field is required; `[]` means "nobody to ping" — the demo still shows up
  in the rollup issue, without mentions.
- To adopt a demo, add your login and open a PR.

## CI behavior

Only demos with a `"test": "e2e-test ..."` script are monitored (see
`packages/e2e`).

- **PRs**: `pnpm test` fails fast — a broken demo blocks the PR. Unchanged.
- **main (prod)**: `turbo test --continue=dependencies-successful --summarize`
  plays **all** tests. The step is `continue-on-error`: build + Pages deploy
  proceed even with broken demos (one broken demo must not freeze the site),
  and `e2e-status-job` mirrors the outcome so the run still goes **red**.
  Trade-off: a visual regression caught by snapshots IS deployed until fixed.
- A demo is **broken** when its `build2` or `test` task exits non-zero.
- Flakes: playwright retries twice in CI (`packages/e2e/playwright.config.ts`);
  only a test failing 3 times in a row counts.
- Snapshot-regen runs (`workflow_dispatch` + `update_snapshots`) never notify.

## One issue per broken demo

`bin/notify-broken-demos.mjs` (unit-tested logic in `bin/lib/broken-demos.mjs`,
`pnpm test:unit`) maintains one issue per broken demo, labeled `broken-demos`,
on every push to main:

- Each issue is tied to its demo by a hidden `<!-- broken-demo:<name> -->`
  marker in the body. The set of open `broken-demos` issues IS the previous
  state — there is no other state store.
- **Body** = latest failing run: demo link, maintainers, run link. Refreshed
  on every failing run.
- **Delta-only notifications**: maintainers are @mentioned only when their
  demo goes green→broken — via the body at issue creation, or a comment on
  reopen (editing a body never notifies, comments do). A still-broken demo
  stays silent.
- **Lifecycle**: closes itself (with a no-mention note) when its demo is
  green again, reopens the same thread on the next failure.

Local debugging: `DRY_RUN=1 node bin/notify-broken-demos.mjs` prints the
broken list from the newest `.turbo/runs/*.json` without touching GitHub.
