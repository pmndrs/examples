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

  return {
    title,
    openGraph: {
      title,
      url: demo.url,
      images: [
        {
          url: demo.thumb,
          // width: 800,
          // height: 600,
        },
      ],
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

  const { url } = demo;

  return <iframe src={url} className="w-full min-h-dvh" />;
}
