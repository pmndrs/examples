import type { JSX } from 'react'
import { Suspense, useEffect, useState } from 'react'
import { Footer } from '@pmndrs/branding'
import { useProgress } from '@react-three/drei'

import type { ReactNode } from 'react'

import { useStore } from '../store'
import { Keys } from './Help'

function Loader() {
  const { progress } = useProgress()
  return <div>loading {progress.toFixed()} %</div>
}

interface IntroProps {
  children: ReactNode
}

export function Intro({ children }: IntroProps): JSX.Element {
  const [clicked, setClicked] = useState(false)
  const [loaded, set] = useStore((state) => [state.loaded, state.set])

  useEffect(() => {
    if (clicked && loaded) set({ ready: true })
  }, [loaded, clicked])

  return (
    <>
      <Suspense fallback={null}>{children}</Suspense>
      <div className={`fullscreen bg ${loaded ? 'ready' : 'notready'} ${clicked && 'clicked'}`}>
        <div className="stack">
          <div className="intro-keys">
            <Keys style={{ paddingBottom: 20 }} />
            <a className="continue-link" href="#" onClick={() => loaded && setClicked(true)}>
              {!loaded ? <Loader /> : 'Click to continue'}
            </a>
          </div>
        </div>
        <Footer
          date="2. June"
          year="2021"
          link1={<a href="https://github.com/pmndrs/react-three-fiber">@react-three/fiber</a>}
          link2={<a href="https://github.com/pmndrs/racing-game">/racing-game</a>}
        />
      </div>
    </>
  )
}
