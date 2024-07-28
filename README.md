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

<details>

This will:

1. execute `^build2` which will `vite build` each `demos/*` with:

- a `--base` set to `${BASE_PATH}/${app_name}`
- a custom vite `--config`, whith a `monkey()` plugin that will:
  - [`deterministic`](packages/examples/src/deterministic.js) script into `src/index.jsx`
  - monkeypatch the `<Canvas>` with [`CheesyCanvas`](packages/examples/src/CheesyCanvas.jsx) for setting up the scene for playwright screenshots

2. build the Next.js `apps/website`
3. copy final result into `out` folder

> [!TIP]
> This is totally fine `BASE_PATH` to be unset/empty. But for debug purposes(to be 1:1 with GitHub pages) you can:
>
> ```sh
> $ BASE_PATH=/examples npm run build
> ```

</details>

Then `npx serve out`.

# test

Pre-requisites:

- [build](#build)

```sh
$ npm test
```

To update the snapshots: `npm test -- -- --update-snapshots`

> [!IMPORTANT]
> If you built the project with eg. `BASE_PATH=/examples` you'll need to:
>
> ```sh
> $ BASE_PATH=/examples npm test
> ```

## Docker

For reproductible snapshots, we use docker to run the tests:

```sh
$ ./docker.sh
```

To update the snapshots: `./docker.sh --update`

> [!IMPORTANT]
> If you built the project with eg. `BASE_PATH=/examples` you'll need to:
>
> ```sh
> $ BASE_PATH=/examples ./docker.sh
> ```

# Colophon

- https://docs.pmnd.rs/react-three-fiber/getting-started/examples
