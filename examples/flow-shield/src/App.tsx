import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Leva, useControls } from "leva";
import SceneContent, {
  type SceneMode,
} from "./components/playground/SceneContent";
import UIOverlay from "./components/overlay/UIOverlay";
import OverlayButtons, {
  type Preset,
} from "./components/overlay/OverlayButtons";
import LoadingOverlay from "./components/overlay/LoadingOverlay";
import { LEVA_THEME } from "./components/theme/theme";
import { useIsMobile } from "./hooks/useIsMobile";

export default function App() {
  const [showGrid, setShowGrid] = useState(true);
  const isMobile = useIsMobile();
  const [hideLeva, setHideLeva] = useState(isMobile);

  // auto-hide Leva when crossing down to mobile
  useEffect(() => {
    if (isMobile) setHideLeva(true);
  }, [isMobile]);
  const [glbUrl, setGlbUrl] = useState<string | null>(null);
  const [preset, setPreset] = useState<Preset>("default");
  const [isLoadingModel, setIsLoadingModel] = useState(false);
  const glbUrlRef = useRef<string | null>(null);

  const handleLoadGlb = useCallback((file: File) => {
    if (glbUrlRef.current) URL.revokeObjectURL(glbUrlRef.current);
    const url = URL.createObjectURL(file);
    glbUrlRef.current = url;
    setIsLoadingModel(true);
    setGlbUrl(url);
  }, []);

  const handleModelLoaded = useCallback(() => {
    setIsLoadingModel(false);
  }, []);

  const handleClearGlb = useCallback(() => {
    if (glbUrlRef.current) URL.revokeObjectURL(glbUrlRef.current);
    glbUrlRef.current = null;
    setGlbUrl(null);
  }, []);

  const { mode } = useControls(
    "Scene",
    {
      mode: {
        value: "Background" as SceneMode,
        options: ["Background", "Frame"] as SceneMode[],
        label: "Mode",
      },
    },
    { collapsed: true },
  );

  return (
    <>
      <Leva
        theme={LEVA_THEME}
        titleBar={{ title: "CONTROLS" }}
        collapsed={false}
        flat={false}
        oneLineLabels={false}
        hidden={hideLeva}
      />
      <div style={{ position: "fixed", inset: 0 }}>
        <Canvas
          shadows
          camera={{ position: [8, 5, 8], fov: 50, near: 0.1, far: 200 }}
          gl={{ antialias: true, alpha: false }}
          style={{ background: "#0e0d0c" }}
          dpr={[1, 1.5]}
        >
          <SceneContent
            showGrid={showGrid}
            mode={mode}
            glbUrl={glbUrl}
            onModelLoaded={handleModelLoaded}
            preset={preset}
          />
        </Canvas>
      </div>
      <UIOverlay />
      <OverlayButtons
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid((value) => !value)}
        hideLeva={hideLeva}
        onToggleLeva={() => setHideLeva((value) => !value)}
        hasGlb={glbUrl !== null}
        onLoadGlb={handleLoadGlb}
        onClearGlb={handleClearGlb}
        preset={preset}
        onSetPreset={setPreset}
      />
      <LoadingOverlay visible={isLoadingModel} />
    </>
  );
}
