import { OrbitControls, useTexture } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import {
  EffectComposer,
  EffectGroup,
  Ramp,
  Sharpness,
  ToneMapping,
} from "@react-three/postprocessing";
import { useControls } from "leva";
import { ToneMappingMode } from "postprocessing";
import { Suspense, useLayoutEffect, type CSSProperties } from "react";
import * as THREE from "three";
import aoUrl from "./textures/grassy_cobblestone_ao_2k.jpg";
import diffuseUrl from "./textures/grassy_cobblestone_diff_2k.jpg";
import normalUrl from "./textures/grassy_cobblestone_nor_gl_2k.jpg";
import roughnessUrl from "./textures/grassy_cobblestone_rough_2k.jpg";

const SKY = "#cdd5d9";
const WIDTH = 8;
const LENGTH = 120;

// Seen at a grazing angle, the far cobbles are sampled from ever smaller
// mipmaps and wash out - the softness sharpening is meant to win back.
function Street({ anisotropy }: { anisotropy: number }) {
  const textures = useTexture([diffuseUrl, normalUrl, roughnessUrl, aoUrl]);

  useLayoutEffect(() => {
    for (const texture of textures) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(WIDTH / 2, LENGTH / 2);
      texture.anisotropy = anisotropy;
      texture.needsUpdate = true;
    }
  }, [textures, anisotropy]);

  const [diffuse, normal, roughness, ao] = textures;

  return (
    <mesh rotation-x={-Math.PI / 2} position-z={4 - LENGTH / 2}>
      <planeGeometry args={[WIDTH, LENGTH]} />
      <meshStandardMaterial
        map={diffuse}
        normalMap={normal}
        roughnessMap={roughness}
        aoMap={ao}
      />
    </mesh>
  );
}

function Effects({ split }: { split: boolean }) {
  const { enabled, opacity, sharpness, radius } = useControls(
    "Postprocessing - Sharpness",
    {
      enabled: true,
      opacity: { value: 1, min: 0, max: 1, step: 0.01 },
      sharpness: { value: 2, min: 0, max: 3, step: 0.05 },
      radius: { value: 1, min: 0.5, max: 3, step: 0.1 },
    },
  );

  return (
    <EffectComposer>
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <EffectGroup enabled={enabled}>
        <Sharpness opacity={opacity} sharpness={sharpness} radius={radius} />
        {/* A hard-edged mask down the middle: the input buffer on the left,
            the sharpened image on the right. */}
        {split && (
          <Ramp rampMask rampStart={[0.5, 0.5]} rampEnd={[0.501, 0.5]} />
        )}
      </EffectGroup>
    </EffectComposer>
  );
}

const labelStyle: CSSProperties = {
  position: "absolute",
  top: 16,
  padding: "4px 8px",
  font: "12px/1 system-ui, sans-serif",
  color: "#fff",
  background: "rgba(0, 0, 0, 0.45)",
  borderRadius: 4,
};

function Divider() {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: "50%",
          width: 2,
          marginLeft: -1,
          background: "rgba(255, 255, 255, 0.8)",
        }}
      />
      <span style={{ ...labelStyle, right: "calc(50% + 12px)" }}>Original</span>
      <span style={{ ...labelStyle, left: "calc(50% + 12px)" }}>Sharpened</span>
    </div>
  );
}

export default function App() {
  const { anisotropy } = useControls("Street", {
    // Anisotropic filtering is the GPU's own fix for the same blur.
    anisotropy: { value: 1, options: [1, 4, 16] },
  });
  const { split } = useControls("Postprocessing - Sharpness", {
    split: true,
  });

  return (
    <>
      <Canvas camera={{ position: [0, 5, 4], fov: 50 }}>
        <color attach="background" args={[SKY]} />
        <fog attach="fog" args={[SKY, 20, 90]} />
        <hemisphereLight args={["#e4ecf2", "#6b6355", 0.6 * Math.PI]} />
        <directionalLight
          position={[-10, 8, -5]}
          intensity={1.2 * Math.PI}
          color="#fff3e2"
        />

        <Suspense fallback={null}>
          <Street anisotropy={anisotropy} />
        </Suspense>
        <Effects split={split} />

        <OrbitControls
          target={[0, 1.2, -10]}
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 2.4}
          maxPolarAngle={Math.PI / 1.9}
          minAzimuthAngle={-0.5}
          maxAzimuthAngle={0.5}
        />
      </Canvas>
      {split && <Divider />}
    </>
  );
}
