/** The last screen: the whole town, and the camera handed to the viewer on request. */
export function Outro({ onTakeControl }: { onTakeControl: () => void }) {
  return (
    <section className="tokyo-section" data-stop="">
      <div className="tokyo-start">
        <button type="button" className="tokyo-cta" onClick={onTakeControl}>
          Take control
        </button>
      </div>
    </section>
  );
}
