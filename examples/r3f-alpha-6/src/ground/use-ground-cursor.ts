import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { Plane, Raycaster, Vector2, Vector3 } from "three/webgpu";

/**
 * Tracks where the pointer meets the ground at y = 0 and where it was last pressed. A press is kept until
 * the next read so a quick tap still counts. The panel and links stay clickable without disturbing the scene.
 */
export function useGroundCursor() {
  const { camera, renderer, invalidate } = useThree();
  const state = useRef({
    ndc: null as Vector2 | null,
    press: null as Vector2 | null,
  });

  useEffect(() => {
    const locate = (event: PointerEvent) => {
      if (
        event.target instanceof Element &&
        event.target.closest("[data-design-controls]")
      ) {
        state.current.ndc = null;
        return;
      }
      const bounds = renderer.domElement.getBoundingClientRect();
      (state.current.ndc ??= new Vector2()).set(
        ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
        1 - ((event.clientY - bounds.top) / bounds.height) * 2,
      );
      invalidate();
    };
    const press = (event: PointerEvent) => {
      locate(event);
      if (
        state.current.ndc &&
        event.button === 0 &&
        !(
          event.target instanceof Element &&
          event.target.closest("a, button, input, [data-design-controls]")
        )
      )
        state.current.press = state.current.ndc.clone();
    };
    const leave = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || event.type === "pointerleave")
        state.current.ndc = null;
    };
    const blur = () => {
      state.current.ndc = null;
    };
    window.addEventListener("pointermove", locate, { passive: true });
    window.addEventListener("pointerdown", press);
    window.addEventListener("pointerup", leave);
    document.documentElement.addEventListener("pointerleave", leave);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("pointermove", locate);
      window.removeEventListener("pointerdown", press);
      window.removeEventListener("pointerup", leave);
      document.documentElement.removeEventListener("pointerleave", leave);
      window.removeEventListener("blur", blur);
    };
  }, [renderer, invalidate]);

  const raycaster = new Raycaster(),
    ground = new Plane(new Vector3(0, 1, 0), 0);
  const onGround = (ndc: Vector2 | null) => {
    if (!ndc) return undefined;
    raycaster.setFromCamera(ndc, camera);
    return raycaster.ray.intersectPlane(ground, new Vector3()) ?? undefined;
  };
  /** The ground points under the pointer and under a press since the previous read, plus the pointer in screen space. */
  return () => {
    const { ndc, press } = state.current;
    state.current.press = null;
    return { point: onGround(ndc), press: onGround(press), ndc };
  };
}
