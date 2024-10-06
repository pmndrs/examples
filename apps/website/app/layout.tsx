import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { Style } from "@/components/Style";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "pmndrs examples",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fsMin = 16;
  const fsMax = 32;
  const wMin = 400;
  const wMax = 2500;
  const slope = (fsMax - fsMin) / (wMax - wMin);
  const yAxisIntersection = -wMin * slope + fsMin;

  return (
    <html lang="en">
      <body className={inter.className}>
        <Style
          css={`
            @scope {
              :scope {
                background: #eee;

                --fs: clamp(
                  ${fsMin}px,
                  ${yAxisIntersection}px + ${slope * 100}vw,
                  ${fsMax}px
                );
              }
            }
          `}
        />

        {children}
      </body>
    </html>
  );
}
