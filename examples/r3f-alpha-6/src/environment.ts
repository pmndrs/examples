import { traceStartup } from "./startup";
import {
  PMREMGenerator,
  type DataTexture,
  type WebGPURenderer,
} from "three/webgpu";
import { HDRLoader } from "three/addons/loaders/HDRLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import studioUrl from "./assets/studio_small_09_1k.hdr?url";
import type { GlassSettings } from "./controls";

/** Bundled Poly Haven studio used by Anderson's glass demo. */
export const studioReady = new HDRLoader()
  .loadAsync(studioUrl)
  .then((texture) => {
    traceStartup("Environment ready");
    return texture;
  });

/** Prefiltered reflections for the glass, from the studio HDR or a procedural room. */
export function createEnvironmentMap(
  renderer: WebGPURenderer,
  studio: DataTexture,
  choice: GlassSettings["environment"],
) {
  const pmrem = new PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const target =
    choice === "Studio HDR"
      ? pmrem.fromEquirectangular(studio)
      : pmrem.fromScene(room, 0.04);
  return {
    texture: target.texture,
    dispose() {
      target.dispose();
      room.dispose();
      pmrem.dispose();
    },
  };
}
