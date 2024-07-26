import Demos from "@/components/Demos";

const BASE_PATH = process.env.BASE_PATH || "";

const demos = ["aquarium", "baking-soft-shadows", "basic-demo"].map((name) => {
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
