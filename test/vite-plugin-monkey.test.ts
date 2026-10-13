import { parse } from "@babel/parser";
import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

// Load the build plugin with Node's CJS interop, as Vite's config loader does.
const vitePluginMonkey = createRequire(import.meta.url)(
  "../packages/e2e/src/vite-plugin-monkey.js",
).default;

const root = "/examples/test-scene";

function transform(code: string, file = `${root}/src/Scene.tsx`) {
  const plugin = vitePluginMonkey();
  plugin.configResolved({ root });
  return plugin.transform(code, file);
}

describe("vite-plugin-monkey", () => {
  it.each([
    ["@react-three/fiber", "@examples/e2e/CheesyCanvas"],
    ["@react-three/fiber/webgpu", "@examples/e2e/CheesyWebGPUCanvas"],
  ])(
    "wraps Canvas from %s and preserves its hooks and alias",
    (fiber, wrapper) => {
      const result = transform(`
      import { Canvas as SceneCanvas, useFrame, useThree } from '${fiber}';
      export const Scene = () => <SceneCanvas />;
    `);

      const ast = parse(result.code, {
        sourceType: "module",
        plugins: ["jsx"],
      });
      const imports = ast.program.body.filter(
        (node) => node.type === "ImportDeclaration",
      );
      const hooks = imports.find((node) => node.source.value === fiber)!;
      expect(hooks.specifiers.map((specifier) => specifier.local.name)).toEqual(
        ["useFrame", "useThree"],
      );
      expect(imports.some((node) => node.source.value === wrapper)).toBe(true);
      expect(result.code).toContain("const SceneCanvas = CheesyCanvas;");
      expect(result.code).toContain("<SceneCanvas />");
    },
  );

  it("patches a WebGPU Canvas in the entrypoint along with the seeded clock", () => {
    const result = transform(
      `import { Canvas } from '@react-three/fiber/webgpu';
       export const App = () => <Canvas />;`,
      `${root}/src/index.tsx`,
    );

    expect(result.code).toContain("@examples/e2e/deterministic");
    expect(result.code).toContain("@examples/e2e/CheesyWebGPUCanvas");
    expect(result.code).toContain("const Canvas = CheesyCanvas;");
  });

  it("leaves WebGPU files that only import hooks alone", () => {
    expect(
      transform(`import { useFrame } from '@react-three/fiber/webgpu';`),
    ).toBeNull();
  });

  it("does not wrap the harness's own Canvas import", () => {
    expect(
      transform(
        `import { Canvas } from '@react-three/fiber/webgpu';`,
        "/packages/e2e/src/CheesyWebGPUCanvas.jsx",
      ),
    ).toBeNull();
  });
});
