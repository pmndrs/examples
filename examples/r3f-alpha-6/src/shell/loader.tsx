import { useEffect, useRef } from "react";
import { onStartupProgress } from "../startup";
import { PoimandresMark } from "./site-links";

/**
 * The Poimandres mark over an orange bar on the intro's opening color. The bar follows the startup
 * stages, then the screen fades into the scene. `index.html` and `flat.html` carry the same markup so it
 * shows before the script runs.
 */
export function Loader({ ready }: { ready: boolean }) {
  const bar = useRef<HTMLSpanElement>(null);
  useEffect(
    () =>
      onStartupProgress((amount) =>
        bar.current?.style.setProperty(
          "--progress",
          String(Math.max(0.15, amount)),
        ),
      ),
    [],
  );
  return (
    <div
      className={`loading ${ready ? "is-done" : ""}`}
      role="status"
      aria-label={ready ? undefined : "Loading the scene"}
      aria-hidden={ready}
    >
      <PoimandresMark />
      <span className="loading-bar">
        <span ref={bar} />
      </span>
    </div>
  );
}
