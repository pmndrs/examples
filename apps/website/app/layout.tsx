import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import { getDemos } from "@/lib/helper";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { builder } from "material-theme-builder";

const inter = Inter({ subsets: ["latin"] });
const demos = getDemos();

/**
 * The one hex the whole palette hangs off -- poimandres' signature mint.
 * Material Color Utilities derives every `--md-sys-color-*` role from it, and
 * `globals.css` hands those on to shadcn's tokens. `scheme`, `contrast`, core
 * colour overrides and `customColors` all go in the second argument.
 *
 * Kept even though `monochrome` throws the hue away: it is what the source
 * *is*, and it is the one line to change to see the site in colour again --
 * every other scheme reads it.
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
const mcuCss = builder(MCU_SOURCE, {
  scheme: "monochrome",
  customColors: [{ name: "new", hex: "#e8756a", blend: false }],
}).toCss();

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
      {/* No `bg-*` on the body: `globals.css` paints it in `@layer base`, and a
          utility here would win over it in both schemes. The two custom
          properties are read by `Nav` — `--sidebar-w` is handed to the sidebar
          as `--sidebar-width`, which the component writes inline, so a media
          query can only reach it through a variable like this one; `--main-p`
          is `main`'s padding below, and so the whole of the clear space
          between the rail and the demo, which the Show/Hide toggle straddles. */}
      <body
        className={cn(
          inter.className,
          "flex h-dvh overflow-hidden",
          "[--main-p:1.5rem] [--sidebar-w:200px] sm:[--sidebar-w:260px]",
          /* Radix portals the mobile sidebar's overlay under <body>, outside
             `Nav`, so this is the nearest call site that can reach it. Keep
             the dim layer, but remove backdrop filtering: re-blurring a live
             WebGL canvas throughout the sheet animation is prohibitively
             expensive on mobile GPUs. */
          "[&_[data-slot=sheet-overlay]]:backdrop-filter-none",
        )}
      >
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
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Nav demos={demos} />
          <main className="grid h-dvh min-w-0 flex-1 place-items-center overflow-hidden p-(--main-p)">
            {children}
          </main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
