import { useEffect, useRef, useState } from "react";

type Block = {
  x: number;
  y: number;
  size: number;
  delay: number;
  rise: number;
  tint: number[];
};

/**
 * Tiles a panel with squares of random sizes on a 16 px grid, scanning row by row and shrinking each square
 * until it fits the free cells. Lower blocks get earlier delays so the panel builds from the bottom up, and a
 * few start lighter or in the accent color before settling into the panel color.
 */
function tile(width: number, height: number) {
  const cell = 16,
    cols = Math.ceil(width / cell),
    rows = Math.ceil(height / cell);
  const taken = new Uint8Array(cols * rows);
  const free = (c: number, r: number, size: number) => {
    if (c + size > cols || r + size > rows) return false;
    for (let y = r; y < r + size; y++)
      for (let x = c; x < c + size; x++) if (taken[y * cols + x]) return false;
    return true;
  };
  const blocks: Block[] = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      if (taken[r * cols + c]) continue;
      let size = 1 + Math.floor(Math.random() ** 2 * 5);
      while (!free(c, r, size)) size--;
      for (let y = r; y < r + size; y++)
        taken.fill(1, y * cols + c, y * cols + c + size);
      const roll = Math.random();
      blocks.push({
        x: c * cell,
        y: r * cell,
        size: size * cell,
        delay: (1 - (r + size / 2) / rows) * 0.32 + Math.random() * 0.22,
        rise: 40 + Math.random() * 140,
        tint:
          roll < 0.08
            ? [237, 88, 44]
            : roll < 0.3
              ? [62, 60, 56]
              : [33, 32, 30],
      });
    }
  return blocks;
}

/**
 * The WebGL link in the nav and the dialog it opens. The panel assembles from square blocks that rise into
 * place on a canvas, then the copy fades in. Closing runs the same build backward so the panel breaks apart.
 */
export function LegacyLink() {
  const dialog = useRef<HTMLDialogElement>(null),
    panel = useRef<HTMLDivElement>(null),
    canvas = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<"closed" | "opening" | "open" | "closing">(
    "closed",
  );
  const motion = useRef({
    progress: 0,
    frame: 0,
    total: 1,
    blocks: [] as Block[],
  });
  useEffect(() => () => cancelAnimationFrame(motion.current.frame), []);

  /** Each block lands over 0.4 s once its delay passes, easing up from below and blending into the panel color. */
  const draw = () => {
    const { progress, total, blocks } = motion.current,
      element = canvas.current!,
      rect = panel.current!.getBoundingClientRect();
    const context = element.getContext("2d")!,
      ratio = devicePixelRatio;
    if (
      element.width !== Math.round(innerWidth * ratio) ||
      element.height !== Math.round(innerHeight * ratio)
    ) {
      element.width = Math.round(innerWidth * ratio);
      element.height = Math.round(innerHeight * ratio);
    }
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, innerWidth, innerHeight);
    if (progress === 0 || progress === 1) return;
    for (const block of blocks) {
      const k = Math.min(
        1,
        Math.max(0, (progress * total - block.delay) / 0.4),
      );
      if (!k) continue;
      const eased = 1 - (1 - k) ** 3;
      context.globalAlpha = Math.min(1, k * 3);
      context.fillStyle = `rgb(${block.tint.map((value, i) => Math.round(value + ([33, 32, 30][i] - value) * eased)).join()})`;
      context.fillRect(
        rect.left + block.x,
        rect.top + block.y + block.rise * (1 - eased),
        Math.min(block.size, rect.width - block.x),
        Math.min(block.size, rect.height - block.y),
      );
    }
  };

  /** Plays the build toward assembled at 1 or scattered at 0, starting from wherever it is now. */
  const animate = (to: 0 | 1, done: () => void) => {
    const state = motion.current;
    if (state.progress === 1 - to) {
      const rect = panel.current!.getBoundingClientRect();
      state.blocks = tile(rect.width, rect.height);
      state.total = Math.max(...state.blocks.map((block) => block.delay)) + 0.4;
    }
    cancelAnimationFrame(state.frame);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      state.progress = to;
      draw();
      return done();
    }
    let last = performance.now();
    const step = (now: number) => {
      state.progress = Math.min(
        1,
        Math.max(
          0,
          state.progress + ((to ? 1 : -1) * (now - last)) / 1000 / state.total,
        ),
      );
      last = now;
      draw();
      if (state.progress === to) done();
      else state.frame = requestAnimationFrame(step);
    };
    // Paint the first frame now so the solid panel never shows through before the blocks take over.
    state.progress = Math.min(0.999, Math.max(0.001, state.progress));
    draw();
    state.frame = requestAnimationFrame(step);
  };

  const open = () => {
    dialog.current!.showModal();
    setPhase("opening");
    animate(1, () => setPhase("open"));
  };
  const close = () => {
    if (phase === "closing" || phase === "closed") return;
    setPhase("closing");
    animate(0, () => dialog.current!.close());
  };

  return (
    <>
      <button
        type="button"
        className="hit-area"
        data-hit="webgl"
        aria-haspopup="dialog"
        onClick={open}
      >
        <span>WebGL</span>
      </button>
      <dialog
        ref={dialog}
        className="legacy-dialog"
        data-phase={phase}
        aria-labelledby="legacy-title"
        onCancel={(event) => {
          event.preventDefault();
          close();
        }}
        onClose={() => {
          cancelAnimationFrame(motion.current.frame);
          motion.current.progress = 0;
          draw();
          setPhase("closed");
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
      >
        <canvas ref={canvas} aria-hidden="true" />
        <div ref={panel} className="legacy-panel">
          <button
            type="button"
            className="legacy-close"
            aria-label="Close"
            onClick={close}
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
            </svg>
          </button>
          <p className="legacy-eyebrow">The legacy path</p>
          <h2 id="legacy-title">WebGL is still here.</h2>
          <p className="legacy-lead">
            WebGPU is the new default, but nobody is getting left behind. If
            your project runs on <code>WebGLRenderer</code> it still has a home
            in v10. Pick whichever switch suits you.
          </p>
          <ol className="legacy-options">
            <li>
              <h3>Add one prop</h3>
              <pre>
                <code>
                  &lt;Canvas <mark>legacy</mark>&gt;
                </code>
              </pre>
              <p>
                Tag your Canvas with <code>legacy</code> and r3f loads the
                WebGLRenderer for you. Nothing else changes.
              </p>
            </li>
            <li>
              <h3>Or move your imports</h3>
              <pre>
                <code>
                  import {"{ Canvas }"} from '@react-three/fiber/
                  <mark>legacy</mark>'
                </code>
              </pre>
              <p>
                Point your imports at the legacy entry and the whole tree
                renders with WebGL, types included.
              </p>
            </li>
          </ol>
          <h3 className="legacy-why">Why make it a break?</h3>
          <p>
            The new renderer from three.js already falls back to WebGL 2 on its
            own. Its core, its node materials and the systems around them are
            still young though, and existing shaders, materials and
            post-processing don't carry over one to one. Rather than swap
            renderers under your feet, we made WebGPU the default and kept WebGL
            one prop away.
          </p>
          <div className="legacy-actions">
            <a
              className="legacy-primary"
              href="https://r3f.docs.pmnd.rs/next/migration/v10#do-i-need-to-switch-to-webgpu?"
            >
              Read the WebGL guide <span aria-hidden="true">→</span>
            </a>
            <button type="button" onClick={close}>
              Got it
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
