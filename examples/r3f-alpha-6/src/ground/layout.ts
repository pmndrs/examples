import {
  MathUtils,
  PerspectiveCamera,
  Plane,
  Ray,
  Vector2,
  Vector3,
} from "three/webgpu";

export const layoutPitch = 65.2;

/**
 * Maps screen positions onto the ground plane for a fixed reference pose, so flat copy lands where the
 * HTML hit areas sit. Orbiting moves the camera without changing the layout.
 * Positions are pixels from the screen center with y up.
 */
export function groundLayout(
  width: number,
  height: number,
  fov: number,
  distance: number,
) {
  const camera = new PerspectiveCamera(fov, width / height, 1, distance * 20);
  camera.position.setFromSphericalCoords(
    distance,
    MathUtils.degToRad(90 - layoutPitch),
    0,
  );
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld();
  const ground = new Plane(new Vector3(0, 1, 0), 0),
    ray = new Ray(),
    ndc = new Vector2();
  return {
    at(x: number, y: number) {
      ndc.set((x / width) * 2, (y / height) * 2);
      ray.origin.copy(camera.position);
      ray.direction
        .set(ndc.x, ndc.y, 0.5)
        .unproject(camera)
        .sub(camera.position)
        .normalize();
      return ray.intersectPlane(ground, new Vector3()) ?? new Vector3();
    },
    /** World units per screen pixel at a ground point. */
    scale(point: Vector3) {
      const depth = -point.clone().applyMatrix4(camera.matrixWorldInverse).z;
      return (depth * 2 * Math.tan(MathUtils.degToRad(fov / 2))) / height;
    },
    /** How squarely the camera sees the ground at a point, from 0 at the horizon to 1 straight down. */
    slant(point: Vector3) {
      return camera.position.y / camera.position.distanceTo(point);
    },
  };
}
export type GroundLayout = ReturnType<typeof groundLayout>;
