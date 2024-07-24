import { parse, print } from "recast";
import * as babelParser from "@babel/parser";
import traverse from "@babel/traverse";
import * as t from "@babel/types";

export default function vitePluginMonkey() {
  return {
    name: "vite-plugin-monkey",
    transform(code, id) {
      //
      // In `src/index.[jt]sx`, add to the top of the file:
      //
      // ```
      // import '@pmndrs/examples/deterministic';
      // ```
      //

      if (id.endsWith("src/index.jsx") || id.endsWith("src/index.tsx")) {
        const ast = parse(code, {
          parser: {
            parse(source) {
              return babelParser.parse(source, {
                sourceType: "module",
                plugins: ["jsx", "typescript"],
              });
            },
          },
        });

        traverse.default(ast, {
          Program(path) {
            // Insert the import statement at the top of the file
            const importDeclaration = t.importDeclaration(
              [],
              t.stringLiteral("@pmndrs/examples/deterministic")
            );

            path.node.body.unshift(importDeclaration);
          },
        });

        console.log("🐵-patched `src/index.[jt]sx`");

        return {
          code: print(ast).code,
          map: null,
        };
      }

      //
      // In `src/App.[jt]sx`, we search for:
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
      // import CheesyCanvas from '@pmndrs/examples/CheesyCanvas';
      // const Canvas = CheesyCanvas;
      // ```
      //
      // -> NB: we use recast to parse the code and traverse/manipulate the AST
      //

      if (id.endsWith("src/App.jsx") || id.endsWith("src/App.tsx")) {
        //
        // Parse the code into an AST using @babel/parser
        //

        const ast = parse(code, {
          parser: {
            parse(source) {
              return babelParser.parse(source, {
                sourceType: "module",
                plugins: ["jsx", "typescript"],
              });
            },
          },
        });

        //
        // Traverse
        //

        traverse.default(ast, {
          ImportDeclaration(path) {
            const { node } = path;

            // `from '@react-three/fiber'`
            if (node.source.value === "@react-three/fiber") {
              // console.log("Found import for @react-three/fiber");

              let hasCanvasImport = false;

              // Transform `import { ..., Canvas, ... }` into `import { ... }`
              node.specifiers = node.specifiers.filter((specifier) => {
                if (
                  t.isImportSpecifier(specifier) &&
                  specifier.imported.name === "Canvas"
                ) {
                  hasCanvasImport = true;
                  return false;
                }
                return true;
              });

              // If we removed a Canvas import just before, we want to add:
              // ```
              // import CheesyCanvas from '@pmndrs/examples/CheesyCanvas'; // (I)
              // const Canvas = CheesyCanvas; // (II)
              // ```

              if (hasCanvasImport) {
                // (I)
                const customCanvasImport = t.importDeclaration(
                  [t.importDefaultSpecifier(t.identifier("CheesyCanvas"))],
                  t.stringLiteral("@pmndrs/examples/CheesyCanvas")
                );

                // (II)
                const canvasVariableDeclaration = t.variableDeclaration(
                  "const",
                  [
                    t.variableDeclarator(
                      t.identifier("Canvas"), // Variable name
                      t.identifier("CheesyCanvas") // Assigned value
                    ),
                  ]
                );

                // Insert the new import declaration after the current import declaration
                path.insertAfter(customCanvasImport);
                // Insert the new variable declaration after the import declaration
                path.insertAfter(canvasVariableDeclaration);
              }
            }
          },
        });

        console.log(
          "🐵-patched <Canvas> in `src/App.[jt]sx` with CheesyCanvas"
        );
        // console.log("CODE", print(ast).code);

        return {
          code: print(ast).code,
          map: null, // Provide source map if available
        };
      }

      return null;
    },
  };
}
