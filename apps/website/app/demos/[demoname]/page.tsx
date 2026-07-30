import { notFound } from "next/navigation";

import { ScaledDemoFrame } from "@/components/ScaledDemoFrame";
import { getDemos } from "@/lib/helper";
import { Dev } from "./Dev";
import { Style } from "@/components/Style";

import { Social } from "./Social";
import { Info } from "./Info";

const demos = getDemos();

export type Props = {
  // Next 15 made route params async
  params: Promise<{ demoname: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { demoname } = await params;
  const demo = demos.find(({ name }) => name === demoname);
  if (!demo) return;

  const title = `${demo.title} - pmndrs`;
  const description = demo.description;

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
          alt: `${demo.title} capture of the demo`,
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
  const { demoname } = await props.params;
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
      <Style
        css={`
          @scope {
            .Dev {
              width: 100%;
              height: 100%;
              display: grid;
              place-items: center;
              padding: 1rem;
            }
            .Frame {
              width: 100%;
              height: 100%;
              min-width: 0;
              min-height: 0;
            }
            .TopBar {
              position: fixed;
              top: 0.75rem;
              right: 0.75rem;
              z-index: 3;
              display: flex;
              align-items: flex-start;
              gap: 0.5rem;
            }
          }
        `}
      />

      {isDev && !isUp ? (
        <Dev demoname={demoname} />
      ) : (
        <>
          <div className="Frame">
            <ScaledDemoFrame src={embed_url} title={demo.title} />
          </div>

          <div className="TopBar">
            <Info key={demoname} demo={demo} />
            <Social demoname={demoname} embed_url={embed_url} />
          </div>
        </>
      )}
    </>
  );
}
