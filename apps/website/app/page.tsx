import path, { dirname, resolve } from "path";
import fs from "fs";
import Demos from "@/components/Demos";
import { fileURLToPath } from "url";

const BASE_PATH = process.env.BASE_PATH || "";

function getDemoNames() {
  const __filename = fileURLToPath(import.meta.url); // Converts the URL to a file path
  const __dirname = dirname(__filename); // Gets the directory name

  const demosDir = resolve(__dirname, "../../../demos");

  return fs.readdirSync(demosDir).filter((file) => {
    return fs.statSync(path.join(demosDir, file)).isDirectory();
  });
}

// const demoNames = ["aquarium", "baking-soft-shadows", "basic-demo"];
const demoNames = getDemoNames();

const demos = demoNames.map((name) => {
  const url = `${BASE_PATH}/${name}`;
  return {
    name,
    thumb: `${url}/thumbnail.png`,
    url,
  };
});
export type Demo = (typeof demos)[number];

export default function Home() {
  return <Demos demos={demos} />;
}
