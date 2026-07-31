# AGENTS.md

## Agent skills

### Issue tracker

Issues are tracked on GitHub (pmndrs/examples) via the `gh` CLI; external PRs are a triage surface. See `docs/agents/issue-tracker.md`.

### Triage labels

Canonical vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` + `docs/adr/` at the repo root (created lazily by `/domain-modeling`). See `docs/agents/domain.md`.

### UI components

`apps/website` has Tailwind v4 + shadcn/ui set up (style `radix-maia`, base colour `neutral`, icons `lucide`). The vendored `shadcn` skill in `.claude/skills/shadcn/` is the source of truth for adding, updating and styling components — use it, and run the `shadcn` CLI rather than hand-writing registry files.

Two things to know before styling:

- **The site's own components are not on Tailwind.** `Nav`, `Info`, `Social`, `Dev` and `ScaledDemoFrame` still style themselves with scoped CSS injected through `<Style>` (`@scope { … }`). That's deliberate, not a half-finished migration. Tailwind classes are for `components/ui/*` and new work; leave the `@scope` blocks alone unless you're converting a component wholesale. Inline `<style>` is unlayered, so those rules outrank Preflight and keep winning.
- **Sources are declared explicitly.** Tailwind's automatic source detection finds nothing in this app, so `app/globals.css` lists `@source` entries. Add one if you put components somewhere new.

`demos/` is deliberately Tailwind-free; don't introduce it there.
