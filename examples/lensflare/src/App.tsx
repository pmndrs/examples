import { Bvh, Environment, OrbitControls, useTexture } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import {
  Bloom,
  EffectComposer,
  LensFlare,
  SMAA,
  Vignette,
} from "@react-three/postprocessing";
import { folder, useControls } from "leva";
import { Suspense, useMemo } from "react";
import { Color } from "three";
import backgroundUrl from "./background.hdr?url";
import { GlassSphere } from "./GlassSphere";
import lensDirtUrl from "./lensDirtTexture.png?url";
import { SkyBox } from "./SkyBox";

function Effects() {
  const { position, colorGain, ...lensFlareProps } = useControls({
    LensFlare: folder({
      enabled: { value: true, label: "enabled?" },
      opacity: { value: 1.0, min: 0.0, max: 1.0, label: "opacity" },
      position: { value: [-25, 6, -60], step: 1, label: "position" },
      glareSize: { value: 0.35, min: 0.01, max: 1.0, label: "glareSize" },
      starPoints: {
        value: 6.0,
        step: 1.0,
        min: 0,
        max: 32.0,
        label: "starPoints",
      },
      animated: { value: true, label: "animated?" },
      anamorphic: { value: false, label: "anamorphic?" },
      colorGain: { value: { r: 56, g: 22, b: 11 }, label: "colorGain" },

      Flare: folder({
        flareSpeed: {
          value: 0.4,
          step: 0.001,
          min: 0.0,
          max: 1.0,
          label: "flareSpeed",
        },
        flareShape: {
          value: 0.1,
          step: 0.001,
          min: 0.0,
          max: 1.0,
          label: "flareShape",
        },
        flareSize: {
          value: 0.005,
          step: 0.001,
          min: 0.0,
          max: 0.01,
          label: "flareSize",
        },
      }),

      SecondaryGhosts: folder({
        secondaryGhosts: { value: true, label: "secondaryGhosts?" },
        ghostScale: { value: 0.1, min: 0.01, max: 1.0, label: "ghostScale" },
        aditionalStreaks: { value: true, label: "aditionalStreaks?" },
      }),

      StartBurst: folder({
        starBurst: { value: true, label: "starBurst?" },
        haloScale: { value: 0.5, step: 0.01, min: 0.3, max: 1.0 },
      }),
    }),
  });

  const lensDirtTexture = useTexture(lensDirtUrl);
  // Leva hands back a plain { r, g, b } - the effect wants a Color.
  const gain = useMemo(
    () => new Color(colorGain.r, colorGain.g, colorGain.b),
    [colorGain.r, colorGain.g, colorGain.b],
  );

  return (
    <EffectComposer multisampling={0}>
      <LensFlare
        {...lensFlareProps}
        lensPosition={position}
        colorGain={gain}
        lensDirtTexture={lensDirtTexture}
      />
      <Vignette />
      <Bloom
        mipmapBlur
        radius={0.9}
        luminanceThreshold={0.966}
        intensity={2}
        levels={4}
      />
      <SMAA />
    </EffectComposer>
  );
}

export default function App() {
  return (
    <Canvas
      dpr={1}
      gl={{ alpha: false, stencil: false, antialias: false, depth: false }}
      camera={{ position: [0, 0, 20], near: 0.5, fov: 45 }}
    >
      <Suspense fallback={null}>
        <Effects />
        <SkyBox />
        <Environment files={backgroundUrl} background />
        <Bvh>
          <GlassSphere scale={1} />
        </Bvh>
      </Suspense>
      <OrbitControls zoomSpeed={4} maxDistance={60} />
      <directionalLight intensity={3 * Math.PI} position={[-25, 60, -60]} />
    </Canvas>
  );
}
