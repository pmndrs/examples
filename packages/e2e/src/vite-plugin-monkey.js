import { parse, print } from "recast";
import * as babelParser from "@babel/parser";
import traverse from "@babel/traverse";
import * as t from "@babel/types";

function toAst(code) {
  return parse(code, {
    parser: {
      parse(source) {
        return babelParser.parse(source, {
          sourceType: "module",
          plugins: ["jsx", "typescript"],
        });
      },
    },
  });
}

export default function vitePluginMonkey() {
  let root;

  return {
    name: "vite-plugin-monkey",

    configResolved(config) {
      root = config.root;
    },

    transform(code, id) {
      //
      // The example's own sources, and nothing else. `@examples/e2e` resolves
      // to a real path outside the root, which is what keeps CheesyCanvas --
      // itself an importer of `Canvas` -- from wrapping itself, forever.
      //
      if (!id.startsWith(`${root}/src/`)) return null;

      //
      // In `src/index.[jt]sx`, add to the top of the file:
      //
      // ```
      // import '@examples/e2e/deterministic';
      // ```
      //

      let touched = false;

      if (/\/src\/index\.[jt]sx$/.test(id)) {
        const ast = toAst(code);

        traverse.default(ast, {
          Program(path) {
            // Insert the import statement at the top of the file
            const importDeclaration = t.importDeclaration(
              [],
              t.stringLiteral("@examples/e2e/deterministic"),
            );

            path.node.body.unshift(importDeclaration);
          },
        });

        console.log("🐵-patched `src/index.[jt]sx`");

        code = print(ast).code;
        touched = true;

        // and keep going: nine examples hold their `<Canvas>` right here.
      }

      //
      // Wherever `Canvas` is imported, we search for:
      //
      // ```
      // import { useFrame, Canvas, ... , useThree } from '@react-three/fiber';
      // ```
      //                     ^ YOU
      //
      // to replace it with:
      //
      // ```
      // import { useFrame, ... , useThree } from '@react-three/fiber';
      // import CheesyCanvas from '@examples/e2e/CheesyCanvas';
      // const Canvas = CheesyCanvas;
      // ```
      //
      // -> NB: we use recast to parse the code and traverse/manipulate the AST
      //
      // Every source file rather than `src/App.[jt]sx` alone: nine examples
      // keep their `<Canvas>` somewhere else -- `Scene.tsx`, `Bananas.tsx`,
      // `Canvas.tsx`, `index.tsx` -- and betting on `App` left them running
      // their own render loop, at their own speed, unwrapped and unfrozen.
      //

      const done = () => (touched ? { code, map: null } : null);

      if (!/\.[jt]sx$/.test(id)) return done();
      // Cheaper than parsing every file to find out, and the same string the
      // AST would look for.
      if (!code.includes("@react-three/fiber")) return done();

      const ast = toAst(code);
      const patched = [];

      traverse.default(ast, {
        ImportDeclaration(path) {
          const { node } = path;

          // `from '@react-three/fiber'`
          if (node.source.value !== "@react-three/fiber") return;

          // Transform `import { ..., Canvas, ... }` into `import { ... }`,
          // keeping whatever local name it was given -- `Canvas as R3FCanvas`
          // has to come out the other side as `R3FCanvas`.
          let local;

          node.specifiers = node.specifiers.filter((specifier) => {
            if (
              t.isImportSpecifier(specifier) &&
              specifier.imported.name === "Canvas"
            ) {
              local = specifier.local.name;
              return false;
            }
            return true;
          });

          // If we removed a Canvas import just before, we want to add:
          // ```
          // import CheesyCanvas from '@examples/e2e/CheesyCanvas'; // (I)
          // const Canvas = CheesyCanvas; // (II)
          // ```

          if (!local) return;

          // (I)
          const customCanvasImport = t.importDeclaration(
            [t.importDefaultSpecifier(t.identifier("CheesyCanvas"))],
            t.stringLiteral("@examples/e2e/CheesyCanvas"),
          );

          // (II)
          const canvasVariableDeclaration = t.variableDeclaration("const", [
            t.variableDeclarator(
              t.identifier(local), // Variable name
              t.identifier("CheesyCanvas"), // Assigned value
            ),
          ]);

          // Insert the new import declaration after the current import declaration
          path.insertAfter(customCanvasImport);
          // Insert the new variable declaration after the import declaration
          path.insertAfter(canvasVariableDeclaration);

          patched.push(local);
        },
      });

      //
      // An example whose `<Canvas>` we never found is one whose loop nothing
      // freezes: it shoots whatever frame the machine happened to be on. So
      // say which file was patched, out loud, rather than only that one was --
      // a silent build is how the nine went unnoticed in the first place.
      //
      if (patched.length === 0) return done();

      console.log(
        `🐵-patched <${patched.join(">, <")}> in \`${id.slice(root.length + 1)}\` with CheesyCanvas`,
      );

      return {
        code: print(ast).code,
        map: null, // Provide source map if available
      };
    },
  };
}
