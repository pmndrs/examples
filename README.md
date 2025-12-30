index: [demos](demos)

To use a given [`basic-demo`](demos/basic-demo) as a template for a new
`myproject`:

```sh
$ npx degit pmndrs/examples/demos/basic-demo myproject
$ code myproject
```

# INSTALL

Prerequisites:

- [Install nvm](https://github.com/nvm-sh/nvm), then:

  ```bash
  $ nvm install
  $ nvm use
  $ node -v # make sure your version satisfies package.json#engines.node
  ```

  nb: if you want this node version to be your default nvm's one:
  `nvm alias default node`

- ```sh
  $ corepack enable
  $ corepack prepare --activate # it reads "packageManager"
  $ pnpm -v # make sure your version satisfies package.json#engines.pnpm
  ```

```sh
$ pnpm install
```

# dev

```sh
$ pnpm run dev
```

# build

```sh
$ pnpm run build
```

Then `pnpm run start`.

<details>

This will:

1. execute `^build2` which will `vite build` each `demos/*` with:

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
> $ BASE_PATH=/examples BASE_URL=http://localhost:4000 npm run build
> $ npx serve out -p 4000
> ```

</details>

# test

> [!IMPORTANT]
> Testing is WIP

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
# corepack enable && pnpm install --frozen-lockfile
# pnpm test
```

or in one command to update snapshots:

```sh
docker run --rm  \
  -w /app -v "$(pwd)":/app -v /app/node_modules \
  mcr.microsoft.com/playwright:v1.45.3-jammy /bin/sh -c "corepack enable && pnpm install --frozen-lockfile && pnpm test -- -- --update-snapshots"
```

# Colophon

- https://docs.pmnd.rs/react-three-fiber/getting-started/examples
