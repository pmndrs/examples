# Examples

https://docs.pmnd.rs/react-three-fiber/getting-started/examples

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

<details>

This will:

1. execute `^build2` which will `vite build` each `demos/*` with:
  - a `--base` set to `${BASE_PATH}/${app_name}`
  - a custom vite `--config`, whith a `monkey()` plugin that will:
    - [`deterministic`](packages/examples/src/deterministic.js) script into `src/index.jsx`
    - monkeypatch the `<Canvas>` with [`CheesyCanvas`](packages/examples/src/CheesyCanvas.jsx) for setting up the scene for playwright screenshots
2. build the Next.js `apps/website`
3. copy final result into `out` folder

NB: `BASE_PATH` can be unset/empty.

</details>

Then `npx serve out`.

# test

Pre-requisites:

- [build](#build)

```sh
$ docker run --init --rm -v $(pwd):/app -w /app ghcr.io/pmndrs/playwright:main npm test
```

> [!IMPORTANT]
> If running on mac m-series, you'll need to add `--platform linux/arm64` to the docker command.
