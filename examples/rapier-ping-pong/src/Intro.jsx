import { cloneElement, useState } from "react"
import { Footer } from "@pmndrs/branding"

export default function Intro({ children }) {
  const [clicked, setClicked] = useState(false)
  return (
    <div className="container" style={{ cursor: clicked ? "none" : "auto" }}>
      {cloneElement(children, { ready: clicked })}
      <div className={`fullscreen bg ready"} ${clicked && "clicked"}`}>
        <div className="stack">
          <a href="#" onClick={() => setClicked(true)}>
            {"click to continue"}
          </a>
        </div>
        <Footer
          date="20. January"
          year="2024"
          link1={<a href="https://github.com/pmndrs/drei">pmndrs/drei</a>}
          link2={<a href="https://codesandbox.io/s/0mgum">s/ptdgrn</a>}
        />
      </div>
    </div>
  )
}
