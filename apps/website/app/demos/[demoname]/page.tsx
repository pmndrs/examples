import { notFound } from "next/navigation";

import { getDemos } from "@/lib/helper";
import { Dev } from "./Dev";

const demos = getDemos();

export type Props = {
  params: { demoname: string };
};

export async function generateMetadata({ params }: Props) {
  const demo = demos.find(({ name }) => name === params.demoname);
  if (!demo) return;

  const title = `${demo.name} - pmndrs`;
  const description = `Play with "${demo.name}" pmndrs demo.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: demo.website_url,
      images: [
        {
          url: demo.thumb,
          // width: 800,
          // height: 600,
          alt: `${demo.name} capture of the demo`,
        },
      ],
      type: "website",
    },
  };
}

export async function generateStaticParams() {
  return demos.map(({ name }) => ({
    demoname: name,
  }));
}

async function checkUrlIsUp(url: string) {
  const response = await fetch(url, {
    method: "GET",
    next: { revalidate: 0 },
  }).catch(() => {});

  return response?.ok || false;
}

const isDev = process.env.NODE_ENV === "development";

export default async function Page(props: Props) {
  const { params } = props;

  const { demoname } = params;
  const demo = demos.find(({ name }) => name === demoname);
  if (!demo) return notFound();

  const { embed_url } = demo;

  let isUp;
  if (isDev) {
    isUp = await checkUrlIsUp(embed_url);
  }
  // console.log("isUp=", isUp);

  return (
    <>
      {isDev && !isUp ? (
        <Dev demoname={demoname} />
      ) : (
        <iframe src={embed_url} />
      )}
    </>
  );
}
