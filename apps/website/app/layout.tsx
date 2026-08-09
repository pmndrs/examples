import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/react";
import "./globals.css";
import Nav from "@/components/Nav";
import { getExamples } from "@/lib/helper";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { builder } from "material-theme-builder";

const inter = Inter({ subsets: ["latin"] });
const examples = getExamples();

/**
 * Two things only the client knows, both needed before the first paint, so the
 * blocking script below runs this and leaves the verdict on <html>: whether the
 * rail starts collapsed, and whether this is a filtered arrival — `?q=`
 * /`?library=`, whose list must not paint whole while the JS that will narrow
 * it is still loading. `globals.css` acts on both marks and `Nav` takes them
 * over, then drops them. A filter beats a stored collapse: a shared link has to
 * be able to show what it filtered down to.
 *
 * A function rather than a template string, so it is typed, formatted and
 * linted like everything else — `String(bootNav)` is what ends up in the page.
 * The catch that comes with that: it has to stay hermetic. No imports, no
 * module-level constants, nothing but its arguments, or the bundler leaves a
 * dangling reference in the string. Hence the storage key coming in as one —
 * `Nav` owns the other half of that contract.
 */
function bootNav(storageKey: string) {
  const params = new URLSearchParams(window.location.search);
  const filtering = !!(params.get("q") || params.get("library"));

  const isCollapsed = () => {
    const parts = window.location.pathname.split("/").filter(Boolean);
    const examplesIndex = parts.indexOf("examples");
    const onAnExample = examplesIndex !== -1 && !!parts[examplesIndex + 1];

    /* Two cases where the rail stays out whatever this visitor last left it
       at: the index, where there is nothing to look at beside it, and a
       shared filter link, which has to show what it filtered down to. */
    if (!onAnExample || filtering) return false;

    /* Then `?nav=`, a link saying how it wants to arrive… */
    const nav = params.get("nav");
    if (nav === "closed") return true;
    if (nav === "open") return false;

    /* …and failing that, wherever this visitor left it. */
    return localStorage.getItem(storageKey) === "1";
  };

  const root = document.documentElement;
  root.toggleAttribute("data-nav-collapsed", isCollapsed());
  root.toggleAttribute("data-nav-filtering", filtering);
}

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
          between the rail and the example, which the Show/Hide toggle straddles. */}
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
          "**:data-[slot=sheet-overlay]:backdrop-filter-none",
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
        {/* Blocking on purpose: `bootNav` settles what the rail looks like
            before anything paints. */}
        <script
          dangerouslySetInnerHTML={{ __html: `(${bootNav})("nav-collapsed")` }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {/* `Nav` is the only nuqs consumer, so the adapter wraps it alone.

              The plain-React adapter, not `nuqs/adapters/next/app`: this site
              is `output: "export"`, so there is no server for the Next adapter
              to talk to — and its provider calls `useSearchParams`, which on a
              prerendered route drops everything up to the nearest `<Suspense>`
              out of the static HTML. That is the whole rail, all ~160 example
              links included. This adapter reads `location.search` through
              `useSyncExternalStore` with an empty server snapshot, so the rail
              still ships prerendered and picks the params up on hydration —
              which is exactly what the hand-rolled version did. */}
          <NuqsAdapter>
            <Nav examples={examples} />
          </NuqsAdapter>
          <main className="grid h-dvh min-w-0 flex-1 place-items-center overflow-hidden p-(--main-p)">
            {children}
          </main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
