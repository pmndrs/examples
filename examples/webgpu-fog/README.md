[![Static](https://img.shields.io/badge/example-%23646CFF.svg?logo=html5&logoColor=white)](https://pmndrs.github.io/examples/webgpu-fog)
[![CodeSandbox](https://img.shields.io/badge/codesandbox-040404?logo=codesandbox&logoColor=DBDBDB)](https://codesandbox.io/s/github/pmndrs/examples/tree/main/examples/webgpu-fog)
[![Stackblitz](https://img.shields.io/badge/stackblitz-fff?logo=Stackblitz&logoColor=1389FD)](https://stackblitz.com/github/pmndrs/examples/tree/main/examples/webgpu-fog)

```sh
$ npx degit pmndrs/examples/examples/webgpu-fog
```

![](thumbnail.webp)

Procedural height fog with animated noise, written in TSL. Scoped useUniforms read from Leva, and useLocalNodes installs the fogNode and backgroundNode on the scene. Based on three.js webgpu_custom_fog.

Built on React Three Fiber v10 (alpha), which renders with WebGPU. Where the browser has no WebGPU, three's WebGPURenderer falls back to WebGL 2.
