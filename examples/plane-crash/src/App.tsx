import { CameraControls, Loader, Preload } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, EffectGroup } from "@react-three/postprocessing";
import { Leva, useControls } from "leva";
import { Suspense, useEffect, useState } from "react";
import { ColorAndEffects, FocusEffect } from "./Effects";
import { Lighting } from "./Lighting";
import { Scene } from "./Scene";

export default function App() {
  const [controls, setControls] = useState<CameraControls | null>(null);

  const { enabled } = useControls({
    enabled: { value: true, label: "Postprocessing" },
  });

  useEffect(() => {
    if (!controls) return;
    controls.enabled = false;
    controls.setLookAt(-7, 5, -8, -1, 1.3, 2, false);
  }, [controls]);

  const onSceneLoad = () => {
    requestAnimationFrame(() => {
      controls?.setLookAt(-2.5, 1.4, -1.2, -1.2, 2, 2, true).then(() => {
        if (controls) {
          controls.smoothTime = 0.2;
          controls.enabled = true;
        }
      });
    });
  };

  return (
    <>
      <Canvas
        gl={{ powerPreference: "high-performance" }}
        camera={{ position: [-7, 5, -8], fov: 80, far: 100 }}
      >
        <CameraControls
          ref={setControls}
          makeDefault
          smoothTime={0.7}
          maxDistance={20}
          restThreshold={0.02}
        />

        <Suspense fallback={null}>
          <Scene onLoaded={onSceneLoad} />
          <Lighting />
          <Preload all />

          <EffectComposer>
            <EffectGroup enabled={enabled}>
              <FocusEffect />
              <ColorAndEffects />
            </EffectGroup>
          </EffectComposer>
        </Suspense>
      </Canvas>
      <Loader />
      <Leva theme={{ sizes: { rootWidth: "20rem" } }} />
    </>
  );
}
