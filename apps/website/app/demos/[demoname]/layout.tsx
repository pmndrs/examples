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

  return <>{children}</>;
}
