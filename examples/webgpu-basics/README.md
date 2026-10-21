[![Static](https://img.shields.io/badge/example-%23646CFF.svg?logo=html5&logoColor=white)](https://pmndrs.github.io/examples/webgpu-basics)
[![CodeSandbox](https://img.shields.io/badge/codesandbox-040404?logo=codesandbox&logoColor=DBDBDB)](https://codesandbox.io/s/github/pmndrs/examples/tree/main/examples/webgpu-basics)
[![Stackblitz](https://img.shields.io/badge/stackblitz-fff?logo=Stackblitz&logoColor=1389FD)](https://stackblitz.com/github/pmndrs/examples/tree/main/examples/webgpu-basics)

```sh
$ npx degit pmndrs/examples/examples/webgpu-basics
```

![](thumbnail.webp)

The smallest React Three Fiber v10 scene on WebGPU. Three planes with TSL color and position nodes, an environment preset set straight on the Canvas background, and a hover that springs a uniform toward a third color.

Built on React Three Fiber v10 (alpha), which renders with WebGPU. Where the browser has no WebGPU, three's WebGPURenderer falls back to WebGL 2.
