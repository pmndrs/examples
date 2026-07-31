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

**Components come from the CLI, never from a fetch.** `pnpm dlx shadcn@latest add <component>` ([docs](https://ui.shadcn.com/docs/cli)) — it resolves the registry for our `style`/`baseColor`/`iconLibrary`, pulls transitive components, and writes to the aliases in `components.json`. Never copy a component out of the docs site, `curl` a registry JSON, or hand-write a file into `components/ui/`: those bypass the preset and drift from what `shadcn@latest info` reports as installed. Reading the docs for a component's API is fine — installing from them is not.

**`components/ui/*` is vendored, not ours — never edit it.** Those files must stay what the registry emits (modulo `prettier`, which the repo runs over everything), so that `shadcn@latest add <component> --overwrite` is always a safe no-op and any of them can be swapped for the stock version tomorrow. If a component doesn't do what you need, the fix goes at the call site — `className` for layout, the built-in `variant`/`size` props for looks, composition (wrap it, or use `asChild`) for behaviour — or into the theme tokens in `app/globals.css`. Never into the component file. If you genuinely cannot express it from outside, write your own component next to it under `components/` rather than forking the vendored one.

**The colour tokens are Material Design 3.** Every shadcn token in `app/globals.css` reads an `--md-sys-color-*` role, and [`material-theme-builder`](https://github.com/abernier/material-theme-builder) derives all of them from one source hex. Retuning the palette means changing `MCU_SOURCE` in `app/layout.tsx` — or the `scheme` / `contrast` / core-colour overrides in the `builder()` call next to it — never editing a token by hand. Anything the m3 roles don't cover belongs in that call's `customColors`, which mints `--md-sys-color-<name>` and a matching `-on-` foreground.

**It has to stay a build-time call.** `layout.tsx` is a server component, so `builder(...).toCss()` runs once at build and the CSS ships inside the prerendered HTML. Don't move it into a client component, and don't reach for the package's `<Mcu>`: this app is `output: "export"`, so the browser paints the whole page well before hydration, and anything that supplies the colours later gives you a frame with none of them. Verify a change here by grepping the built `out/index.html` for `--md-sys-color-surface:` — not just by looking at the running app, where hydration hides the gap.

Two things to know before styling:

- **The site's own components are not on Tailwind.** `Nav`, `Info`, `Social`, `Dev` and `ScaledDemoFrame` still style themselves with scoped CSS injected through `<Style>` (`@scope { … }`). That's deliberate, not a half-finished migration. Tailwind classes are for `components/ui/*` and new work; leave the `@scope` blocks alone unless you're converting a component wholesale. Inline `<style>` is unlayered, so those rules outrank Preflight and keep winning.
- **Sources are declared explicitly.** Tailwind's automatic source detection finds nothing in this app, so `app/globals.css` lists `@source` entries. Add one if you put components somewhere new.

`demos/` is deliberately Tailwind-free; don't introduce it there.
