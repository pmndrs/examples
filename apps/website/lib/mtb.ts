import type { MtbConfig } from "material-theme-builder";
import { pmndrsMtb } from "@/lib/md3";

/**
 * The palette this site renders: the shared pmndrs seed, and what the gallery
 * overrides of it.
 *
 * - `colorMatch: false`, `scheme: "monochrome"`: the chrome is greyscale on
 *   purpose, so that the only colour on an example page is the example.
 *   Monochrome derives every role from the source's tone alone and discards
 *   its hue. Color match has to be turned off for it: while it is on,
 *   `scheme` is ignored.
 * - The pmndrs `error` seed is kept, by decision, so monochrome greys it too:
 *   the error roles, and `--destructive` which reads them, render grey.
 * - `customColors`: only `new`, the "new" badge, in place of the seven pmndrs
 *   brand colours, which the site has no use for. Anything else the m3 roles
 *   don't cover goes here; each entry mints `--md-sys-color-<name>` and a
 *   matching `-on-` foreground. Monochrome greys `--md-sys-color-new` as well;
 *   what the site reads is its white `--md-sys-color-on-new`, while
 *   `globals.css` keeps the salmon fill as a literal.
 *
 * Spread rather than edited, so `lib/md3.ts` stays a verbatim copy of the
 * installed `md3-base` item and re-installing it is a clean overwrite.
 */
export const examplesMtb = {
  ...pmndrsMtb,
  colorMatch: false,
  scheme: "monochrome",
  customColors: [{ name: "new", hex: "#e8756a", blend: false }],
} satisfies MtbConfig;
