/** Screen-reader copy for the canvas, plus the static announcement shown without WebGPU. */
export function AnnouncementCopy({
  fallback,
  error,
}: {
  fallback: boolean;
  error: boolean;
}) {
  return (
    <>
      <div className="semantic-copy">
        <p>Breaking Changes</p>
        <h1>r3f v10 Alpha 6 is now WebGPU First</h1>
        <p>The renderer prop falls away. Start with &lt;Canvas /&gt;.</p>
      </div>
      {fallback && (
        <section className="fallback-copy">
          <p className="eyebrow">— Breaking Changes —</p>
          <div className="fallback-canvas">&lt;Canvas /&gt;</div>
          <h2>
            r3f v10 <span>Alpha 6</span>
          </h2>
          <p>is now</p>
          <h3>WebGPU First</h3>
          <p className="fallback-message">
            {error
              ? "The WebGPU scene could not start. Reload to try again."
              : "Open in a browser with WebGPU enabled to experience the glass reveal."}
          </p>
        </section>
      )}
    </>
  );
}
