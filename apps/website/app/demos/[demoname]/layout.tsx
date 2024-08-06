import { ComponentProps } from "react";

import Page from "./page";

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
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @scope {
              :scope {
                height:100%;
                display:flex; align-items:center; justify-content:center;
                >.Dev {max-width:100%;}
              }

              .Dev {padding-inline:1rem;}
              iframe {width:100%; min-height:100dvh;}
            }
          `,
        }}
      />
      {children}
    </div>
  );
}
