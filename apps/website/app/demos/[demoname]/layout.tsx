import { ComponentProps } from "react";

import Page from "./page";
import { Style } from "@/components/Style";

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
            :scope {
              width: 100%;
              height: 100%;
              min-width: 0;
              min-height: 0;
              display: grid;
            }
          }
        `}
      />
      {children}
    </div>
  );
}
