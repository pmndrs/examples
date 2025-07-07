index: [demos](demos)

To use a given [`basic-demo`](demos/basic-demo) as a template for a new `myproject`:

```sh
git clone https://github.com/pmndrs/examples.git
cd examples
cd demos/basic-demo
```

# INSTALL

```sh
npm ci

```

# dev

```sh
$ npm ci
$ npm run build
```

# build

```sh
$ npm ci
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
> This is totally fine `BASE_PATH`/`BASE_URL` to be unset/empty. But for debug purposes(to be 1:1 with GitHub pages) you can:
>
> ```sh
> $ BASE_PATH=/examples BASE_URL=http://localhost:4000 npm run build
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

For generating reproductible snapshots, we use [`mcr.microsoft.com/playwright:v1.45.3-jammy`](https://playwright.dev/docs/docker#image-tags) Docker image.

```sh
$ docker run -it --rm  \
  -w /app -v "$(pwd)":/app -v /app/node_modules \
  mcr.microsoft.com/playwright:v1.45.3-jammy /bin/sh
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
  mcr.microsoft.com/playwright:v1.45.3-jammy /bin/sh -c "npm ci && npm test -- -- --update-snapshots"
```

# Colophon

- https://docs.pmnd.rs/react-three-fiber/getting-started/examples
