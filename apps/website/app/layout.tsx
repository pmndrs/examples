import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import { getDemos } from "@/lib/helper";

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
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @scope {
                :scope {background:#eee;}
                
                main {
                  position:fixed; width:100%; height:100dvh;
                }
              }
            `,
          }}
        />

        <main>{children}</main>
        <Nav demos={demos} />
      </body>
    </html>
  );
}
