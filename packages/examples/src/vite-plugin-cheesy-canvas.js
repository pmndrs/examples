import { parse, print } from "recast";
import * as babelParser from "@babel/parser";
import traverse from "@babel/traverse";
import * as t from "@babel/types";

export default function vitePluginCheesyCanvas() {
  return {
    name: "vite-plugin-cheesy-canvas",
    transform(code, id) {
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
      // import { useFrame, OriginalCanvas as Canvas, ... , useThree } from '@react-three/fiber';
      // import CheesyCanvas from './CheesyCanvas';
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

              // Transform `import { ..., Canvas, ... }` into `import { ..., OriginalCanvas as Canvas, ... }`
              node.specifiers = node.specifiers.map((specifier) => {
                if (
                  t.isImportSpecifier(specifier) &&
                  specifier.imported.name === "Canvas"
                ) {
                  hasCanvasImport = true;
                  return t.importSpecifier(
                    t.identifier("OriginalCanvas"),
                    t.identifier("Canvas")
                  );
                }
                return specifier;
              });

              // If we found a Canvas import just before, we want to add:
              // ```
              // import CheesyCanvas from './CheesyCanvas'; // (I)
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
