import { traceStartup } from "./startup";
import { glyph, slug } from "@pmndrs/glyph";
import { ThreeConfig } from "@pmndrs/glyph/three";
import manropeUrl from "./assets/Manrope-SemiBold.font.glb?url";
import spaceUrl from "./assets/SpaceGrotesk-SemiBold.font.glb?url";
import plexUrl from "./assets/IBMPlexMono-Regular.font.glb?url";

export type DisplayFont = "Manrope" | "Space Grotesk";
export type DetailFont = "IBM Plex Mono";

const display: Record<DisplayFont, string> = {
  Manrope: manropeUrl,
  "Space Grotesk": spaceUrl,
};
const detail: Record<DetailFont, string> = { "IBM Plex Mono": plexUrl };

const engine = glyph.init().then(() => {
  traceStartup("Typography engine ready");
  return glyph.handle("alpha-six", ThreeConfig);
});
const loads = new Map<string, Promise<unknown>>();
/** Starts a load once per key. Later calls share it, so `use` sees a stable promise. */
const once = <T>(key: string, load: () => Promise<T>) => {
  if (!loads.has(key)) loads.set(key, load());
  return loads.get(key) as Promise<T>;
};
const face = (url: string) =>
  once(url, () =>
    engine.then(() => glyph.fontFace(url, { format: slug }).load()),
  );

/**
 * The text handle with the chosen display and detail fonts. Only fonts in use are downloaded, and each loads
 * once. Prebaked outlines let every display choice share the same fracture pipeline.
 */
export function loadTypography(
  displayFont: DisplayFont,
  detailFont: DetailFont,
) {
  return once(`${displayFont}/${detailFont}`, async () => {
    const [handle, displayFace, detailFace] = await Promise.all([
      engine,
      face(display[displayFont]),
      face(detail[detailFont]),
    ]);
    traceStartup("Fonts ready", 0.22);
    return { handle, display: displayFace, detail: detailFace };
  });
}
export type Typography = Awaited<ReturnType<typeof loadTypography>>;
