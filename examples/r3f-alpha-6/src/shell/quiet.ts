import { useEffect, useRef } from "react";
import type { Player } from "./use-playback";

/**
 * `?quiet` strips the page to the scene for recording video: the controls, header, and credits are
 * hidden, while playback and the pointer behave as usual. A resting pointer lets the light circle on its own.
 */
export const quiet = new URLSearchParams(location.search).has("quiet");

/** R replays, since the replay button is hidden. */
export function useQuietKeys(player: Player) {
  const live = useRef(player);
  live.current = player;

  useEffect(() => {
    if (!quiet) return;
    const press = (event: KeyboardEvent) => {
      if (event.code === "KeyR" && !event.repeat) live.current.replay();
    };
    window.addEventListener("keydown", press);
    return () => window.removeEventListener("keydown", press);
  }, []);
}
