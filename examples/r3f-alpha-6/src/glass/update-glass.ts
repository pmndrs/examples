import type { createGlass } from "./create-glass";
import type { GlassSettings } from "../controls";

/** Pushes the live panel values into the shared glass material. */
export function updateGlass(
  glass: ReturnType<typeof createGlass>,
  settings: GlassSettings,
  time: number,
) {
  glass.params.ior.value = settings.ior;
  glass.params.thickness.value = settings.thickness;
  glass.material.envMapIntensity = settings.reflections;
  glass.material.color.set(settings.glassTint);
  glass.material.roughness = settings.roughness;
  glass.material.dispersion = settings.dispersion;
  glass.params.distortion.value = settings.distortion;
  glass.params.time.value = time;
  glass.config.backside = settings.backside;
  glass.config.backsideThickness = settings.thickness;
  glass.params.backsideThickness.value = settings.thickness;
}
