import { notFound } from "next/navigation";

import { ScaledExampleFrame } from "@/components/ScaledExampleFrame";
import { getExamples } from "@/lib/helper";
import { Dev } from "./Dev";
import { TooltipProvider } from "@/components/ui/tooltip";

import { Social } from "./Social";
import { Info } from "./Info";

const examples = getExamples();

export type Props = {
  params: Promise<{ examplename: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { examplename } = await params;
  const example = examples.find(({ name }) => name === examplename);
  if (!example) return;

  const title = `${example.title} - pmndrs`;
  const description = example.description;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: example.website_url,
      images: [
        {
          url: example.thumb,
          // width: 800,
          // height: 600,
          alt: `${example.title} capture of the example`,
        },
      ],
      type: "website",
    },
  };
}

export async function generateStaticParams() {
  return examples.map(({ name }) => ({
    examplename: name,
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
  const { examplename } = await props.params;
  const example = examples.find(({ name }) => name === examplename);
  if (!example) return notFound();

  const { embed_url } = example;

  let isUp;
  if (isDev) {
    isUp = await checkUrlIsUp(embed_url);
  }
  // console.log("isUp=", isUp);

  return (
    <>
      {isDev && !isUp ? (
        <Dev examplename={examplename} />
      ) : (
        <>
          <div className="h-full min-h-0 w-full min-w-0">
            <ScaledExampleFrame src={embed_url} title={example.title} />
          </div>

          {/* Both pills label themselves through `Tooltip`, which needs a
              provider above it. The one the sidebar brings is scoped to the
              nav, and this bar is nowhere near it. */}
          <TooltipProvider>
            <div className="fixed top-3 right-3 z-3 flex items-start gap-2">
              <Info key={examplename} example={example} />
              <Social examplename={examplename} embed_url={embed_url} />
            </div>
          </TooltipProvider>
        </>
      )}
    </>
  );
}
