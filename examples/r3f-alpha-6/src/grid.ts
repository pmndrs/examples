import { abs, float, fract, fwidth, max, smoothstep, vec2 } from "three/tsl";
import type { Node } from "three/webgpu";

/** Anti-aliased grid lines with a crosshair at every Nth intersection. `position` is in the same units as `cellSize`. */
export function gridPattern(
  position: Node<"vec2">,
  cellSize: Node<"float">,
  crosshairSpacing: Node<"float">,
  crosshairOpacity: Node<"float">,
) {
  const q = position.div(cellSize);
  const distance = abs(fract(q.sub(0.5)).sub(0.5)).div(
    max(fwidth(q), vec2(0.0001)),
  );
  const line = float(1).sub(distance.x.min(distance.y).clamp());
  const intersections = abs(fract(q.div(crosshairSpacing).add(0.5)).sub(0.5))
    .mul(crosshairSpacing)
    .mul(cellSize);
  const pixel = max(fwidth(q).mul(cellSize), vec2(0.0001));
  const crossVertical = float(1)
    .sub(smoothstep(pixel.x.mul(0.65), pixel.x.mul(1.5), intersections.x))
    .mul(float(1).sub(smoothstep(5, 7, intersections.y)));
  const crossHorizontal = float(1)
    .sub(smoothstep(pixel.y.mul(0.65), pixel.y.mul(1.5), intersections.y))
    .mul(float(1).sub(smoothstep(5, 7, intersections.x)));
  return max(
    line,
    max(crossVertical, crossHorizontal).mul(crosshairOpacity).mul(2.2),
  );
}
