// ../../packages/e2e/src/vite.config.build.ts
import { defineConfig } from "file:///home/runner/work/examples/examples/node_modules/vite/dist/node/index.js";
import react from "file:///home/runner/work/examples/examples/node_modules/@vitejs/plugin-react/dist/index.js";

// ../../packages/e2e/src/vite-plugin-monkey.js
import { parse, print } from "file:///home/runner/work/examples/examples/node_modules/recast/main.js";
import * as babelParser from "file:///home/runner/work/examples/examples/node_modules/@babel/parser/lib/index.js";
import traverse from "file:///home/runner/work/examples/examples/node_modules/@babel/traverse/lib/index.js";
import * as t from "file:///home/runner/work/examples/examples/node_modules/@babel/types/lib/index.js";
function vitePluginMonkey() {
  return {
    name: "vite-plugin-monkey",
    transform(code, id) {
      if (id.endsWith("src/index.jsx") || id.endsWith("src/index.tsx")) {
        const ast = parse(code, {
          parser: {
            parse(source) {
              return babelParser.parse(source, {
                sourceType: "module",
                plugins: ["jsx", "typescript"]
              });
            }
          }
        });
        traverse.default(ast, {
          Program(path) {
            const importDeclaration2 = t.importDeclaration(
              [],
              t.stringLiteral("@examples/e2e/deterministic")
            );
            path.node.body.unshift(importDeclaration2);
          }
        });
        console.log("\u{1F435}-patched `src/index.[jt]sx`");
        return {
          code: print(ast).code,
          map: null
        };
      }
      if (id.endsWith("src/App.jsx") || id.endsWith("src/App.tsx")) {
        const ast = parse(code, {
          parser: {
            parse(source) {
              return babelParser.parse(source, {
                sourceType: "module",
                plugins: ["jsx", "typescript"]
              });
            }
          }
        });
        traverse.default(ast, {
          ImportDeclaration(path) {
            const { node } = path;
            if (node.source.value === "@react-three/fiber") {
              let hasCanvasImport = false;
              node.specifiers = node.specifiers.filter((specifier) => {
                if (t.isImportSpecifier(specifier) && specifier.imported.name === "Canvas") {
                  hasCanvasImport = true;
                  return false;
                }
                return true;
              });
              if (hasCanvasImport) {
                const customCanvasImport = t.importDeclaration(
                  [t.importDefaultSpecifier(t.identifier("CheesyCanvas"))],
                  t.stringLiteral("@examples/e2e/CheesyCanvas")
                );
                const canvasVariableDeclaration = t.variableDeclaration(
                  "const",
                  [
                    t.variableDeclarator(
                      t.identifier("Canvas"),
                      // Variable name
                      t.identifier("CheesyCanvas")
                      // Assigned value
                    )
                  ]
                );
                path.insertAfter(customCanvasImport);
                path.insertAfter(canvasVariableDeclaration);
              }
            }
          }
        });
        console.log(
          "\u{1F435}-patched <Canvas> in `src/App.[jt]sx` with CheesyCanvas"
        );
        return {
          code: print(ast).code,
          map: null
          // Provide source map if available
        };
      }
      return null;
    }
  };
}

// ../../packages/e2e/src/vite.config.build.ts
var vite_config_build_default = defineConfig({
  plugins: [react(), vitePluginMonkey()]
});
export {
  vite_config_build_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vcGFja2FnZXMvZTJlL3NyYy92aXRlLmNvbmZpZy5idWlsZC50cyIsICIuLi8uLi9wYWNrYWdlcy9lMmUvc3JjL3ZpdGUtcGx1Z2luLW1vbmtleS5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3J1bm5lci93b3JrL2V4YW1wbGVzL2V4YW1wbGVzL3BhY2thZ2VzL2UyZS9zcmNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3J1bm5lci93b3JrL2V4YW1wbGVzL2V4YW1wbGVzL3BhY2thZ2VzL2UyZS9zcmMvdml0ZS5jb25maWcuYnVpbGQudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvcnVubmVyL3dvcmsvZXhhbXBsZXMvZXhhbXBsZXMvcGFja2FnZXMvZTJlL3NyYy92aXRlLmNvbmZpZy5idWlsZC50c1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0XCI7XG5cbmltcG9ydCBtb25rZXlQYXRjaCBmcm9tIFwiLi92aXRlLXBsdWdpbi1tb25rZXlcIjtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW3JlYWN0KCksIG1vbmtleVBhdGNoKCldLFxufSk7XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3J1bm5lci93b3JrL2V4YW1wbGVzL2V4YW1wbGVzL3BhY2thZ2VzL2UyZS9zcmNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3J1bm5lci93b3JrL2V4YW1wbGVzL2V4YW1wbGVzL3BhY2thZ2VzL2UyZS9zcmMvdml0ZS1wbHVnaW4tbW9ua2V5LmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3J1bm5lci93b3JrL2V4YW1wbGVzL2V4YW1wbGVzL3BhY2thZ2VzL2UyZS9zcmMvdml0ZS1wbHVnaW4tbW9ua2V5LmpzXCI7aW1wb3J0IHsgcGFyc2UsIHByaW50IH0gZnJvbSBcInJlY2FzdFwiO1xuaW1wb3J0ICogYXMgYmFiZWxQYXJzZXIgZnJvbSBcIkBiYWJlbC9wYXJzZXJcIjtcbmltcG9ydCB0cmF2ZXJzZSBmcm9tIFwiQGJhYmVsL3RyYXZlcnNlXCI7XG5pbXBvcnQgKiBhcyB0IGZyb20gXCJAYmFiZWwvdHlwZXNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdml0ZVBsdWdpbk1vbmtleSgpIHtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiBcInZpdGUtcGx1Z2luLW1vbmtleVwiLFxuICAgIHRyYW5zZm9ybShjb2RlLCBpZCkge1xuICAgICAgLy9cbiAgICAgIC8vIEluIGBzcmMvaW5kZXguW2p0XXN4YCwgYWRkIHRvIHRoZSB0b3Agb2YgdGhlIGZpbGU6XG4gICAgICAvL1xuICAgICAgLy8gYGBgXG4gICAgICAvLyBpbXBvcnQgJ0BleGFtcGxlcy9lMmUvZGV0ZXJtaW5pc3RpYyc7XG4gICAgICAvLyBgYGBcbiAgICAgIC8vXG5cbiAgICAgIGlmIChpZC5lbmRzV2l0aChcInNyYy9pbmRleC5qc3hcIikgfHwgaWQuZW5kc1dpdGgoXCJzcmMvaW5kZXgudHN4XCIpKSB7XG4gICAgICAgIGNvbnN0IGFzdCA9IHBhcnNlKGNvZGUsIHtcbiAgICAgICAgICBwYXJzZXI6IHtcbiAgICAgICAgICAgIHBhcnNlKHNvdXJjZSkge1xuICAgICAgICAgICAgICByZXR1cm4gYmFiZWxQYXJzZXIucGFyc2Uoc291cmNlLCB7XG4gICAgICAgICAgICAgICAgc291cmNlVHlwZTogXCJtb2R1bGVcIixcbiAgICAgICAgICAgICAgICBwbHVnaW5zOiBbXCJqc3hcIiwgXCJ0eXBlc2NyaXB0XCJdLFxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdHJhdmVyc2UuZGVmYXVsdChhc3QsIHtcbiAgICAgICAgICBQcm9ncmFtKHBhdGgpIHtcbiAgICAgICAgICAgIC8vIEluc2VydCB0aGUgaW1wb3J0IHN0YXRlbWVudCBhdCB0aGUgdG9wIG9mIHRoZSBmaWxlXG4gICAgICAgICAgICBjb25zdCBpbXBvcnREZWNsYXJhdGlvbiA9IHQuaW1wb3J0RGVjbGFyYXRpb24oXG4gICAgICAgICAgICAgIFtdLFxuICAgICAgICAgICAgICB0LnN0cmluZ0xpdGVyYWwoXCJAZXhhbXBsZXMvZTJlL2RldGVybWluaXN0aWNcIilcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIHBhdGgubm9kZS5ib2R5LnVuc2hpZnQoaW1wb3J0RGVjbGFyYXRpb24pO1xuICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKFwiXHVEODNEXHVEQzM1LXBhdGNoZWQgYHNyYy9pbmRleC5banRdc3hgXCIpO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgY29kZTogcHJpbnQoYXN0KS5jb2RlLFxuICAgICAgICAgIG1hcDogbnVsbCxcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgLy9cbiAgICAgIC8vIEluIGBzcmMvQXBwLltqdF1zeGAsIHdlIHNlYXJjaCBmb3I6XG4gICAgICAvL1xuICAgICAgLy8gYGBgXG4gICAgICAvLyBpbXBvcnQgeyB1c2VGcmFtZSwgQ2FudmFzLCAuLi4gLCB1c2VUaHJlZSB9IGZyb20gJ0ByZWFjdC10aHJlZS9maWJlcic7XG4gICAgICAvLyBgYGBcbiAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgXiBZT1VcbiAgICAgIC8vXG4gICAgICAvLyB0byByZXBsYWNlIGl0IHdpdGg6XG4gICAgICAvL1xuICAgICAgLy8gYGBgXG4gICAgICAvLyBpbXBvcnQgeyB1c2VGcmFtZSwgLi4uICwgdXNlVGhyZWUgfSBmcm9tICdAcmVhY3QtdGhyZWUvZmliZXInO1xuICAgICAgLy8gaW1wb3J0IENoZWVzeUNhbnZhcyBmcm9tICdAZXhhbXBsZXMvZTJlL0NoZWVzeUNhbnZhcyc7XG4gICAgICAvLyBjb25zdCBDYW52YXMgPSBDaGVlc3lDYW52YXM7XG4gICAgICAvLyBgYGBcbiAgICAgIC8vXG4gICAgICAvLyAtPiBOQjogd2UgdXNlIHJlY2FzdCB0byBwYXJzZSB0aGUgY29kZSBhbmQgdHJhdmVyc2UvbWFuaXB1bGF0ZSB0aGUgQVNUXG4gICAgICAvL1xuXG4gICAgICBpZiAoaWQuZW5kc1dpdGgoXCJzcmMvQXBwLmpzeFwiKSB8fCBpZC5lbmRzV2l0aChcInNyYy9BcHAudHN4XCIpKSB7XG4gICAgICAgIC8vXG4gICAgICAgIC8vIFBhcnNlIHRoZSBjb2RlIGludG8gYW4gQVNUIHVzaW5nIEBiYWJlbC9wYXJzZXJcbiAgICAgICAgLy9cblxuICAgICAgICBjb25zdCBhc3QgPSBwYXJzZShjb2RlLCB7XG4gICAgICAgICAgcGFyc2VyOiB7XG4gICAgICAgICAgICBwYXJzZShzb3VyY2UpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGJhYmVsUGFyc2VyLnBhcnNlKHNvdXJjZSwge1xuICAgICAgICAgICAgICAgIHNvdXJjZVR5cGU6IFwibW9kdWxlXCIsXG4gICAgICAgICAgICAgICAgcGx1Z2luczogW1wianN4XCIsIFwidHlwZXNjcmlwdFwiXSxcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIFRyYXZlcnNlXG4gICAgICAgIC8vXG5cbiAgICAgICAgdHJhdmVyc2UuZGVmYXVsdChhc3QsIHtcbiAgICAgICAgICBJbXBvcnREZWNsYXJhdGlvbihwYXRoKSB7XG4gICAgICAgICAgICBjb25zdCB7IG5vZGUgfSA9IHBhdGg7XG5cbiAgICAgICAgICAgIC8vIGBmcm9tICdAcmVhY3QtdGhyZWUvZmliZXInYFxuICAgICAgICAgICAgaWYgKG5vZGUuc291cmNlLnZhbHVlID09PSBcIkByZWFjdC10aHJlZS9maWJlclwiKSB7XG4gICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiRm91bmQgaW1wb3J0IGZvciBAcmVhY3QtdGhyZWUvZmliZXJcIik7XG5cbiAgICAgICAgICAgICAgbGV0IGhhc0NhbnZhc0ltcG9ydCA9IGZhbHNlO1xuXG4gICAgICAgICAgICAgIC8vIFRyYW5zZm9ybSBgaW1wb3J0IHsgLi4uLCBDYW52YXMsIC4uLiB9YCBpbnRvIGBpbXBvcnQgeyAuLi4gfWBcbiAgICAgICAgICAgICAgbm9kZS5zcGVjaWZpZXJzID0gbm9kZS5zcGVjaWZpZXJzLmZpbHRlcigoc3BlY2lmaWVyKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgdC5pc0ltcG9ydFNwZWNpZmllcihzcGVjaWZpZXIpICYmXG4gICAgICAgICAgICAgICAgICBzcGVjaWZpZXIuaW1wb3J0ZWQubmFtZSA9PT0gXCJDYW52YXNcIlxuICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgaGFzQ2FudmFzSW1wb3J0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgIC8vIElmIHdlIHJlbW92ZWQgYSBDYW52YXMgaW1wb3J0IGp1c3QgYmVmb3JlLCB3ZSB3YW50IHRvIGFkZDpcbiAgICAgICAgICAgICAgLy8gYGBgXG4gICAgICAgICAgICAgIC8vIGltcG9ydCBDaGVlc3lDYW52YXMgZnJvbSAnQGV4YW1wbGVzL2UyZS9DaGVlc3lDYW52YXMnOyAvLyAoSSlcbiAgICAgICAgICAgICAgLy8gY29uc3QgQ2FudmFzID0gQ2hlZXN5Q2FudmFzOyAvLyAoSUkpXG4gICAgICAgICAgICAgIC8vIGBgYFxuXG4gICAgICAgICAgICAgIGlmIChoYXNDYW52YXNJbXBvcnQpIHtcbiAgICAgICAgICAgICAgICAvLyAoSSlcbiAgICAgICAgICAgICAgICBjb25zdCBjdXN0b21DYW52YXNJbXBvcnQgPSB0LmltcG9ydERlY2xhcmF0aW9uKFxuICAgICAgICAgICAgICAgICAgW3QuaW1wb3J0RGVmYXVsdFNwZWNpZmllcih0LmlkZW50aWZpZXIoXCJDaGVlc3lDYW52YXNcIikpXSxcbiAgICAgICAgICAgICAgICAgIHQuc3RyaW5nTGl0ZXJhbChcIkBleGFtcGxlcy9lMmUvQ2hlZXN5Q2FudmFzXCIpXG4gICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgIC8vIChJSSlcbiAgICAgICAgICAgICAgICBjb25zdCBjYW52YXNWYXJpYWJsZURlY2xhcmF0aW9uID0gdC52YXJpYWJsZURlY2xhcmF0aW9uKFxuICAgICAgICAgICAgICAgICAgXCJjb25zdFwiLFxuICAgICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICB0LnZhcmlhYmxlRGVjbGFyYXRvcihcbiAgICAgICAgICAgICAgICAgICAgICB0LmlkZW50aWZpZXIoXCJDYW52YXNcIiksIC8vIFZhcmlhYmxlIG5hbWVcbiAgICAgICAgICAgICAgICAgICAgICB0LmlkZW50aWZpZXIoXCJDaGVlc3lDYW52YXNcIikgLy8gQXNzaWduZWQgdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgLy8gSW5zZXJ0IHRoZSBuZXcgaW1wb3J0IGRlY2xhcmF0aW9uIGFmdGVyIHRoZSBjdXJyZW50IGltcG9ydCBkZWNsYXJhdGlvblxuICAgICAgICAgICAgICAgIHBhdGguaW5zZXJ0QWZ0ZXIoY3VzdG9tQ2FudmFzSW1wb3J0KTtcbiAgICAgICAgICAgICAgICAvLyBJbnNlcnQgdGhlIG5ldyB2YXJpYWJsZSBkZWNsYXJhdGlvbiBhZnRlciB0aGUgaW1wb3J0IGRlY2xhcmF0aW9uXG4gICAgICAgICAgICAgICAgcGF0aC5pbnNlcnRBZnRlcihjYW52YXNWYXJpYWJsZURlY2xhcmF0aW9uKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgIFwiXHVEODNEXHVEQzM1LXBhdGNoZWQgPENhbnZhcz4gaW4gYHNyYy9BcHAuW2p0XXN4YCB3aXRoIENoZWVzeUNhbnZhc1wiXG4gICAgICAgICk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwiQ09ERVwiLCBwcmludChhc3QpLmNvZGUpO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgY29kZTogcHJpbnQoYXN0KS5jb2RlLFxuICAgICAgICAgIG1hcDogbnVsbCwgLy8gUHJvdmlkZSBzb3VyY2UgbWFwIGlmIGF2YWlsYWJsZVxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9LFxuICB9O1xufVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUEwVixTQUFTLG9CQUFvQjtBQUN2WCxPQUFPLFdBQVc7OztBQ0QwVSxTQUFTLE9BQU8sYUFBYTtBQUN6WCxZQUFZLGlCQUFpQjtBQUM3QixPQUFPLGNBQWM7QUFDckIsWUFBWSxPQUFPO0FBRUosU0FBUixtQkFBb0M7QUFDekMsU0FBTztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sVUFBVSxNQUFNLElBQUk7QUFTbEIsVUFBSSxHQUFHLFNBQVMsZUFBZSxLQUFLLEdBQUcsU0FBUyxlQUFlLEdBQUc7QUFDaEUsY0FBTSxNQUFNLE1BQU0sTUFBTTtBQUFBLFVBQ3RCLFFBQVE7QUFBQSxZQUNOLE1BQU0sUUFBUTtBQUNaLHFCQUFtQixrQkFBTSxRQUFRO0FBQUEsZ0JBQy9CLFlBQVk7QUFBQSxnQkFDWixTQUFTLENBQUMsT0FBTyxZQUFZO0FBQUEsY0FDL0IsQ0FBQztBQUFBLFlBQ0g7QUFBQSxVQUNGO0FBQUEsUUFDRixDQUFDO0FBRUQsaUJBQVMsUUFBUSxLQUFLO0FBQUEsVUFDcEIsUUFBUSxNQUFNO0FBRVosa0JBQU1BLHFCQUFzQjtBQUFBLGNBQzFCLENBQUM7QUFBQSxjQUNDLGdCQUFjLDZCQUE2QjtBQUFBLFlBQy9DO0FBRUEsaUJBQUssS0FBSyxLQUFLLFFBQVFBLGtCQUFpQjtBQUFBLFVBQzFDO0FBQUEsUUFDRixDQUFDO0FBRUQsZ0JBQVEsSUFBSSxzQ0FBK0I7QUFFM0MsZUFBTztBQUFBLFVBQ0wsTUFBTSxNQUFNLEdBQUcsRUFBRTtBQUFBLFVBQ2pCLEtBQUs7QUFBQSxRQUNQO0FBQUEsTUFDRjtBQXFCQSxVQUFJLEdBQUcsU0FBUyxhQUFhLEtBQUssR0FBRyxTQUFTLGFBQWEsR0FBRztBQUs1RCxjQUFNLE1BQU0sTUFBTSxNQUFNO0FBQUEsVUFDdEIsUUFBUTtBQUFBLFlBQ04sTUFBTSxRQUFRO0FBQ1oscUJBQW1CLGtCQUFNLFFBQVE7QUFBQSxnQkFDL0IsWUFBWTtBQUFBLGdCQUNaLFNBQVMsQ0FBQyxPQUFPLFlBQVk7QUFBQSxjQUMvQixDQUFDO0FBQUEsWUFDSDtBQUFBLFVBQ0Y7QUFBQSxRQUNGLENBQUM7QUFNRCxpQkFBUyxRQUFRLEtBQUs7QUFBQSxVQUNwQixrQkFBa0IsTUFBTTtBQUN0QixrQkFBTSxFQUFFLEtBQUssSUFBSTtBQUdqQixnQkFBSSxLQUFLLE9BQU8sVUFBVSxzQkFBc0I7QUFHOUMsa0JBQUksa0JBQWtCO0FBR3RCLG1CQUFLLGFBQWEsS0FBSyxXQUFXLE9BQU8sQ0FBQyxjQUFjO0FBQ3RELG9CQUNJLG9CQUFrQixTQUFTLEtBQzdCLFVBQVUsU0FBUyxTQUFTLFVBQzVCO0FBQ0Esb0NBQWtCO0FBQ2xCLHlCQUFPO0FBQUEsZ0JBQ1Q7QUFDQSx1QkFBTztBQUFBLGNBQ1QsQ0FBQztBQVFELGtCQUFJLGlCQUFpQjtBQUVuQixzQkFBTSxxQkFBdUI7QUFBQSxrQkFDM0IsQ0FBRyx5QkFBeUIsYUFBVyxjQUFjLENBQUMsQ0FBQztBQUFBLGtCQUNyRCxnQkFBYyw0QkFBNEI7QUFBQSxnQkFDOUM7QUFHQSxzQkFBTSw0QkFBOEI7QUFBQSxrQkFDbEM7QUFBQSxrQkFDQTtBQUFBLG9CQUNJO0FBQUEsc0JBQ0UsYUFBVyxRQUFRO0FBQUE7QUFBQSxzQkFDbkIsYUFBVyxjQUFjO0FBQUE7QUFBQSxvQkFDN0I7QUFBQSxrQkFDRjtBQUFBLGdCQUNGO0FBR0EscUJBQUssWUFBWSxrQkFBa0I7QUFFbkMscUJBQUssWUFBWSx5QkFBeUI7QUFBQSxjQUM1QztBQUFBLFlBQ0Y7QUFBQSxVQUNGO0FBQUEsUUFDRixDQUFDO0FBRUQsZ0JBQVE7QUFBQSxVQUNOO0FBQUEsUUFDRjtBQUdBLGVBQU87QUFBQSxVQUNMLE1BQU0sTUFBTSxHQUFHLEVBQUU7QUFBQSxVQUNqQixLQUFLO0FBQUE7QUFBQSxRQUNQO0FBQUEsTUFDRjtBQUVBLGFBQU87QUFBQSxJQUNUO0FBQUEsRUFDRjtBQUNGOzs7QUR4SkEsSUFBTyw0QkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLE1BQU0sR0FBRyxpQkFBWSxDQUFDO0FBQ2xDLENBQUM7IiwKICAibmFtZXMiOiBbImltcG9ydERlY2xhcmF0aW9uIl0KfQo=
