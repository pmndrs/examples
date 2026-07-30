# AGENTS.md

## Agent skills

### Issue tracker

Issues are tracked on GitHub (pmndrs/examples) via the `gh` CLI; external PRs are a triage surface. See `docs/agents/issue-tracker.md`.

### Triage labels

Canonical vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Broken demos & maintainers

Each demo's `pmndrs.json` declares `maintainers` (GitHub logins). On main, CI plays all e2e tests and maintains one `broken-demos` issue per broken demo, @mentioning its maintainers on green→broken. See `docs/agents/broken-demos.md`.

### Domain docs

Single-context: one `CONTEXT.md` + `docs/adr/` at the repo root (created lazily by `/domain-modeling`). See `docs/agents/domain.md`.
