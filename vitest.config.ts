import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Root-level tests only: every workspace's own tests are playwright's,
    // driven by `turbo test`.
    include: ["test/**/*.test.ts"],
    // Each case shells out to turbo several times; the graph resolve for
    // ~165 packages is a second or two on its own.
    testTimeout: 120_000,
    // They mutate real files in the tree (append a byte, restore it), so they
    // cannot overlap.
    fileParallelism: false,
    sequence: { concurrent: false },
  },
});
