import fs from "node:fs";
import path from "node:path";

import { NEW_DEMOS } from "@/const/new";
import pkg from "@/package.json";

import { generatePort } from "@examples/e2e";

const BASE_PATH = process.env.BASE_PATH || "";
const BASE_URL = process.env.BASE_URL;
const DEMOS_DIRECTORY = path.resolve(process.cwd(), "../../demos");

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

export type DemoMetadata = {
  title: string;
  description: string;
  tags: string[];
  authors: string[];
  publishedAt?: string;
  source: string;
  libraries: string[];
  assets: AssetAttribution[];
};

export type Demo = DemoMetadata & {
  name: string;
  thumb: string;
  embed_url: string;
  website_url: string;
  isNew: boolean;
};

function getMetadata(demoname: string): DemoMetadata {
  const metadataPath = path.join(DEMOS_DIRECTORY, demoname, "pmndrs.json");
  const metadata = JSON.parse(
    fs.readFileSync(metadataPath, "utf8"),
  ) as DemoMetadata & { $schema: string };
  const { $schema: _, ...demo } = metadata;
  return demo;
}

export function getDemos(): Demo[] {
  return Object.keys(pkg.dependencies)
    .filter((dep) => dep.startsWith("@demo/"))
    .map((pkgname) => {
      const demoname = pkgname.split("@demo/")[1];
      const metadata = getMetadata(demoname);
      const port = generatePort(demoname);
      const h = host(port);

      const embed_url = `${h}${BASE_PATH}/${demoname}`;
      const website_url = `${h}${BASE_PATH}/demos/${demoname}`;

      return {
        ...metadata,
        name: demoname,
        thumb: `${embed_url}/thumbnail.webp`,
        embed_url,
        website_url,
        isNew: NEW_DEMOS.has(demoname),
      };
    });
}
