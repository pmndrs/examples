import React, { useState } from "react"
import ReactDOM from "react-dom"
// All hooks are cross platform now
import { useSpring } from "@react-spring/core"
// Platform knowledge is in here ...
import { a } from "@react-spring/web"
import "./styles.css"
import { Scene } from "./Canvas"

function App() {
  const [toggle, set] = useState(0)
  // Set up a shared spring which simply animates the toggle above
  // We use this spring to interpolate all the colors, position and rotations
  const [{ x }] = useSpring({ x: toggle, config: { mass: 5, tension: 1000, friction: 50, precision: 0.0001 } }, [toggle])
  return (
    <a.div class="container" style={{ backgroundColor: x.to([0, 1], ["#c9ffed", "#ff2558"]), color: x.to([0, 1], ["#7fffd4", "#c70f46"]) }}>
      <h1 class="open" children="<h1>" />
      <h1 class="close" children="</h1>" />
      <a.h1>{x.to((x) => (x + 8).toFixed(2))}</a.h1>
      <Scene x={x} set={set} />
    </a.div>
  )
}

ReactDOM.render(<App />, document.getElementById("root"))
