import { atCat } from "../cameras/dive";
import type { Location } from "../page/layout";

/** What depth of field does: how strongly it blurs, how deep the sharp zone is, and what it keeps sharp. */
export type Focus = { blur: number; range: number; on: "shot" | "tram" };

const blur = 4;

/** Depth of field for the section on screen. `'shot'` keeps sharp whatever the shot looks at. */
export function focusAt(at: Location): Focus {
  switch (at.id) {
    case "dive":
      return { blur: atCat(at.progress) ? blur : 0, range: 0.4, on: "shot" };
    case "tram":
      return { blur, range: 1.5, on: "tram" };
    case "hero":
    case "outro":
      return { blur: 0, range: 2, on: "shot" };
    case "bird":
      return { blur, range: 0.4, on: "shot" };
    default:
      return { blur, range: 2, on: "shot" };
  }
}
