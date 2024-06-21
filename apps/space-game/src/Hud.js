import React, { useMemo, useRef, useEffect } from 'react'
import styled, { css, createGlobalStyle } from 'styled-components'
import useStore from './store'

export default function Hud() {
  const points = useStore((state) => state.points)
  const health = useStore((state) => state.health)
  const sound = useStore((state) => state.sound)
  const toggle = useStore((state) => state.actions.toggleSound)

  const seconds = useRef()
  useEffect(() => {
    const t = Date.now()
    const i = setInterval(() => (seconds.current.innerText = ((Date.now() - t) / 1000).toFixed(1)), 100)
    return () => clearInterval(i)
  }, [])

  const score = useMemo(() => (points >= 1000 ? (points / 1000).toFixed(1) + 'K' : points), [points])
  return (
    <>
      <UpperLeft onClick={() => toggle()}>
        sound
        <br />
        {sound ? 'off' : 'on'}
      </UpperLeft>
      <UpperRight>
        <a href="https://codesandbox.io/s/react-three-fiber-untitled-game-4pp5r">source</a>
        <br />
        <a href="https://twitter.com/0xca0a">twitter</a>
        <br />
        <a href="https://github.com/react-spring/react-three-fiber">github</a>
      </UpperRight>
      <LowerLeft>
        <h2 ref={seconds}>0.0</h2>
        <h1>{score}</h1>
      </LowerLeft>
      <Global />
      <LowerRight>
        <div style={{ width: health + '%' }} />
      </LowerRight>
    </>
  )
}

const base = css`
  font-family: 'Teko', sans-serif;
  position: absolute;
  text-transform: uppercase;
  font-weight: 900;
  font-variant-numeric: slashed-zero tabular-nums;
  line-height: 1em;
  pointer-events: none;
  color: indianred;
`

const UpperLeft = styled.div`
  ${base}
  top: 40px;
  left: 50px;
  font-size: 2em;
  transform: skew(5deg, 5deg);
  pointer-events: all;
  cursor: pointer;
  @media only screen and (max-width: 900px) {
    font-size: 1.5em;
  }
`

const UpperRight = styled.div`
  ${base}
  text-align: right;
  top: 40px;
  right: 50px;
  font-size: 2em;
  transform: skew(-5deg, -5deg);
  pointer-events: all;
  cursor: pointer;
  & > a {
    color: indianred;
    text-decoration: none;
  }
  @media only screen and (max-width: 900px) {
    font-size: 1.5em;
  }
`

const LowerLeft = styled.div`
  ${base}
  bottom: 5px;
  left: 50px;
  transform: skew(-5deg, -5deg);
  width: 200px;
  & > h1 {
    margin: 0;
    font-size: 10em;
    line-height: 1em;
  }
  & > h2 {
    margin: 0;
    font-size: 4em;
    line-height: 1em;
  }
  @media only screen and (max-width: 900px) {
    bottom: 30px;
    & > h1 {
      font-size: 6em !important;
    }
    & > h2 {
      font-size: 3em !important;
    }
  }
`

const LowerRight = styled.div`
  ${base}
  bottom: 70px;
  right: 50px;
  transform: skew(5deg, 5deg);
  height: 40px;
  width: 150px;
  background: black;
  & > div {
    height: 100%;
    background: indianred;
  }

  @media only screen and (max-width: 900px) {
    bottom: 50px;
    height: 40px;
    width: 150px;
  }
`

const Global = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  html,
  body,
  #root {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    user-select: none;
    overflow: hidden;
  }

  #root {
    overflow: auto;
    padding: 0px;
  }

  body {
    position: fixed;
    overflow: hidden;
    overscroll-behavior-y: none;
    font-family: -apple-system, BlinkMacSystemFont, avenir next, avenir, helvetica neue, helvetica, ubuntu, roboto, noto, segoe ui, arial, sans-serif;
    color: black;
    background: white;
  }
`
