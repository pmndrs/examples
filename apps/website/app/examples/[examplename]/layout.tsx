import { ComponentProps } from "react";

import Page from "./page";

export default function Layout({
  params,
  children,
}: Readonly<{
  params: ComponentProps<typeof Page>["params"];
  children: React.ReactNode;
}>) {
  // const { examplename } = params;

  return (
    /* `min-h-0`/`min-w-0` against the grid item's `auto` minimum: without them
       a example taller than the viewport grows this box instead of being scaled
       down inside it. */
    <div className="grid h-full min-h-0 w-full min-w-0">{children}</div>
  );
}
