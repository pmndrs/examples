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
                --sidebar-w: 260px;
                --motion-curve: linear(
                  0.00, 0.00780, 0.0340, 0.0738, 0.116, 0.160, 0.203, 0.244,
                  0.284, 0.322, 0.357, 0.391, 0.422, 0.453, 0.483, 0.510,
                  0.536, 0.561, 0.583, 0.606, 0.627, 0.646, 0.665, 0.683,
                  0.700, 0.716, 0.731, 0.745, 0.759, 0.771, 0.784, 0.795,
                  0.806, 0.816, 0.826, 0.835, 0.844, 0.852, 0.859, 0.867,
                  0.874, 0.881, 0.887, 0.893, 0.899, 0.904, 0.909, 0.914,
                  0.919, 0.923, 0.927, 0.931, 0.935, 0.938, 0.941, 0.944,
                  0.947, 0.950, 0.953, 0.955, 0.958, 0.960, 0.962, 0.964,
                  0.966, 0.968, 0.969, 0.971, 0.973, 0.974, 0.975, 0.977,
                  0.978, 0.979, 0.980, 0.981, 0.982, 0.983, 0.984, 0.985,
                  0.986, 0.987, 0.987, 0.988, 0.989, 0.989, 0.990, 0.990,
                  0.991, 0.991, 0.992, 0.992, 0.993, 0.993, 0.993, 0.994,
                  0.994, 0.994, 0.995, 0.995, 0.995, 0.995, 0.996, 0.996,
                  0.996, 0.996, 0.997, 0.997, 0.997, 0.997, 0.997, 0.997,
                  0.998, 0.998, 0.998, 0.998, 0.998, 0.998, 0.998, 0.998,
                  0.998, 0.998, 0.999, 0.999, 0.999, 0.999, 0.999, 0.999,
                  0.999, 0.999, 1.00
                );

                background: #eee;
                display: grid;
                grid-template-columns: var(--sidebar-w) 1fr;
                height: 100dvh;
                transition: grid-template-columns 1078ms var(--motion-curve);
              }

              :scope:has(.Nav[data-collapsed]) {
                grid-template-columns: 0px 1fr;
              }

              main {
                width: 100%;
                height: 100dvh;
                overflow: hidden;
                display: grid;
                place-items: center;
                padding: 1.5rem;
                min-width: 0;
                min-height: 0;
              }
            }
          `}
        />

        <Nav demos={demos} />
        <main>{children}</main>
      </body>
    </html>
  );
}
