"use client";

import { useEffect, useRef, useState } from "react";

type FrameState = {
  width: number;
  height: number;
  scale: number;
};

export function ScaledExampleFrame({
  src,
  title,
}: {
  src: string;
  title: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState<FrameState>({
    width: 1,
    height: 1,
    scale: 1,
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let rafId = 0;
    const schedule = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        const rect = container.getBoundingClientRect();
        const width = window.innerWidth;
        const height = window.innerHeight;
        const scale = Math.min(rect.width / width, rect.height / height, 1);
        setFrame({ width, height, scale });
      });
    };

    schedule();

    const resizeObserver = new ResizeObserver(schedule);
    resizeObserver.observe(container);
    window.addEventListener("resize", schedule);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <div className="relative h-full min-h-0 w-full min-w-0" ref={containerRef}>
      {/* `top-1/2 left-1/2` is the whole of the old `inset: 50% auto auto 50%`
          — `right`/`bottom` are already `auto`. The other half of the centring
          is the `translate(-50%, -50%)` in the inline transform below, which
          has to stay there: it carries the measured `scale` with it.

          White, not a theme colour: it is the example's own page showing through
          before it paints, and the examples are not themed. */}
      <iframe
        className="absolute top-1/2 left-1/2 rounded-2xl bg-white shadow-[0_24px_60px_rgb(0_0_0/0.16)] transition-shadow duration-200"
        src={src}
        title={title}
        style={{
          width: `${frame.width}px`,
          height: `${frame.height}px`,
          transform: `translate(-50%, -50%) scale(${frame.scale})`,
        }}
      />
    </div>
  );
}
