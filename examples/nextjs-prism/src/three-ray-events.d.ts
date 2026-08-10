import type { ReflectEvent } from "./components/Reflect";

// `Reflect` implements its own raycasting pass and reads these handlers straight
// off the objects it traverses, so they have to live on three's Object3D — that
// also makes them valid props on every r3f element.
declare module "three/src/core/Object3D.js" {
  interface Object3D {
    onRayOver?: (event: ReflectEvent) => void;
    onRayOut?: (event: ReflectEvent) => void;
    onRayMove?: (event: ReflectEvent) => void;
  }
}
