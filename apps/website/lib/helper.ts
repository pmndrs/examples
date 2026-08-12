import fs from "node:fs";
import path from "node:path";

import { NEW_EXAMPLES } from "@/const/new";
import pkg from "@/package.json";

import { generatePort } from "@examples/e2e";

const BASE_PATH = process.env.BASE_PATH || "";
const BASE_URL = process.env.BASE_URL;
const EXAMPLES_DIRECTORY = path.resolve(process.cwd(), "../../examples");

const host =
  process.env.NODE_ENV === "development"
    ? (port: number) => `http://localhost:${port}`
    : () => (BASE_URL ? new URL(BASE_URL).origin : "");

export type AssetAttribution = {
  name: string;
  files?: string[];
  creator?: string;
  source?: string;
  license?: string;
  licenseUrl?: string;
  modified?: boolean;
  notes?: string;
};

export type ExampleMetadata = {
  title: string;
  description: string;
  tags: string[];
  authors: string[];
  publishedAt?: string;
  notes?: string;
  source: string;
  libraries: string[];
  assets: AssetAttribution[];
};

export type Example = ExampleMetadata & {
  name: string;
  thumb: string;
  embed_url: string;
  website_url: string;
  catalog_url: string;
  isNew: boolean;
};

/**
 * The whole gallery as one line per example. Site-level rather than
 * per-example, so it takes the deployment origin without a port -- unlike
 * `host()` above, which in development points at whichever vite server runs
 * that example.
 */
export const catalogIndexUrl = `${
  BASE_URL ? new URL(BASE_URL).origin : ""
}${BASE_PATH}/llms.txt`;

function getMetadata(examplename: string): ExampleMetadata {
  const metadataPath = path.join(
    EXAMPLES_DIRECTORY,
    examplename,
    "pmndrs.json",
  );
  const metadata = JSON.parse(
    fs.readFileSync(metadataPath, "utf8"),
  ) as ExampleMetadata & { $schema: string };
  const { $schema: _, ...example } = metadata;
  return example;
}

export function getExamples(): Example[] {
  return Object.keys(pkg.dependencies)
    .filter((dep) => dep.startsWith("@example/"))
    .map((pkgname) => {
      const examplename = pkgname.split("@example/")[1];
      const metadata = getMetadata(examplename);
      const port = generatePort(examplename);
      const h = host(port);

      const embed_url = `${h}${BASE_PATH}/${examplename}`;
      const website_url = `${h}${BASE_PATH}/examples/${examplename}`;

      return {
        ...metadata,
        name: examplename,
        thumb: `${embed_url}/thumbnail.webp`,
        embed_url,
        website_url,
        // What `bin/build-catalog.mjs` wrote for this example -- this page's URL
        // with `.md` on the end. The page points at it with `rel="alternate"`
        // for readers that look, and the shape lets the rest guess.
        catalog_url: `${website_url}.md`,
        isNew: NEW_EXAMPLES.has(examplename),
      };
    });
}
