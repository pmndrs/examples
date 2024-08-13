import { ComponentProps } from "react";

import Page from "./page";
import { Style } from "@/components/Style";
import { getDemos } from "@/lib/helper";
import Nav from "@/components/Nav";

const demos = getDemos();

export default function Layout({
  params,
  children,
}: Readonly<{
  params: ComponentProps<typeof Page>["params"];
  children: React.ReactNode;
}>) {
  // const { demoname } = params;

  return (
    <div>
      <Style
        css={`
          @scope {
            main {
              position: fixed;
              width: 100%;
              height: 100dvh;

              display: flex;
              align-items: center;
              justify-content: center;

              > .Dev {
                max-width: 100%;
              }
            }

            .Nav {
              position: fixed;
              bottom: 0;
              width: 100%;
              overflow: auto;

              @media (min-aspect-ratio: 1/1) {
                position: static;
                display: inline-block;
              }
            }

            .Dev {
              padding-inline: 1rem;
            }

            iframe {
              width: 100%;
              min-height: 100dvh;
            }
          }
        `}
      />
      <main>{children}</main>

      <Nav demos={demos} />
    </div>
  );
}
