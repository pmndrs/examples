[![Static](https://img.shields.io/badge/example-%23646CFF.svg?logo=html5&logoColor=white)](https://pmndrs.github.io/examples/webgpu-motion-blur)
[![CodeSandbox](https://img.shields.io/badge/codesandbox-040404?logo=codesandbox&logoColor=DBDBDB)](https://codesandbox.io/s/github/pmndrs/examples/tree/main/examples/webgpu-motion-blur)
[![Stackblitz](https://img.shields.io/badge/stackblitz-fff?logo=Stackblitz&logoColor=1389FD)](https://stackblitz.com/github/pmndrs/examples/tree/main/examples/webgpu-motion-blur)

```sh
$ npx degit pmndrs/examples/examples/webgpu-motion-blur
```

![](thumbnail.webp)

Per-object motion blur from a velocity MRT, set up with useRenderPipeline. An animated character and spinning tori show the effect; toggle it and tune the amount from Leva. Based on three.js webgpu_postprocessing_motion_blur.

Built on React Three Fiber v10 (alpha), which renders with WebGPU. Where the browser has no WebGPU, three's WebGPURenderer falls back to WebGL 2.
