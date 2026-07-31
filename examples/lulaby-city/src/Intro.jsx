import { Suspense, cloneElement, useEffect, useState } from 'react'
import { Footer } from '@pmndrs/branding'

function Ready({ setReady }) {
  useEffect(() => () => void setReady(true), [])
  return null
}

export default function Intro({ children }) {
  const [clicked, setClicked] = useState(false)
  const [ready, setReady] = useState(false)
  return (
    <>
      <Suspense fallback={<Ready setReady={setReady} />}>
        {cloneElement(children, { ready: clicked && ready })}
      </Suspense>
      <div className={`fullscreen bg ${ready ? 'ready' : 'notready'} ${clicked && 'clicked'}`}>
        <div className="stack">
          <a href="#" onClick={() => setClicked(true)}>
            {!ready ? 'loading' : 'click to continue'}
          </a>
        </div>
        <Footer
          date="30. December"
          year="2021"
          link1={<a href="https://github.com/pmndrs/drei">pmndrs/drei</a>}
          link2={<a href="https://codesandbox.io/s/e6bjz">s/e6bjz</a>}
        />
      </div>
    </>
  )
}
