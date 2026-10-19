import { useMemo, useRef } from "react";
import { button, folder, useControls } from "leva";
import { layoutPitch } from "./layout";
import {
  backgroundControls,
  cameraControls,
  exportSettings,
  fractureControls,
  glassControls,
  gridControls,
  typographyControls,
} from "../controls";
import type {
  BackgroundSettings,
  CameraSettings,
  FractureSettings,
  GlassSettings,
  GridSettings,
  TypographySettings,
} from "../controls";

export type GroundSettings = CameraSettings &
  TypographySettings &
  BackgroundSettings &
  GridSettings &
  GlassSettings &
  FractureSettings & {
    shadowOpacity: number;
    shaderGround: boolean;
    lightFollow: number;
    hdrFollow: number;
    lightIntensity: number;
    environmentIntensity: number;
    lift: number;
    copyStretch: number;
    footerOnGround: boolean;
    windup: number;
    gravity: number;
    bounce: number;
    friction: number;
    shardCollisions: boolean;
    cursorCollider: boolean;
    cursorSize: number;
  };

export function useGroundSettings() {
  const actions = useRef({ export: () => {}, resetCamera: () => {} });
  const camera: CameraSettings = {
    cameraMode: "Pointer",
    cameraYaw: 0.1,
    cameraPitch: layoutPitch,
    cameraZoom: 0.91,
    parallax: 0.25,
    pointerX: 8,
    pointerY: 5,
    cameraSmoothing: 2,
    orbitSpeed: 0.5,
  };
  // The shader's own controls only show while it is on, and it animates whenever it is on.
  const {
    animate: _animate,
    baseColor: _baseColor,
    ...shader
  } = backgroundControls();
  const shaderControls = Object.fromEntries(
    Object.entries(shader).map(([key, input]) => [
      key,
      {
        ...input,
        render: (get: (path: string) => unknown) =>
          !!get("Ground.shaderGround"),
      },
    ]),
  );
  const [values, set] = useControls(
    () => ({
      "Export settings": button(() => actions.current.export()),
      Camera: folder(
        cameraControls(camera, [14, 70], () => actions.current.resetCamera()),
      ),
      Typography: folder(typographyControls(), { collapsed: true }),
      Ground: folder(
        {
          // Without the shader the floor is this one flat color, so it is the page background.
          baseColor: { label: "Background color", value: "#c0c1c1" },
          shaderGround: { label: "Shader background", value: true },
          ...shaderControls,
          ...gridControls(),
          gridColor: { label: "Grid color", value: "#000000" },
          gridOpacity: {
            label: "Grid opacity",
            value: 0.13,
            min: 0,
            max: 0.7,
            step: 0.01,
          },
          shadowOpacity: {
            label: "Shadow",
            value: 0.1,
            min: 0,
            max: 1,
            step: 0.01,
          },
          copyStretch: {
            label: "Copy stretch",
            value: 0.36,
            min: 0,
            max: 1,
            step: 0.01,
          },
          footerOnGround: { label: "Footer on ground", value: false },
        },
        { collapsed: true },
      ),
      "Glass & lighting": folder(
        {
          ...glassControls(),
          lift: {
            label: "Lift off ground (em)",
            value: 0.09,
            min: 0,
            max: 2,
            step: 0.01,
          },
          lightIntensity: {
            label: "Light intensity",
            value: 6,
            min: 0,
            max: 6,
            step: 0.05,
          },
          environmentIntensity: {
            label: "Environment intensity",
            value: 1.75,
            min: 0,
            max: 4,
            step: 0.05,
          },
          hdrFollow: {
            label: "HDR follows cursor",
            value: 0.43,
            min: 0,
            max: 1,
            step: 0.01,
          },
          lightFollow: {
            label: "Light follows cursor",
            value: 1,
            min: 0,
            max: 1,
            step: 0.01,
          },
        },
        { collapsed: true },
      ),
      "Strike & shards": folder(
        {
          ...fractureControls(),
          windup: {
            label: "Wind-up (em)",
            value: 1.1,
            min: 0.3,
            max: 2.5,
            step: 0.05,
          },
          gravity: { label: "Gravity", value: 9, min: 2, max: 25, step: 0.5 },
          bounce: {
            label: "Bounce",
            value: 0.25,
            min: 0,
            max: 0.8,
            step: 0.01,
          },
          friction: {
            label: "Friction",
            value: 0.6,
            min: 0,
            max: 1.5,
            step: 0.05,
          },
          shardCollisions: { label: "Shard spheres", value: true },
          cursorCollider: { label: "Cursor collider", value: true },
          cursorSize: {
            label: "Cursor size (em)",
            value: 0.3,
            min: 0.1,
            max: 1,
            step: 0.05,
          },
        },
        { collapsed: true },
      ),
    }),
    [],
  );
  const settings = useMemo(
    () =>
      ({
        ...values,
        animate: values.shaderGround,
      }) as unknown as GroundSettings,
    [values],
  );
  actions.current.export = () =>
    exportSettings(settings, "r3f-alpha-6-settings.json");
  actions.current.resetCamera = () => set(camera);
  return {
    settings,
    setCameraPose: (
      pose: Pick<CameraSettings, "cameraYaw" | "cameraPitch" | "cameraZoom">,
    ) => set(pose),
  };
}
