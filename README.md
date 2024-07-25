![ci badge](https://github.com/pmndrs/examples/actions/workflows/ci.yml/badge.svg?branch=main)

https://docs.pmnd.rs/react-three-fiber/getting-started/examples

index: [apps](apps)

To use a given [`basic-demo`](apps/basic-demo) as a template for a `new-project`:

```sh
$ npx -y degit pmndrs/examples/apps/basic-demo new-project
$ code new-project
```

# INSTALL

```sh
$ npm ci
```

# dev

```sh
$ npm run -w apps/cards-with-border-radius dev
```

# build

```sh
$ npm run build
```

<details>

This will execute `^build2` which will `vite build` each app with:

- a `--base` set to `/examples/${app_name}`
- a custom vite `--config`, whith a `monkey()` plugin that will:
  - [`deterministic`](packages/examples/src/deterministic.js) script into `src/index.jsx`
  - monkeypatch the `<Canvas>` with [`CheesyCanvas`](packages/examples/src/CheesyCanvas.jsx) for setting up the scene for playwright screenshots

</details>

Then `npx serve out`.

<details>

You can build a specific app thanks to [`--filter`](https://turbo.build/repo/docs/reference/run#--filter-string):

```sh
$ npm run build -- --filter aquarium
```

</details>

# test

Pre-requisites:

- [build](#build)

```sh
$ docker run --init --rm -v $(pwd):/app -w /app ghcr.io/pmndrs/playwright:main npm test
```

> [!IMPORTANT]
> If running on mac m-series, you'll need to add `--platform linux/arm64` to the docker command.
