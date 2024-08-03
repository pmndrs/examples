![ci badge](https://github.com/pmndrs/examples/actions/workflows/ci.yml/badge.svg?branch=main)

index: [demos](demos)

To use a given [`basic-demo`](demos/basic-demo) as a template for a new `myproject`:

```sh
$ npx -y degit pmndrs/examples/demos/basic-demo myproject
$ code myproject
```

# INSTALL

```sh
$ npm ci
```

# dev

```sh
$ npm run -w demos/cards-with-border-radius dev
```

# build

```sh
$ npm run build
```

Then `npx serve out`.

<details>

This will:

1. execute `^build2` which will `vite build` each `demos/*` with:

- a `--base` set to `${BASE_PATH}/${app_name}`
- a custom vite `--config`, whith a `monkey()` plugin that will:
  - [`deterministic`](packages/e2e/src/deterministic.js) script into `src/index.jsx`
  - monkeypatch the `<Canvas>` with [`CheesyCanvas`](packages/e2e/src/CheesyCanvas.jsx) for setting up the scene for playwright screenshots

2. build the Next.js `apps/website`
3. copy final result into `out` folder

> [!TIP]
> This is totally fine `BASE_PATH`/`PUBLIC_URL` to be unset/empty. But for debug purposes(to be 1:1 with GitHub pages) you can:
>
> ```sh
> $ BASE_PATH=/examples PUBLIC_URL=http://localhost:4000 npm run build
> $ npx serve out -p 4000
> ```

</details>

# test

```sh
$ npm test
```

To update the snapshots: `npm test -- -- --update-snapshots`

<details>

You can also:

```sh
$ BASE_PATH=/examples npm test
```

</details>

## Docker

For generating reproductible snapshots, we use [`ghcr.io/pmndrs/playwright:main`](https://github.com/pmndrs/playwright/pkgs/container/playwright/249720592?tag=main) Docker image.

```sh
$ docker run -it --rm  \
  -w /app -v "$(pwd)":/app -v /app/node_modules \
  ghcr.io/pmndrs/playwright:main /bin/sh
#
# echo "Hey, I am acting like the CI"
#
# npm ci
# npm test
```

or in one command to update snapshots:

```sh
docker run --rm  \
  -w /app -v "$(pwd)":/app -v /app/node_modules \
  ghcr.io/pmndrs/playwright:main /bin/sh -c "npm ci && npm test"
```

# Colophon

- https://docs.pmnd.rs/react-three-fiber/getting-started/examples
