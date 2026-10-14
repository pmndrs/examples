# AGENTS.md

## Agent skills

### Issue tracker

Issues are tracked on GitHub (pmndrs/examples) via the `gh` CLI; external PRs are a triage surface. See `docs/agents/issue-tracker.md`.

### Triage labels

Canonical vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Example tags

Closed vocabulary, held as the `enum` on `tags` in `schemas/pmndrs.schema.json` — the same treatment `libraries` gets, and `bin/validate-pmndrs-metadata.mjs` reads both lists out of that file. An unknown tag fails `pnpm lint:metadata`, and every example carries at least one.

Closed because a tag is a filter: the badges on the example page and the cards set `?tag=`, so a misspelt tag is a pill that returns nothing rather than a cosmetic slip. The cost is a line in the schema for each new term — paid in the same pull request as the example that needs it, and the editor offers the list while you type, since every `pmndrs.json` points `$schema` at that file.

One axis: the technique. Not what the scene depicts (`arkanoid`, `minecraft`, a brand) — the title and the description already say that — and not the API that implements it (`MeshReflectorMaterial`, `useAnimations`), which the source does. `reflections`, not `meshreflectormaterial`.

Form is kebab-case and lower-case. Between a singular and a plural, the form the catalog already carries more often wins, and a tie goes to the singular — which is why it is `shader` and `animation` but `reflections` and `particles`.

### Domain docs

Single-context: one `CONTEXT.md` + `docs/adr/` at the repo root (created lazily by `/domain-modeling`). See `docs/agents/domain.md`.

### UI components

`apps/website` has Tailwind v4 + shadcn/ui, initialised from the pmndrs preset `b1VlIttI`: style `base-luma` — the Base UI half of the registry, so the primitives are `@base-ui/react` and composition is the `render` prop, not `asChild` — base colour `neutral`, icons `lucide`. The vendored `shadcn` skill in `.claude/skills/shadcn/` is the source of truth for adding, updating and styling components — use it, and run the `shadcn` CLI rather than hand-writing registry files.

**Components come from the CLI, never from a fetch.** `pnpm dlx shadcn@latest add <component>` ([docs](https://ui.shadcn.com/docs/cli)) — it resolves the registry for our `style`/`baseColor`/`iconLibrary`, pulls transitive components, and writes to the aliases in `components.json`. Never copy a component out of the docs site, `curl` a registry JSON, or hand-write a file into `components/ui/`: those bypass the preset and drift from what `shadcn@latest info` reports as installed. Reading the docs for a component's API is fine — installing from them is not.

**`components/ui/*` is vendored, not ours — never edit it, and never delete one either.** Those files must stay what the registry emits (modulo `prettier`, which the repo runs over everything), so that `shadcn@latest add <component> --overwrite` is always a safe no-op and any of them can be swapped for the stock version tomorrow. If a component doesn't do what you need, the fix goes at the call site — `className` for layout, the built-in `variant`/`size` props for looks, composition (wrap it, or hand it a `render` element) for behaviour — or into the theme tokens in `app/globals.css`. Never into the component file. If you genuinely cannot express it from outside, write your own component next to it under `components/` rather than forking the vendored one.

Two corollaries, both learned the hard way while moving the registry from Radix to Base UI:

- **A prop the wrapper doesn't forward is not a reason to add it.** The registry picks a subset of the primitive's props on purpose. Drop the call that needed the extra prop and take the component's default instead — a positioner default that differs by 7px is not worth a file that `--overwrite` will silently revert.
- **"Replace it with our own markup" is still touching it.** Swapping a vendored component out of a call site because its Base UI behaviour differs from the Radix one — and deleting the file once nothing imports it — leaves the same hole: the next `add` brings back a component nobody uses, and the behaviour that was tuned lives in hand-rolled markup instead. Reach for the component's own data attributes from the call site first (`data-hovering`, `data-scrolling`, `data-open`, …); they are the API for exactly this.

**Re-applying the preset re-adds every component.** Run from `apps/website`:

```sh
pnpm dlx shadcn@latest init --preset b1VlIttI --force --no-reinstall
pnpm dlx shadcn@latest add --overwrite $(ls components/ui | sed 's/\.tsx$//')
```

Keep what lands in `components.json` and `components/ui/`, and discard everything else the init writes:

- its rewrite of `app/globals.css`, and its bump of `shadcn` — the preset carries radius and typography, never the colours, and the golden test (below) has to pass untouched;
- `lib/utils.ts`, a one-line re-export of `cn` that nothing needs. The registry's components import `cn` from the `cn` package, and `add` writes them the same way without that file. Our own call sites do too: `import { cn } from "cn"`, not the `@/lib/utils` the vendored shadcn skill shows.

Before styling:

- **The whole app is on Tailwind.** There is no `<Style>` component and no `@scope` block left anywhere in `apps/website` — every rule is a utility at its call site, a `components/ui/*` variant, or a token in `app/globals.css`. Don't reintroduce injected `<style>`: it lands unlayered, so it outranks Preflight _and_ every utility, and a rule that always wins is a rule nobody can override from a call site. The two things utilities can't express — the source-of-truth palette, and Preflight itself — already have homes in `globals.css`.
- **Sources are declared explicitly.** Tailwind's automatic source detection finds nothing in this app, so `app/globals.css` lists `@source` entries. Add one if you put components somewhere new.
- **A repeated group of controls is one tab stop, not N.** `hooks/use-roving-tabindex.ts` gives the example list and the example bar a roving tabindex — arrows move within the group, Tab moves past it. The whole site is six tab stops; if you add a control, check it is not a seventh hiding inside one of those groups. Hand the hook the container's ref and spread what it returns.

`examples/` is deliberately Tailwind-free; don't introduce it there.

### Design system

The site takes its colours, monospace and logo from [pmndrs/design-system](https://github.com/pmndrs/design-system), as its defaults, pinned to the tag `v0.7.0`. Two items, each installed from `apps/website` with the `shadcn` CLI:

```sh
pnpm dlx shadcn@latest add pmndrs/design-system/theme#v0.7.0
pnpm dlx shadcn@latest add pmndrs/design-system/logo#v0.7.0
```

- `theme` — the pmndrs palette, baked: every `--md-sys-color-*` role, light and dark, written into the `:root` and `.dark` blocks of `app/globals.css`. It pulls two items of the same tag:
  - `md3-base` — the `material-theme-builder` range, its Tailwind plugin and its shadcn mapping in `globals.css`, and the seed in `lib/md3.ts`. The site never calls the seed: the palette is already baked, so its `THEME_*` env vars reseed nothing here.
  - `font-mono` — Inconsolata through `next/font/google` as `--font-mono` on `<html>` in `layout.tsx`, and `code, kbd, samp, pre` set in `font-mono` in `globals.css`.
- `logo` — the four SVGs in `public/pmndrs/`; the favicon is `logo_idle.svg`, set in `layout.tsx`'s metadata.

**Installed files are registry output, like `components/ui/*` — never edit them.** `lib/md3.ts`, `public/pmndrs/*` and the baked roles in `globals.css` stay what the items emit, so the next `add` is a clean overwrite; `lib/md3.ts` is even prettier-ignored, to stay byte-identical. The shadcn tokens read the roles through the shared `material-theme-builder/shadcn.css`, untouched.

The one colour of the site's own is `--new` / `--new-foreground`, the "new" badge: two literals in their own `:root` block in `globals.css`, since none of the design system's colours is meant for it.

**Bumping the pin is one `add` per item, with `--overwrite`.** From `apps/website`, `<tag>` being the new tag:

```sh
pnpm dlx shadcn@latest add pmndrs/design-system/theme#<tag> --overwrite
pnpm dlx shadcn@latest add pmndrs/design-system/logo#<tag> --overwrite
pnpm exec turbo test --filter=website
```

Review what the `add`s changed in our own files, and keep only the new release's values. `theme` re-applies `md3-base` and `font-mono` every time, so discard what they write twice: a second `material-theme-builder/shadcn.css` import and `code, kbd, samp, pre` block in `globals.css`, the Inconsolata call in `layout.tsx` rewritten without `subsets` (ours, keep it), and the `material-theme-builder` range in `package.json` and the lockfile bumped to the installed version. Then update the tag here. Change a value in `packages/e2e/website/golden.ts` only when the release is meant to move it, in the same commit; any other diff is a regression.

**The golden test is how a change here is verified.**

```sh
pnpm exec turbo test --filter=website
```

It builds the site, serves the static export, and reads every token the browser computes against `packages/e2e/website/golden.ts`, plus the favicon and the `code` face. Its port is hashed from the name `website`, so it is the same in every checkout: two runs from two worktrees at once collide on it, and one fails. Run them one after the other.
