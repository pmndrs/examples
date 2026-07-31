import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import { getDemos } from "@/lib/helper";
import { Style } from "@/components/Style";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { Mcu } from "material-theme-builder";

const inter = Inter({ subsets: ["latin"] });
const demos = getDemos();

/**
 * The one hex the whole palette hangs off -- poimandres' signature mint.
 * Material Color Utilities derives every `--md-sys-color-*` role from it, and
 * `globals.css` hands those on to shadcn's tokens.
 */
const MCU_SOURCE = "#5de4c7";

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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (() => {
                const storageKey = "nav-collapsed";
                const parts = window.location.pathname.split("/").filter(Boolean);
                const demosIndex = parts.indexOf("demos");
                const hasDemoSelected = demosIndex !== -1 && !!parts[demosIndex + 1];
                const nav = new URLSearchParams(window.location.search).get("nav");
                const collapsed =
                  !hasDemoSelected ? false : nav === "closed" ? true : nav === "open" ? false : localStorage.getItem(storageKey) === "1";
                document.documentElement.toggleAttribute("data-nav-collapsed", collapsed);
              })();
            `,
          }}
        />
        <Style
          css={`
            @scope {
              :scope {
                --sidebar-w: 200px;
                @media (min-width: 640px) {
                  --sidebar-w: 260px;
                }
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

                /* No background here on purpose: this block is unlayered, so
                   any value would outrank the bg-background/text-foreground
                   that globals.css puts on body in @layer base. */
                display: flex;
                height: 100dvh;
                overflow: hidden;
              }

              main {
                flex: 1;
                min-width: 0;
                height: 100dvh;
                overflow: hidden;
                display: grid;
                place-items: center;
                padding: 1.5rem;
              }
            }
          `}
        />

        {/* Injects `:root { <light roles> } .dark { <dark roles> }` -- the
            shape next-themes' `attribute="class"` already switches on, so the
            two need nothing wiring them together. */}
        <Mcu source={MCU_SOURCE}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Nav demos={demos} />
            <main>{children}</main>
            <Toaster />
          </ThemeProvider>
        </Mcu>
      </body>
    </html>
  );
}
