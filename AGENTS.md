# AGENTS.md

## Agent skills

### Issue tracker

Issues are tracked on GitHub (pmndrs/examples) via the `gh` CLI; external PRs are a triage surface. See `docs/agents/issue-tracker.md`.

### Triage labels

Canonical vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` + `docs/adr/` at the repo root (created lazily by `/domain-modeling`). See `docs/agents/domain.md`.

### UI components

`apps/website` has Tailwind v4 + shadcn/ui set up (style `base-maia` — the Base UI half of the registry, so the primitives are `@base-ui/react` and composition is the `render` prop, not `asChild` — base colour `neutral`, icons `lucide`). The vendored `shadcn` skill in `.claude/skills/shadcn/` is the source of truth for adding, updating and styling components — use it, and run the `shadcn` CLI rather than hand-writing registry files.

**Components come from the CLI, never from a fetch.** `pnpm dlx shadcn@latest add <component>` ([docs](https://ui.shadcn.com/docs/cli)) — it resolves the registry for our `style`/`baseColor`/`iconLibrary`, pulls transitive components, and writes to the aliases in `components.json`. Never copy a component out of the docs site, `curl` a registry JSON, or hand-write a file into `components/ui/`: those bypass the preset and drift from what `shadcn@latest info` reports as installed. Reading the docs for a component's API is fine — installing from them is not.

**`components/ui/*` is vendored, not ours — never edit it, and never delete one either.** Those files must stay what the registry emits (modulo `prettier`, which the repo runs over everything), so that `shadcn@latest add <component> --overwrite` is always a safe no-op and any of them can be swapped for the stock version tomorrow. If a component doesn't do what you need, the fix goes at the call site — `className` for layout, the built-in `variant`/`size` props for looks, composition (wrap it, or hand it a `render` element) for behaviour — or into the theme tokens in `app/globals.css`. Never into the component file. If you genuinely cannot express it from outside, write your own component next to it under `components/` rather than forking the vendored one.

Two corollaries, both learned the hard way while moving the registry from Radix to Base UI:

- **A prop the wrapper doesn't forward is not a reason to add it.** The registry picks a subset of the primitive's props on purpose. Drop the call that needed the extra prop and take the component's default instead — a positioner default that differs by 7px is not worth a file that `--overwrite` will silently revert.
- **"Replace it with our own markup" is still touching it.** Swapping a vendored component out of a call site because its Base UI behaviour differs from the Radix one — and deleting the file once nothing imports it — leaves the same hole: the next `add` brings back a component nobody uses, and the behaviour that was tuned lives in hand-rolled markup instead. Reach for the component's own data attributes from the call site first (`data-hovering`, `data-scrolling`, `data-open`, …); they are the API for exactly this.

**The colour tokens are Material Design 3.** Every shadcn token in `app/globals.css` reads an `--md-sys-color-*` role, and [`material-theme-builder`](https://github.com/abernier/material-theme-builder) derives all of them from one source hex. Retuning the palette means changing `MCU_SOURCE` in `app/layout.tsx` — or the `scheme` / `contrast` / core-colour overrides in the `builder()` call next to it — never editing a token by hand. The site runs `scheme: "monochrome"`, which derives every role from the source's _tone_ alone and discards its hue: the chrome is greyscale on purpose, so that the only colour on a example page is the example. `MCU_SOURCE` still matters — swap the scheme and the mint comes straight back. Anything the m3 roles don't cover belongs in that call's `customColors`, which mints `--md-sys-color-<name>` and a matching `-on-` foreground.

**It has to stay a build-time call.** `layout.tsx` is a server component, so `builder(...).toCss()` runs once at build and the CSS ships inside the prerendered HTML. Don't move it into a client component, and don't reach for the package's `<Mcu>`: this app is `output: "export"`, so the browser paints the whole page well before hydration, and anything that supplies the colours later gives you a frame with none of them. Verify a change here by grepping the built `out/index.html` for `--md-sys-color-surface:` — not just by looking at the running app, where hydration hides the gap.

Two things to know before styling:

- **The whole app is on Tailwind.** There is no `<Style>` component and no `@scope` block left anywhere in `apps/website` — every rule is a utility at its call site, a `components/ui/*` variant, or a token in `app/globals.css`. Don't reintroduce injected `<style>`: it lands unlayered, so it outranks Preflight _and_ every utility, and a rule that always wins is a rule nobody can override from a call site. The two things utilities can't express — the source-of-truth palette, and Preflight itself — already have homes in `globals.css`.
- **Sources are declared explicitly.** Tailwind's automatic source detection finds nothing in this app, so `app/globals.css` lists `@source` entries. Add one if you put components somewhere new.
- **A repeated group of controls is one tab stop, not N.** `hooks/use-roving-tabindex.ts` gives the example list and the example bar a roving tabindex — arrows move within the group, Tab moves past it. The whole site is six tab stops; if you add a control, check it is not a seventh hiding inside one of those groups. Hand the hook the container's ref and spread what it returns.

`examples/` is deliberately Tailwind-free; don't introduce it there.
