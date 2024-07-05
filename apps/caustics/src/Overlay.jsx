export function Overlay() {
  return (
    <>
      <div className="char" style={{ top: 40, left: 40 }}>
        P
      </div>
      <div className="char" style={{ top: 40, left: '20vw' }}>
        M
      </div>
      <div className="char" style={{ top: 40, left: '40vw' }}>
        N
      </div>
      <div className="char" style={{ top: '20vw', left: '20vw' }}>
        D
      </div>
      <div className="char" style={{ bottom: 40, left: '40vw' }}>
        R
      </div>
      <div className="char" style={{ bottom: 40, left: '60vw' }}>
        S
      </div>
      <div style={{ position: 'absolute', top: 40, right: 160, fontSize: '15px', textAlign: 'right' }}>
        A DEV
        <br />
        COLLECTIVE
      </div>
      <div style={{ position: 'absolute', top: 40, right: 40, fontSize: '15px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
        —
        <br />
        08/01/23
      </div>
      <svg style={{ position: 'absolute', right: 40, top: '50%' }} width="54" height="23" viewBox="0 0 54 23" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line y1="1.5" x2="54" y2="1.5" stroke="black" strokeWidth="3" />
        <line y1="11.5" x2="54" y2="11.5" stroke="black" strokeWidth="3" />
        <line y1="21.5" x2="54" y2="21.5" stroke="black" strokeWidth="3" />
      </svg>
      <div style={{ position: 'absolute', bottom: 120, left: 120, fontSize: '18px' }}>
        Runtime caustics and soft shadows,
        <br />
        for more realism on the web.
        <br />
        <br />
        <div style={{ position: 'relative', marginTop: 10, display: 'inline-block' }}>
          <a style={{ fontSize: '15px', fontWeight: 600, letterSpacing: 2 }} href="https://github.com/pmndrs/drei#caustics">
            DOCUMENTATION
          </a>
          <div style={{ marginTop: 6, height: 2.5, width: '100%', background: '#3e3e3d' }} />
        </div>
        <br />
      </div>
    </>
  )
}
