import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { MathUtils, Vector2, Vector3 } from "three/webgpu";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import type { CameraSettings } from "./controls";
import type { Playback } from "./shell/use-playback";

const origin = new Vector3();
type CameraPose = Pick<
  CameraSettings,
  "cameraYaw" | "cameraPitch" | "cameraZoom"
>;

/**
 * Keep pointer animation separate from the saved camera pose.
 * `pitch` bounds drag orbiting and `pointerPitch` bounds the pose plus cursor offset, both in degrees above the horizon.
 */
export function useCameraRig(
  settings: CameraSettings,
  playback: React.RefObject<Playback>,
  onPose: (pose: CameraPose) => void,
  {
    distance = 1000,
    pitch = [-45, 45],
    pointerPitch = [-75, 75],
  }: {
    distance?: number;
    pitch?: [number, number];
    pointerPitch?: [number, number];
  } = {},
) {
  const { camera, renderer, invalidate } = useThree();
  const controls = useRef<OrbitControls | null>(null);
  const pointer = useRef(new Vector2());
  const offset = useRef(new Vector2());
  const live = useRef({ settings, onPose });
  live.current = { settings, onPose };

  useEffect(() => {
    const orbit = new OrbitControls(camera, renderer.domElement);
    controls.current = orbit;
    // Panning slides along the ground instead of the screen plane. Wheel zoom is only for the orthographic flat layout.
    orbit.enablePan = camera.type === "PerspectiveCamera";
    orbit.screenSpacePanning = false;
    orbit.enableZoom = camera.type !== "PerspectiveCamera";
    orbit.enableDamping = false;
    orbit.minAzimuthAngle = MathUtils.degToRad(-60);
    orbit.maxAzimuthAngle = MathUtils.degToRad(60);
    orbit.minPolarAngle = MathUtils.degToRad(90 - pitch[1]);
    orbit.maxPolarAngle = MathUtils.degToRad(90 - pitch[0]);
    orbit.minZoom = 0.65;
    orbit.maxZoom = 1.8;
    const save = () =>
      live.current.onPose({
        cameraYaw: MathUtils.radToDeg(orbit.getAzimuthalAngle()),
        cameraPitch: 90 - MathUtils.radToDeg(orbit.getPolarAngle()),
        cameraZoom: camera.zoom,
      });
    const change = () => invalidate();
    orbit.addEventListener("change", change);
    orbit.addEventListener("end", save);
    const reset = () => {
      pointer.current.set(0, 0);
      invalidate();
    };
    const move = (event: PointerEvent) => {
      if (
        event.pointerType !== "mouse" ||
        playback.current.reduced ||
        live.current.settings.cameraMode !== "Pointer"
      )
        return;
      if (
        event.target instanceof Element &&
        event.target.closest("[data-design-controls]")
      ) {
        reset();
        return;
      }
      const bounds = renderer.domElement.getBoundingClientRect();
      pointer.current.set(
        MathUtils.clamp(
          ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
          -1,
          1,
        ),
        MathUtils.clamp(
          1 - ((event.clientY - bounds.top) / bounds.height) * 2,
          -1,
          1,
        ),
      );
      invalidate();
    };
    const hold = (event: WheelEvent) => event.preventDefault();
    renderer.domElement.addEventListener("wheel", hold, { passive: false });
    window.addEventListener("pointermove", move, { passive: true });
    renderer.domElement.addEventListener("pointerleave", reset);
    window.addEventListener("blur", reset);
    return () => {
      orbit.removeEventListener("change", change);
      orbit.removeEventListener("end", save);
      orbit.dispose();
      controls.current = null;
      renderer.domElement.removeEventListener("wheel", hold);
      window.removeEventListener("pointermove", move);
      renderer.domElement.removeEventListener("pointerleave", reset);
      window.removeEventListener("blur", reset);
      renderer.domElement.style.cursor = "";
    };
    // The pitch limits are compared by value so a new tuple with the same range keeps the controls.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera, renderer, invalidate, playback, pitch[0], pitch[1]]);

  useEffect(() => {
    const orbit = controls.current;
    if (!orbit) return;
    // The flat layout's orthographic camera keeps its old behavior: live only in Orbit mode.
    orbit.enabled =
      camera.type === "PerspectiveCamera" || settings.cameraMode === "Orbit";
    // Dragging only rotates in Orbit mode. Pan stays live in every mode.
    orbit.enableRotate = settings.cameraMode === "Orbit";
    orbit.rotateSpeed = settings.orbitSpeed;
    renderer.domElement.style.cursor = orbit.enableRotate ? "grab" : "";
    renderer.domElement.style.touchAction = orbit.enabled ? "none" : "auto";
    offset.current.set(0, 0);
    pointer.current.set(0, 0);
    camera.position
      .setFromSphericalCoords(
        distance,
        MathUtils.degToRad(90 - settings.cameraPitch),
        MathUtils.degToRad(settings.cameraYaw),
      )
      .add(orbit.target);
    camera.zoom = settings.cameraZoom;
    camera.updateProjectionMatrix();
    camera.lookAt(orbit.target);
    orbit.update();
    invalidate();
  }, [
    camera,
    renderer,
    invalidate,
    distance,
    settings.cameraMode,
    settings.cameraYaw,
    settings.cameraPitch,
    settings.cameraZoom,
    settings.orbitSpeed,
  ]);

  return (delta: number) => {
    const s = live.current.settings;
    if (s.cameraMode !== "Orbit") {
      const strength =
        s.cameraMode === "Pointer" && !playback.current.reduced
          ? s.parallax
          : 0;
      const blend = 1 - Math.exp(-s.cameraSmoothing * Math.min(delta, 0.05));
      offset.current.x = MathUtils.lerp(
        offset.current.x,
        pointer.current.x * s.pointerX * strength,
        blend,
      );
      offset.current.y = MathUtils.lerp(
        offset.current.y,
        pointer.current.y * s.pointerY * strength,
        blend,
      );
      const target = controls.current?.target ?? origin;
      camera.position
        .setFromSphericalCoords(
          distance,
          MathUtils.degToRad(
            90 -
              MathUtils.clamp(
                s.cameraPitch + offset.current.y,
                pointerPitch[0],
                pointerPitch[1],
              ),
          ),
          MathUtils.degToRad(
            MathUtils.clamp(s.cameraYaw + offset.current.x, -80, 80),
          ),
        )
        .add(target);
      camera.lookAt(target);
    }
    camera.updateMatrixWorld();
  };
}
