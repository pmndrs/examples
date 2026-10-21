[![Static](https://img.shields.io/badge/example-%23646CFF.svg?logo=html5&logoColor=white)](https://pmndrs.github.io/examples/webgpu-multi-canvas)
[![CodeSandbox](https://img.shields.io/badge/codesandbox-040404?logo=codesandbox&logoColor=DBDBDB)](https://codesandbox.io/s/github/pmndrs/examples/tree/main/examples/webgpu-multi-canvas)
[![Stackblitz](https://img.shields.io/badge/stackblitz-fff?logo=Stackblitz&logoColor=1389FD)](https://stackblitz.com/github/pmndrs/examples/tree/main/examples/webgpu-multi-canvas)

```sh
$ npx degit pmndrs/examples/examples/webgpu-multi-canvas
```

![](thumbnail.webp)

Four canvases, one WebGPU device. The primary canvas owns the renderer and the others share it, each on its own frame rate, and a 5 fps HUD redraws the primary's scene from above with an orthographic camera.

Built on React Three Fiber v10 (alpha), which renders with WebGPU. Where the browser has no WebGPU, three's WebGPURenderer falls back to WebGL 2.
