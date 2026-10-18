import { useEffect, useState } from "react";
import { traceStartup } from "../startup";

/** Resolves once the browser either grants a WebGPU adapter or cannot. */
export function useWebGPUSupport() {
  const [support, setSupport] = useState<"checking" | "yes" | "no">("checking");
  useEffect(() => {
    let alive = true;
    const gpu = (
      navigator as unknown as { gpu?: { requestAdapter(): Promise<unknown> } }
    ).gpu;
    (gpu?.requestAdapter() ?? Promise.resolve(null))
      .then((adapter) => {
        traceStartup(adapter ? "GPU adapter ready" : "No GPU adapter");
        if (alive) setSupport(adapter ? "yes" : "no");
      })
      .catch(() => {
        if (alive) setSupport("no");
      });
    return () => {
      alive = false;
    };
  }, []);
  return support;
}
