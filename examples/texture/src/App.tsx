import { OrbitControls } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { EffectComposer, Texture } from "@react-three/postprocessing";
import { useControls } from "leva";
import { BlendFunction } from "postprocessing";
import { Suspense, useEffect, useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { drawHelmet, drawLensDirt, drawScope } from "./overlays";
import { Space } from "./Space";

type OverlayName = "Helmet HUD" | "Lens dirt" | "Scope";

const DEFAULT_BLEND: Record<OverlayName, BlendFunction> = {
  "Helmet HUD": BlendFunction.SCREEN,
  "Lens dirt": BlendFunction.SCREEN,
  Scope: BlendFunction.MULTIPLY,
};

const MAX_DPR = 1.5;

// <Texture> always loads textureSrc, even when a ready texture is passed in
// - so it gets a 1×1 placeholder, and the canvas texture goes in `texture`.
const PLACEHOLDER =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

function Overlay({
  overlay,
  blendFunction,
  opacity,
}: {
  overlay: OverlayName;
  blendFunction: BlendFunction;
  opacity: number;
}) {
  const scale = useThree((state) => Math.min(state.viewport.dpr, MAX_DPR));
  const width = useThree((state) => state.size.width) * scale;
  const height = useThree((state) => state.size.height) * scale;

  // Drawn at the canvas's own size, so circles stay circles at any aspect.
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width);
    canvas.height = Math.round(height);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, [width, height]);
  useEffect(() => () => texture.dispose(), [texture]);

  useLayoutEffect(() => {
    const ctx = (texture.image as HTMLCanvasElement).getContext("2d")!;
    if (overlay === "Helmet HUD") drawHelmet(ctx);
    else if (overlay === "Lens dirt") drawLensDirt(ctx);
    else drawScope(ctx);
    texture.needsUpdate = true;
  }, [overlay, texture]);

  return (
    <EffectComposer>
      <Texture
        textureSrc={PLACEHOLDER}
        texture={texture}
        blendFunction={blendFunction}
        opacity={opacity}
      />
    </EffectComposer>
  );
}

export default function App() {
  const { overlay, blend, opacity } = useControls("Postprocessing - Texture", {
    overlay: {
      value: "Helmet HUD" as OverlayName,
      options: ["Helmet HUD", "Lens dirt", "Scope"] as OverlayName[],
    },
    blend: {
      value: "auto",
      options: {
        "Auto (per overlay)": "auto",
        Screen: BlendFunction.SCREEN,
        Add: BlendFunction.ADD,
        Multiply: BlendFunction.MULTIPLY,
        Overlay: BlendFunction.OVERLAY,
        "Soft light": BlendFunction.SOFT_LIGHT,
        Lighten: BlendFunction.LIGHTEN,
        Darken: BlendFunction.DARKEN,
      } as Record<string, string | BlendFunction>,
    },
    opacity: { value: 1, min: 0, max: 1, step: 0.01 },
  });

  return (
    <Canvas camera={{ position: [0, 6, 34], fov: 50 }}>
      <Space />
      <Suspense fallback={null}>
        <Overlay
          overlay={overlay}
          blendFunction={
            blend === "auto" ? DEFAULT_BLEND[overlay] : (blend as BlendFunction)
          }
          opacity={opacity}
        />
      </Suspense>
      <OrbitControls
        autoRotate
        autoRotateSpeed={0.4}
        enablePan={false}
        minDistance={20}
        maxDistance={50}
      />
    </Canvas>
  );
}
