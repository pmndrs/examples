import { useState } from "react";
import { createRoot } from "react-dom/client";
import { Footer } from "@pmndrs/branding";
import "./styles.css";
import App from "./App";

function Overlay() {
  const [ready, set] = useState(false);
  return (
    <>
      <App />
      <div className="dot" />
      <div
        className={`fullscreen bg ${ready ? "ready" : "notready"} ${ready && "clicked"}`}
      >
        <div className="stack">
          <button onClick={() => set(true)}>Start</button>
        </div>
        {/* Footer's .d.ts marks link1/link2 as required, the component renders
            them as-is; passing undefined is identical to omitting them. */}
        <Footer
          date="16. June"
          year="2021"
          link1={undefined}
          link2={undefined}
        />
      </div>
    </>
  );
}

createRoot(document.getElementById("root")!).render(<Overlay />);
