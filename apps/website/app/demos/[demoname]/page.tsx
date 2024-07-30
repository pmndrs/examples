import { notFound } from "next/navigation";

import { getDemos } from "@/lib/helper";

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

export default function Page(props: Props) {
  const { params } = props;

  const { demoname } = params;
  const demo = demos.find(({ name }) => name === demoname);
  if (!demo) return notFound();

  const { embed_url } = demo;

  return <iframe src={embed_url} className="w-full min-h-dvh" />;
}
