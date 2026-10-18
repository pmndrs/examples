import { button } from "leva";
import type { DisplayFont, DetailFont } from "./typography";

export type CameraSettings = {
  cameraMode: "Pointer" | "Orbit" | "Fixed";
  cameraYaw: number;
  cameraPitch: number;
  cameraZoom: number;
  parallax: number;
  pointerX: number;
  pointerY: number;
  cameraSmoothing: number;
  orbitSpeed: number;
};
export type TypographySettings = {
  displayFont: DisplayFont;
  detailFont: DetailFont;
};
export type BackgroundSettings = {
  animate: boolean;
  speed: number;
  shape: number;
  scale: number;
  baseColor: string;
  color1: string;
  color2: string;
  color3: string;
  softness: number;
  intensity: number;
  grain: number;
};
export type GridSettings = {
  grid: boolean;
  gridColor: string;
  gridOpacity: number;
  gridSize: number;
  crosshairs: boolean;
  crosshairSpacing: number;
};
export type GlassSettings = {
  environment: "Studio HDR" | "Soft room";
  environmentRotation: number;
  ior: number;
  thickness: number;
  reflections: number;
  roughness: number;
  dispersion: number;
  glassTint: string;
  distortion: number;
  backside: boolean;
  depth: number;
  bevel: number;
};
export type FractureSettings = {
  breakDelay: number;
  fragmentCount: number;
  fractureSeed: number;
  explosion: number;
};

/** Leva schemas shared by every layout. Each layout wraps them in its own folders. */
export function cameraControls(
  pose: CameraSettings,
  pitch: [number, number],
  reset: () => void,
) {
  return {
    cameraMode: {
      label: "Control mode",
      value: pose.cameraMode,
      options: {
        "Follow cursor": "Pointer",
        "Drag to orbit": "Orbit",
        "Fixed view": "Fixed",
      },
    },
    cameraYaw: {
      label: "Yaw",
      value: pose.cameraYaw,
      min: -60,
      max: 60,
      step: 0.1,
    },
    cameraPitch: {
      label: "Pitch",
      value: pose.cameraPitch,
      min: pitch[0],
      max: pitch[1],
      step: 0.1,
    },
    cameraZoom: {
      label: "Zoom",
      value: pose.cameraZoom,
      min: 0.65,
      max: 1.8,
      step: 0.01,
    },
    parallax: {
      label: "Cursor strength",
      value: pose.parallax,
      min: 0,
      max: 3,
      step: 0.05,
    },
    pointerX: {
      label: "Horizontal °",
      value: pose.pointerX,
      min: 0,
      max: 20,
      step: 0.5,
    },
    pointerY: {
      label: "Vertical °",
      value: pose.pointerY,
      min: 0,
      max: 15,
      step: 0.5,
    },
    cameraSmoothing: {
      label: "Follow speed",
      value: pose.cameraSmoothing,
      min: 1,
      max: 20,
      step: 0.5,
    },
    orbitSpeed: {
      label: "Drag speed",
      value: pose.orbitSpeed,
      min: 0.1,
      max: 2,
      step: 0.05,
    },
    "Reset camera": button(reset),
  };
}

export function typographyControls() {
  return {
    displayFont: {
      label: "Display font",
      value: "Manrope",
      options: ["Manrope", "Space Grotesk"],
    },
    detailFont: {
      label: "Small labels",
      value: "IBM Plex Mono",
      options: ["IBM Plex Mono"],
    },
  };
}

export function backgroundControls() {
  return {
    animate: { label: "Animate scene", value: true },
    speed: { label: "Flow speed", value: 0.55, min: 0, max: 2, step: 0.05 },
    shape: {
      label: "Shape",
      value: 1,
      options: { Wave: 1, Ripple: 2, Blob: 3 },
    },
    scale: { label: "Scale", value: 1.8, min: 0.3, max: 5, step: 0.05 },
    baseColor: { label: "Base", value: "#eeede8" },
    color1: { label: "Color 1", value: "#95aab4" },
    color2: { label: "Orange / heading", value: "#d6a586" },
    color3: { label: "Color 3", value: "#fff8e8" },
    softness: { label: "Softness", value: 0.65, min: 0, max: 1, step: 0.01 },
    intensity: {
      label: "Grain distortion",
      value: 0.22,
      min: 0,
      max: 1,
      step: 0.01,
    },
    grain: { label: "Grain", value: 0.13, min: 0, max: 0.6, step: 0.01 },
  };
}

export function gridControls() {
  return {
    grid: { label: "Show grid", value: true },
    gridColor: { label: "Grid color", value: "#63727a" },
    gridOpacity: {
      label: "Grid opacity",
      value: 0.2,
      min: 0,
      max: 0.7,
      step: 0.01,
    },
    gridSize: { label: "Cell size", value: 48, min: 20, max: 100, step: 2 },
    crosshairs: { label: "Crosshairs", value: true },
    crosshairSpacing: {
      label: "Every N cells",
      value: 4,
      min: 2,
      max: 8,
      step: 1,
    },
  };
}

export function glassControls() {
  return {
    environment: {
      label: "Environment",
      value: "Studio HDR",
      options: ["Studio HDR", "Soft room"],
    },
    environmentRotation: {
      label: "HDR rotation",
      value: 360,
      min: 0,
      max: 360,
      step: 1,
    },
    reflections: {
      label: "Reflections",
      value: 3.65,
      min: 0,
      max: 4,
      step: 0.05,
    },
    ior: { label: "Refraction", value: 1.25, min: 1.05, max: 2.4, step: 0.01 },
    thickness: {
      label: "Optical depth",
      value: 0.2,
      min: 0.1,
      max: 4,
      step: 0.05,
    },
    roughness: { label: "Roughness", value: 0, min: 0, max: 0.3, step: 0.005 },
    dispersion: { label: "Dispersion", value: 16, min: 0, max: 16, step: 0.1 },
    glassTint: { label: "Glass tint", value: "#cbd2de" },
    distortion: {
      label: "Distortion",
      value: 0.29,
      min: 0,
      max: 0.5,
      step: 0.01,
    },
    backside: { label: "Back-face pass", value: true },
    depth: { label: "Extrusion", value: 0.19, min: 0.05, max: 0.5, step: 0.01 },
    bevel: { label: "Bevel", value: 0.02, min: 0.002, max: 0.035, step: 0.001 },
  };
}

export function fractureControls() {
  return {
    breakDelay: {
      label: "Break delay (s)",
      value: 0.7,
      min: 0,
      max: 4,
      step: 0.1,
    },
    fragmentCount: {
      label: "Cell count",
      value: 48,
      min: 20,
      max: 90,
      step: 1,
    },
    fractureSeed: {
      label: "Pattern seed",
      value: 177,
      min: 1,
      max: 999,
      step: 1,
    },
    explosion: { label: "Impulse", value: 1, min: 0.3, max: 2, step: 0.05 },
  };
}

/** Downloads a versioned snapshot of the current panel values. */
export function exportSettings(settings: object, filename: string) {
  const data = JSON.stringify({ version: 1, settings }, null, 2) + "\n";
  const url = URL.createObjectURL(
    new Blob([data], { type: "application/json" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
