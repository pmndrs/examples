import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import GroundPage from "./ground/page";
import "./style.css";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GroundPage />
  </StrictMode>,
);
