/** The first screen: a tour of the scene, or a hint to scroll. */
export function Hero({ onPlay }: { onPlay: () => void }) {
  return (
    <section className="tokyo-section" data-stop="">
      <div className="tokyo-start">
        <button type="button" className="tokyo-cta" onClick={onPlay}>
          Play the tour
        </button>
        <span className="tokyo-scroll-hint">or scroll</span>
      </div>
    </section>
  );
}
