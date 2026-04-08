"use client";

import { useEffect, useRef, useState } from "react";

import { Style } from "./Style";

type FrameState = {
  width: number;
  height: number;
  scale: number;
};

export function ScaledDemoFrame({
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

    const update = () => {
      const rect = container.getBoundingClientRect();
      const width = window.innerWidth;
      const height = window.innerHeight;
      const scale = Math.min(rect.width / width, rect.height / height, 1);

      setFrame({ width, height, scale });
    };

    update();

    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(container);
    window.addEventListener("resize", update);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div className="ScaledDemoFrame" ref={containerRef}>
      <Style
        css={`
          @scope {
            :scope {
              position: relative;
              width: 100%;
              height: 100%;
              min-width: 0;
              min-height: 0;
            }

            iframe {
              position: absolute;
              inset: 50% auto auto 50%;
              border: none;
              display: block;
              background: white;
              border-radius: 16px;
              box-shadow: 0 24px 60px rgb(0 0 0 / 0.16);
              transition: box-shadow 0.2s ease;
            }
          }
        `}
      />
      <iframe
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
