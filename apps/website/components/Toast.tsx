"use client";

import { Style } from "@/components/Style";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export function Toast({
  visible,
  onDone,
  children,
  duration = 6000,
}: {
  visible: boolean;
  onDone: () => void;
  children: React.ReactNode;
  duration?: number;
}) {
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<"enter" | "exit">("enter");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  useEffect(() => {
    if (visible) {
      setMounted(true);
      setPhase("enter");

      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setPhase("exit"), duration);
    } else if (mounted) {
      setPhase("exit");
    }

    return () => clearTimeout(timeoutRef.current);
  }, [visible, duration]);

  const handleAnimationEnd = () => {
    if (phase === "exit") {
      setMounted(false);
      onDone();
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className="Toast"
      data-phase={phase}
      onAnimationEnd={handleAnimationEnd}
    >
      <Style
        css={`
          @scope {
            :scope {
              position: fixed;
              bottom: 1rem;
              left: 50%;
              z-index: 9999;
              background: #333;
              color: #f0f0f0;
              border-radius: 0.5rem;
              padding: 0.75rem 1rem;
              max-width: min(520px, 90vw);
              width: max-content;
              box-shadow:
                0 2px 8px rgb(0 0 0 / 0.3),
                0 8px 30px rgb(0 0 0 / 0.2);
            }

            :scope[data-phase="enter"] {
              animation: toast-in 0.25s cubic-bezier(0.2, 0.9, 0.3, 1.2) forwards;
            }

            :scope[data-phase="exit"] {
              animation: toast-out 0.2s ease-in forwards;
            }

            @keyframes toast-in {
              from {
                opacity: 0;
                translate: -50% 1rem;
              }
              to {
                opacity: 1;
                translate: -50% 0;
              }
            }

            @keyframes toast-out {
              from {
                opacity: 1;
                translate: -50% 0;
              }
              to {
                opacity: 0;
                translate: -50% 1rem;
              }
            }

            p {
              margin: 0 0 0.4rem;
              font-size: 0.8rem;
            }

            code {
              display: block;
              font-size: 0.72rem;
              color: #aaa;
              word-break: break-all;
              white-space: pre-wrap;
              line-height: 1.4;
            }

            code:before {
              content: "$ ";
            }
          }
        `}
      />
      {children}
    </div>,
    document.body,
  );
}
