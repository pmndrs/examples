// Importing JSON directly
import pkg from "@/package.json";

import { generatePort } from "@examples/e2e";

const BASE_PATH = process.env.BASE_PATH || "";
const BASE_URL = process.env.BASE_URL;

const host =
  process.env.NODE_ENV === "development"
    ? (port: number) => `http://localhost:${port}`
    : () => (BASE_URL ? new URL(BASE_URL).origin : "");

export function getDemos() {
  return Object.keys(pkg.dependencies)
    .filter((dep) => dep.startsWith("@demo/"))
    .map((pkgname) => {
      const demoname = pkgname.split("@demo/")[1];
      const port = generatePort(demoname);
      const h = host(port);

      const embed_url = `${h}${BASE_PATH}/${demoname}`;
      const website_url = `${h}${BASE_PATH}/demos/${demoname}`;

      return {
        name: demoname,
        thumb: `${embed_url}/thumbnail.png`,
        embed_url,
        website_url,
      };
    });
}
