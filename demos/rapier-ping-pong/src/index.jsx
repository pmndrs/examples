import { createRoot } from "react-dom/client"
import "./styles.css"
import App from "./App"
import Intro from "./Intro"

createRoot(document.getElementById("root")).render(
  <Intro>
    <App />
  </Intro>,
)
