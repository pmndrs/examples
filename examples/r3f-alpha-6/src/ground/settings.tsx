import { useMemo, useRef } from "react";
import { button, folder, useControls } from "leva";
import { layoutPitch } from "./layout";
import { windupAt } from "./choreography";
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
    flyIn: boolean;
    flyDuration: number;
    flySettleDuration: number;
    flyOvershoot: number;
    flyImpact: number;
    flyYaw: number;
    flyStartPitch: number;
    flyPitch: number;
    flyRoll: number;
    flyDistance: number;
    flyPassDistance: number;
    flyRush: number;
    flyWiden: number;
    flyShake: number;
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
  const flying = (get: (path: string) => unknown) =>
    !!get("Camera.Fly-in.flyIn");
  const fracture = fractureControls();
  const [values, set] = useControls(
    () => ({
      "Export settings": button(() => actions.current.export()),
      Camera: folder({
        ...cameraControls(camera, [14, 70], () =>
          actions.current.resetCamera(),
        ),
        "Fly-in": folder({
          flyIn: { label: "Fly in on play", value: true },
          flyOvershoot: {
            label: "Overshoot",
            value: 1,
            min: 0,
            max: 2,
            step: 0.05,
            render: flying,
          },
          flyImpact: {
            label: "Impact",
            value: 1,
            min: 0,
            max: 2,
            step: 0.05,
            render: flying,
          },
          Rush: folder(
            {
              flyRush: {
                label: "Stop at (s)",
                value: 0.75,
                min: 0.4,
                max: 3,
                step: 0.05,
              },
              flyDistance: {
                label: "Start distance",
                value: 4.5,
                min: 1,
                max: 10,
                step: 0.1,
              },
              flyPassDistance: {
                label: "Stop distance",
                value: 0.9,
                min: 0.4,
                max: 2,
                step: 0.01,
              },
              flyStartPitch: {
                label: "Start pitch",
                value: 72,
                min: 0,
                max: 80,
                step: 0.1,
              },
              flyPitch: {
                label: "Stop pitch",
                value: 15,
                min: 2,
                max: 80,
                step: 0.1,
              },
              flyYaw: {
                label: "Start yaw",
                value: -30,
                min: -80,
                max: 80,
                step: 0.1,
              },
              flyRoll: {
                label: "Bank at speed",
                value: -4,
                min: -30,
                max: 30,
                step: 0.5,
              },
              flyWiden: {
                label: "Speed lens",
                value: 0.25,
                min: 0,
                max: 0.5,
                step: 0.01,
              },
              flyShake: {
                label: "Shake (°)",
                value: 0.2,
                min: 0,
                max: 1,
                step: 0.01,
              },
            },
            { render: flying },
          ),
          Climb: folder(
            {
              flyDuration: {
                label: "Arrival (s)",
                value: 2.05,
                min: 0.5,
                max: 6,
                step: 0.1,
              },
              flySettleDuration: {
                label: "Settle (s)",
                value: 3.5,
                min: 1,
                max: 8,
                step: 0.1,
              },
            },
            { render: flying },
          ),
        }),
      }),
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
          ...fracture,
          breakDelay: {
            ...fracture.breakDelay,
            render: (get: (path: string) => unknown) => !flying(get),
          },
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
        // The brake loads the wind-up, so the strike lands while the camera is still swinging up.
        breakDelay: values.flyIn ? windupAt(values.flyRush) : values.breakDelay,
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
