import { Vector3, type Camera, type Object3D } from "three/webgpu";

/**
 * Keeps each HTML link hit area over the scene text it belongs to. An area is a rectangle centered at
 * `x, y, z` in the xy plane of its scene object. Every frame its corners are projected to the screen and the
 * link with the matching `data-hit` key is moved and sized to cover them, so clicks follow parallax,
 * perspective, and copy that moves between the ground and the screen.
 */
export function createHitAreas() {
  const areas: {
    key: string;
    target: Object3D;
    x: number;
    y: number;
    z: number;
    width: number;
    height: number;
    element?: HTMLElement | null;
    style?: string;
  }[] = [];
  const corner = new Vector3();
  return {
    add(
      key: string,
      target: Object3D,
      x: number,
      y: number,
      width: number,
      height: number,
      z = 0,
    ) {
      areas.push({ key, target, x, y, z, width, height });
    },
    update(camera: Camera, canvas: HTMLCanvasElement) {
      for (const area of areas) {
        area.element ??= document.querySelector<HTMLElement>(
          `[data-hit="${area.key}"]`,
        );
        if (!area.element) continue;
        area.target.updateWorldMatrix(true, false);
        let left = Infinity,
          top = Infinity,
          right = -Infinity,
          bottom = -Infinity;
        for (const [sx, sy] of [
          [-1, -1],
          [1, -1],
          [1, 1],
          [-1, 1],
        ]) {
          corner.set(
            area.x + (sx * area.width) / 2,
            area.y + (sy * area.height) / 2,
            area.z,
          );
          area.target.localToWorld(corner).project(camera);
          const px = ((corner.x + 1) / 2) * canvas.clientWidth,
            py = ((1 - corner.y) / 2) * canvas.clientHeight;
          left = Math.min(left, px);
          right = Math.max(right, px);
          top = Math.min(top, py);
          bottom = Math.max(bottom, py);
        }
        const style = `position:absolute;left:0;top:0;transform:translate(${left.toFixed(1)}px,${top.toFixed(1)}px);width:${(right - left).toFixed(1)}px;height:${(bottom - top).toFixed(1)}px`;
        if (style !== area.style)
          area.element.style.cssText = area.style = style;
      }
    },
    dispose() {
      areas.forEach((area) => area.element?.removeAttribute("style"));
    },
  };
}
