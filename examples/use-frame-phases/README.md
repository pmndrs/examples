[![Static](https://img.shields.io/badge/example-%23646CFF.svg?logo=html5&logoColor=white)](https://pmndrs.github.io/examples/use-frame-phases)
[![CodeSandbox](https://img.shields.io/badge/codesandbox-040404?logo=codesandbox&logoColor=DBDBDB)](https://codesandbox.io/s/github/pmndrs/examples/tree/main/examples/use-frame-phases)
[![Stackblitz](https://img.shields.io/badge/stackblitz-fff?logo=Stackblitz&logoColor=1389FD)](https://stackblitz.com/github/pmndrs/examples/tree/main/examples/use-frame-phases)

```sh
$ npx degit pmndrs/examples/examples/use-frame-phases
```

![](thumbnail.webp)

Why a follow camera has to run after interpolation. Physics steps at 15 Hz in the fixed physics phase, an update job interpolates it, and a custom camera phase follows. Swap the two and watch the camera stutter.

Built on React Three Fiber v10 (alpha), which renders with WebGPU. Where the browser has no WebGPU, three's WebGPURenderer falls back to WebGL 2.
