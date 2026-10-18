import { traceStartup } from "../startup";
import { Suspense, useCallback, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { NoToneMapping } from "three/webgpu";
import { SceneBoundary } from "../shell/scene-boundary";
import { useWebGPUSupport } from "../shell/use-webgpu-support";
import { usePlayback } from "../shell/use-playback";
import { PlaybackControls, Scrubber } from "../shell/playback-controls";
import { Credits, SiteLinks } from "../shell/site-links";
import { AnnouncementCopy } from "../shell/announcement-copy";
import { DesignControls } from "../shell/design-controls";
import { Loader } from "../shell/loader";
import { loadTypography } from "../typography";
import {
  animationDuration,
  choreographyTime,
  impactTime,
} from "./choreography";
import { useGroundSettings } from "./settings";
import { GroundScene } from "./scene";

/** The announcement with glass type standing on the ground and the copy printed on the floor. */
export default function GroundPage() {
  const { settings, setCameraPose } = useGroundSettings();
  const duration = animationDuration(settings.breakDelay);
  // Fonts download while the canvas starts. The scene reads the same cached load.
  loadTypography(settings.displayFont, settings.detailFont);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const support = useWebGPUSupport();
  const [error, setError] = useState(false);
  const [light, setLight] = useState(false);
  const page = useRef<HTMLElement>(null);
  const player = usePlayback(settings.breakDelay, duration, (elapsed) => {
    const t = choreographyTime(elapsed, settings.breakDelay);
    page.current?.setAttribute(
      "data-phase",
      elapsed >= duration
        ? "complete"
        : t < 0
          ? "intact"
          : t < impactTime
            ? "winding"
            : t < 2
              ? "breaking"
              : "revealing",
    );
    setLight(t >= impactTime + 0.6);
  });
  const onError = useCallback((error: unknown) => {
    console.error("Announcement:", error);
    setError(true);
  }, []);
  const fallback = support === "no" || error;
  return (
    <main
      ref={page}
      className={`announcement is-ground ${light ? "is-light" : ""} ${fallback ? "is-fallback" : ""} ${player.ready && !fallback ? "is-tracked" : ""}`}
      aria-label="React Three Fiber v10 Alpha 6 announcement"
    >
      {!fallback && support === "yes" && (
        <SceneBoundary onError={onError}>
          <Canvas
            frameloop={
              player.paused &&
              (!settings.animate || player.reducedMotion) &&
              (settings.cameraMode !== "Pointer" ||
                player.reducedMotion ||
                settings.parallax === 0)
                ? "demand"
                : "always"
            }
            onCreated={({ renderer }) => {
              traceStartup("Canvas ready", 0.6);
              if (
                !(
                  renderer as unknown as {
                    backend?: { isWebGPUBackend?: boolean };
                  }
                ).backend?.isWebGPUBackend
              )
                onError(new Error("A native WebGPU backend is required"));
            }}
            camera={{ fov: 30, position: [0, 900, 1500] }}
            dpr={[1, 1.25]}
            renderer={{
              antialias: true,
              alpha: false,
              toneMapping: NoToneMapping,
              shadows: true,
            }}
          >
            <Suspense fallback={null}>
              <GroundScene
                settings={settings}
                onCameraPose={setCameraPose}
                playback={player.playback}
                onReady={player.onReady}
                onError={onError}
              />
            </Suspense>
          </Canvas>
        </SceneBoundary>
      )}
      {!fallback && <Loader ready={player.ready} />}
      <AnnouncementCopy fallback={fallback} error={error} />
      {!fallback && <DesignControls open={settingsOpen} />}
      <PlaybackControls
        player={player}
        fallback={fallback}
        settingsOpen={settingsOpen}
        onSettingsOpen={setSettingsOpen}
      />
      <SiteLinks />
      <Scrubber player={player} duration={duration} fallback={fallback} />
      <Credits />
    </main>
  );
}
