import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import { getDemos } from "@/lib/helper";
import { Style } from "@/components/Style";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { builder } from "material-theme-builder";

const inter = Inter({ subsets: ["latin"] });
const demos = getDemos();

/**
 * The one hex the whole palette hangs off -- poimandres' signature mint.
 * Material Color Utilities derives every `--md-sys-color-*` role from it, and
 * `globals.css` hands those on to shadcn's tokens. `scheme`, `contrast`, core
 * colour overrides and `customColors` all go in the second argument.
 */
const MCU_SOURCE = "#5de4c7";

/**
 * `:root { <light roles> } .dark { <dark roles> }` -- the shape next-themes'
 * `attribute="class"` already switches on, so the two need nothing wiring them
 * together.
 *
 * Built here rather than through the package's `<Mcu>`: this file is a server
 * component, so the palette is computed once at build time and ships inside
 * the prerendered HTML, with nothing left to do on hydration -- and, since
 * the package root is React-free as of 3.0.0, nothing reaching the browser
 * bundle either. `<Mcu>` and `useMcu` live behind `material-theme-builder/react`
 * if a runtime theme picker ever lands.
 */
const mcuCss = builder(MCU_SOURCE, { scheme: "tonalSpot" }).toCss();

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
        {/* `href` + `precedence` is what gets React to hoist this into <head>.
            Safe here because the palette is a build-time constant: React
            treats a hoisted sheet as immutable and keyed by `href`. */}
        <style
          href="mcu"
          precedence="high"
          dangerouslySetInnerHTML={{ __html: mcuCss }}
        />
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
                /* Handed to the sidebar as --sidebar-width in Nav: the
                   component sets that one inline, so a media query can only
                   reach it through a variable it reads. */
                --sidebar-w: 200px;
                @media (min-width: 640px) {
                  --sidebar-w: 260px;
                }

                /* Read by Nav too: the rail and main are flush, so this
                   padding is the whole of the clear space between the
                   two, and the Show/Hide toggle puts its right edge
                   halfway across it. */
                --main-p: 1.5rem;

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
                padding: var(--main-p);
              }
            }
          `}
        />

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
      </body>
    </html>
  );
}
