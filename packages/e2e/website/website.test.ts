import { expect, test } from "@playwright/test";
import { golden } from "./golden.ts";

//
// The shadcn tokens the website's components read. The `--md-sys-color-*`
// roles are not listed: the test takes whichever the page defines, so a role
// that disappears or appears is a diff too.
//
const SHADCN_TOKENS = [
  "--background",
  "--foreground",
  "--card",
  "--card-foreground",
  "--popover",
  "--popover-foreground",
  "--primary",
  "--primary-foreground",
  "--secondary",
  "--secondary-foreground",
  "--muted",
  "--muted-foreground",
  "--accent",
  "--accent-foreground",
  "--destructive",
  "--border",
  "--input",
  "--ring",
  "--sidebar",
  "--sidebar-foreground",
  "--sidebar-primary",
  "--sidebar-primary-foreground",
  "--sidebar-accent",
  "--sidebar-accent-foreground",
  "--sidebar-border",
  "--sidebar-ring",
  "--new",
  "--new-foreground",
];

test("renders the colour tokens captured on main", async ({ page }) => {
  await page.goto("./");

  const colorTokens = await page.evaluate((shadcnTokens) => {
    const root = document.documentElement;
    const rootStyle = getComputedStyle(root);

    const roles = [...rootStyle]
      .filter((name) => name.startsWith("--md-sys-color-"))
      .sort();

    //
    // The computed value of a custom property is its tokens with the `var()`s
    // substituted, nothing more: `--border` reads `color-mix(in oklab, #c6c6c6
    // 75%, #ffffff)`, and the same colour written as a hex would read as a
    // change. A probe that paints each one turns it into the colour itself.
    // It sits right under the root, so it inherits the root's values and
    // nothing a descendant overrides.
    //
    const probe = document.createElement("div");
    root.append(probe);

    const entries = [...roles, ...shadcnTokens].map((name) => {
      // An undefined token would make `color: var(...)` fall back to the
      // inherited colour, and read as a colour it never had.
      if (!rootStyle.getPropertyValue(name).trim()) return [name, null];

      probe.style.color = `var(${name})`;
      return [name, getComputedStyle(probe).color];
    });

    probe.remove();
    return Object.fromEntries(entries);
  }, SHADCN_TOKENS);

  expect(colorTokens).toEqual(golden.colorTokens);
});

//
// The tab shows the pmndrs logo -- the static ("idle") one the design-system
// `logo` item installs under `public/pmndrs/`. Fetched through the page's own
// link, so a link that forgets `BASE_PATH` 404s rather than passing.
//
test("uses the pmndrs logo as its favicon", async ({ page }) => {
  await page.goto("./");

  const href = await page.locator('link[rel="icon"]').getAttribute("href");
  expect(href).toBe(`${process.env.BASE_PATH ?? ""}/pmndrs/logo_idle.svg`);

  const response = await page.request.get(href!);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toMatch(/^image\/svg\+xml/);
});

//
// Code, keyboard, sample and preformatted text use the pmndrs monospace -- the
// design-system `font-mono` item. A `code` probe, as the home page need not
// have one. Its face is checked as loaded, not merely named: a font file the
// export serves outside `BASE_PATH` would leave the family set and the text in
// a fallback.
//
test("sets code in the shared monospace face", async ({ page }) => {
  await page.goto("./");

  const face = await page.evaluate(async () => {
    const probe = document.createElement("code");
    probe.textContent = "pmndrs";
    document.body.append(probe);

    const family = getComputedStyle(probe).fontFamily;
    const first = family
      .split(",")[0]
      .trim()
      .replace(/^["']|["']$/g, "");
    const faces = await document.fonts.load(`16px "${first}"`, "pmndrs");

    probe.remove();
    return {
      family: first,
      loaded: faces.some((fontFace) => fontFace.status === "loaded"),
    };
  });

  expect(face.family).toBe(golden.monoFamily);
  expect(face.loaded).toBe(true);
});
