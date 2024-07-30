import path, { dirname, resolve } from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { generatePort } from "@examples/e2e";

console.log("NODE_ENV=", process.env.NODE_ENV);

const BASE_PATH = process.env.BASE_PATH || "";
const PUBLIC_URL = process.env.PUBLIC_URL;

const host =
  process.env.NODE_ENV === "development"
    ? (port: number) => `http://localhost:${port}`
    : () => (PUBLIC_URL ? new URL(PUBLIC_URL).origin : "");

export function getDemos() {
  const __filename = fileURLToPath(import.meta.url); // Converts the URL to a file path
  const __dirname = dirname(__filename); // Gets the directory name

  const demosDir = resolve(__dirname, "../../../demos");

  return fs
    .readdirSync(demosDir)
    .filter((file) => {
      return fs.statSync(path.join(demosDir, file)).isDirectory();
    })
    .map((demoname) => {
      const port = generatePort(demoname);
      const url = `${host(port)}${BASE_PATH}/${demoname}`;

      return {
        name: demoname,
        thumb: `${url}/thumbnail.png`,
        url,
      };
    });
}
