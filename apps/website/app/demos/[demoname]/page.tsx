import { notFound } from "next/navigation";

import { ScaledDemoFrame } from "@/components/ScaledDemoFrame";
import { getDemos } from "@/lib/helper";
import { Dev } from "./Dev";
import { Style } from "@/components/Style";
import { TooltipProvider } from "@/components/ui/tooltip";

import { Social } from "./Social";
import { Info } from "./Info";

const demos = getDemos();

export type Props = {
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
              /* Never takes effect: 'Dev' sets its own 'min(100%, 46rem)' from
                 a scope rooted on the element itself, and in '@scope' the
                 nearer root wins whatever the specificity. Kept as the
                 fallback for a 'Dev' that stops sizing itself. */
              width: 100%;
              height: 100%;
              /* ...which is why this is needed: an explicitly sized item
                 stretches to nothing and is parked at the start of the track,
                 so past 46rem of room the panel sat against the left edge.
                 'main' centres its own only grid item, and that one is the
                 route layout's div, which fills. */
              justify-self: center;
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

          {/* Both pills label themselves through `Tooltip`, which needs a
              provider above it. The one the sidebar brings is scoped to the
              nav, and this bar is nowhere near it. */}
          <TooltipProvider>
            <div className="fixed top-3 right-3 z-3 flex items-start gap-2">
              <Info key={demoname} demo={demo} />
              <Social demoname={demoname} embed_url={embed_url} />
            </div>
          </TooltipProvider>
        </>
      )}
    </>
  );
}
