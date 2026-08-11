#!/usr/bin/env node

//
// Which examples belong to one CI shard.
//
//   node bin/shard.mjs 3 8              # --filter=@example/... for turbo
//   node bin/shard.mjs 3 8 --names      # bare names, for `e2e-flaky`
//
// A cold run is ~60s of software rendering per example -- no GPU on the runner,
// and the bill is mostly shader compilation -- so one job cannot hold 170 of
// them. The turbo cache carries incremental runs; nothing carries a cold one.
//
// Round-robin rather than contiguous blocks: the list is alphabetical, and
// alphabetical neighbours are often the same kind of scene (`gltf-animations`,
// `gltf-animations-re-used`, ...), so blocks would put the heavy ones together.
// Dealing them out one by one spreads that without needing to know what each
// costs.
//
// Prints nothing when a shard is empty -- more shards than examples. The caller
// must not run turbo with an empty filter list, which would run everything.
//

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const index = Number(process.argv[2]);
const total = Number(process.argv[3]);

if (
  !Number.isInteger(index) ||
  !Number.isInteger(total) ||
  index < 1 ||
  index > total
) {
  console.error("Usage: shard.mjs <index> <total>   (1-based index)");
  process.exit(1);
}

const examples = readdirSync(join(root, "examples"))
  .filter((name) => {
    const pkg = join(root, "examples", name, "package.json");
    return (
      existsSync(pkg) && JSON.parse(readFileSync(pkg, "utf8")).scripts?.test
    );
  })
  .sort();

const names = process.argv.includes("--names");

console.log(
  examples
    .filter((_, i) => i % total === index - 1)
    .map((name) => (names ? name : `--filter=@example/${name}`))
    .join(" "),
);
