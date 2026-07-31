import { Badge } from '@pmndrs/branding'

export function Branding() {
  return (
    <div className="branding">
      <div>
        <div className="copy">
          <p>
            Shader based antialiased wireframes via Barycentric Coordinates.
            <br />
            <br />
            <br />
            <a href="https://github.com/mattdesl/webgl-wireframes">Original</a> by <a href="https://twitter.com/mattdesl">Matt DesLauriers</a>.
            <br />
            React port by <a href="https://twitter.com/cantbefaraz">Faraz Shaikh</a>
          </p>
        </div>
        <div className="logo">
          <Badge />
        </div>
      </div>
    </div>
  )
}
