import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import { getDemos } from "@/lib/helper";
import { Style } from "@/components/Style";

const inter = Inter({ subsets: ["latin"] });
const demos = getDemos();

export const metadata: Metadata = {
  title: "pmndrs examples",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Style
          css={`
            @scope {
              :scope {
                background: #eee;
              }

              main {
                position: fixed;
                width: 100%;
                height: 100dvh;
              }

              .Nav {
                position: fixed;
                bottom: 0;
                width: 100%;
                overflow: auto;

                @media (min-aspect-ratio: 1/1) {
                  display: inline-block;
                  position: static;
                }
              }
            }
          `}
        />

        <main>{children}</main>
        <Nav demos={demos} />
      </body>
    </html>
  );
}
