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

Pre-requisites:

- [build](#build)

> [!WARNING]
> Do not forget to (re-)[build](#build) first!

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

For generating reproductible snapshots, we still build static `out/` folder locally, but use dockerised environment to run playwright tests against:

```sh
$ ./test.sh
```

> [!NOTE]
> A `-v "$(pwd)":/app` volume is mounted to the container, so any snapshot will be written to the host machine.

To update the snapshots: `./test.sh --update`

> [!IMPORTANT]
> If you built the project with eg. `BASE_PATH=/examples` you'll need to:
>
> ```sh
> $ BASE_PATH=/examples ./test.sh
> ```

# Colophon

- https://docs.pmnd.rs/react-three-fiber/getting-started/examples
