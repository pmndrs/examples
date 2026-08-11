index: [examples](examples)

To use a given [`basic-example`](examples/basic-example) as a template for a new
`myproject`:

```sh
$ npx degit pmndrs/examples/examples/basic-example myproject
$ code myproject
```

## Example metadata

Every example has a `pmndrs.json` file containing the catalog metadata used by the
website:

```json
{
  "$schema": "../../schemas/pmndrs.schema.json",
  "title": "Basic Example",
  "description": "Shows how to form self-contained components with their own state and user interaction.",
  "tags": ["interaction", "pointer-events"],
  "authors": [],
  "source": "https://codesandbox.io/s/rrppl0y8l4",
  "libraries": ["@react-three/fiber", "@react-three/drei"],
  "assets": []
}
```

Use package names for `libraries`; each entry must also be a dependency of the
example. `publishedAt` is optional and uses `YYYY-MM-DD` when the original
publication date is known. Add externally sourced models, textures, fonts,
audio, and other assets to `assets` with their creator, source, and license when
available.

Run `pnpm lint:metadata` to validate every metadata file.

# INSTALL

Prerequisites:

- Install [nvm](https://github.com/nvm-sh/nvm) - Node Version Manager, then:

  ```bash
  $ nvm install
  $ nvm use
  $ node -v # make sure your version satisfies package.json#engines.node
  ```

  nb: if you want this node version to be your default nvm's one:
  `nvm alias default node`

```
$ pnpm install
```

# dev

```sh
$ pnpm dev
```

# build

```sh
$ pnpm build
```

NB: `pnpm build --force` to ignore turbo cache

Then `npx serve out`.

<details>

This will:

1. execute `^build2` which will `vite build` each `examples/*` with:

- a `--base` set to `${BASE_PATH}/${app_name}`
- a custom vite `--config`, whith a `monkey()` plugin that will:
  - [`deterministic`](packages/e2e/src/deterministic.js) script into
    `src/index.jsx`
  - monkeypatch the `<Canvas>` with
    [`CheesyCanvas`](packages/e2e/src/CheesyCanvas.jsx) for setting up the scene
    for playwright screenshots

2. build the Next.js `apps/website`
3. copy final result into `out` folder

> [!TIP] This is totally fine `BASE_PATH`/`BASE_URL` to be unset/empty. But for
> debug purposes(to be 1:1 with GitHub pages) you can:
>
> ```sh
> $ BASE_PATH=/examples BASE_URL=http://localhost:4000 pnpm build
> $ npx serve out -p 4000
> ```

</details>

# deploy

`.github/workflows/ci.yml` publishes `main` to GitHub Pages, and uploads the same
`out` folder to Vercel for each pull request, as a preview — Vercel only hosts
it, the build always happens in the CI. Needs `VERCEL_TOKEN`, `VERCEL_ORG_ID` and
`VERCEL_PROJECT_ID` as repo secrets; a pull request from a fork cannot read them,
and gets no preview.

The preview is built with the same `BASE_PATH` as the Pages one, so it is served
from `<deployment-url>/examples` and not from the domain root — same layout as
production, and the same `build2` cache entries, which is what keeps a preview
an upload rather than a rebuild of all 167 examples.

# test

```sh
$ pnpm test
```

To update the snapshots: `pnpm test -- -- --update-snapshots`

<details>

You can also:

```sh
$ BASE_PATH=/examples pnpm test
```

</details>

## Chromatic

The same runs also archive each page — DOM, styles, assets, and the `<canvas>`
as a still — for [Chromatic](https://www.chromatic.com/docs/playwright/), which
re-renders them in its own browsers and asks a human to accept or reject what
moved. Where `pnpm test` answers "did this change?", Chromatic answers "should
it have?".

```sh
$ pnpm test          # writes examples/*/test-results/chromatic-archives/
$ pnpm chromatic     # collects them into one build and uploads it
```

Needs `CHROMATIC_PROJECT_TOKEN` (repo secret in the CI, your shell locally); a
pull request from a fork cannot read it, and gets no Chromatic build.

> [!IMPORTANT] Only the examples listed in `bin/chromatic.mjs` are published,
> today just one. A snapshot joins the list once it comes out identical from
> two runs of the same commit — most do not yet, and a build that flags a
> change nobody made is a build nobody reads. `pnpm test` still covers all
> three, at its own 5% pixel tolerance.

## Docker

For generating reproductible snapshots, we use
[`mcr.microsoft.com/playwright:v1.45.3-jammy`](https://playwright.dev/docs/docker#image-tags)
Docker image.

```sh
$ docker run -it --rm  \
  -w /app -v "$(pwd)":/app -v /app/node_modules \
  mcr.microsoft.com/playwright:v1.45.3-jammy /bin/sh
#
# echo "Hey, I am acting like the CI"
#
# pnpm install
# pnpm test
```

or in one command to update snapshots:

```sh
docker run --rm  \
  -w /app -v "$(pwd)":/app -v /app/node_modules \
  mcr.microsoft.com/playwright:v1.45.3-jammy /bin/sh -c "pnpm install && pnpm test -- -- --update-snapshots"
```

# Colophon

- https://docs.pmnd.rs/react-three-fiber/getting-started/examples
