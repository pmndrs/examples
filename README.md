# Examples

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

Then `npx serve out`.

# test

Pre-requisites:

- [build](#build)

```sh
$ docker run --init --rm -v $(pwd):/app -w /app ghcr.io/pmndrs/playwright:main npm test
```

> [!IMPORTANT]
> If running on mac m-series, you'll need to add `--platform linux/arm64` to the docker command.
