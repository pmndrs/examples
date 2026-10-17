import { useEffect } from "react";
import type { Player } from "./use-playback";

/** Play, replay, and settings buttons at the top right. Escape closes the settings panel. */
export function PlaybackControls({
  player,
  fallback,
  settingsOpen,
  onSettingsOpen,
}: {
  player: Player;
  fallback: boolean;
  settingsOpen: boolean;
  onSettingsOpen: (open: boolean) => void;
}) {
  useEffect(() => {
    if (!settingsOpen) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onSettingsOpen(false);
        document.getElementById("settings-toggle")?.focus();
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [settingsOpen, onSettingsOpen]);

  return (
    <div className="playback-controls">
      <button
        aria-label={player.paused ? "Play animation" : "Pause animation"}
        onClick={player.toggle}
        disabled={!player.ready || fallback}
      >
        {player.paused ? (
          <svg viewBox="0 0 20 20">
            <path d="M7 4.5 15 10l-8 5.5Z" />
          </svg>
        ) : (
          <svg viewBox="0 0 20 20">
            <path d="M7 5v10M13 5v10" />
          </svg>
        )}
      </button>
      <button
        aria-label="Replay animation"
        onClick={player.replay}
        disabled={!player.ready || fallback}
      >
        <svg viewBox="0 0 20 20">
          <path d="M4 8a6.3 6.3 0 1 1 .4 5M4 3v5h5" />
        </svg>
      </button>
      <button
        id="settings-toggle"
        aria-label={settingsOpen ? "Hide settings" : "Show settings"}
        title="Settings"
        aria-expanded={settingsOpen}
        aria-controls="design-controls"
        onClick={() => onSettingsOpen(!settingsOpen)}
        disabled={fallback}
      >
        <svg viewBox="0 0 20 20">
          <path d="M4 3v14M10 3v14M16 3v14" />
          <path d="M2 7h4M8 13h4M14 6h4" strokeWidth="3" />
        </svg>
      </button>
    </div>
  );
}

/** The transparent range input over the scene's progress bar. */
export function Scrubber({
  player,
  duration,
  fallback,
}: {
  player: Player;
  duration: number;
  fallback: boolean;
}) {
  return (
    <input
      ref={player.progress}
      className="timeline"
      data-hit="timeline"
      type="range"
      min="0"
      max={duration}
      step="0.01"
      defaultValue="0"
      aria-label="Animation progress"
      disabled={!player.ready || fallback}
      onInput={(event) => player.scrub(Number(event.currentTarget.value))}
    />
  );
}
