import {
  DirectionalLight,
  Group,
  HalfFloatType,
  Mesh,
  MeshBasicNodeMaterial,
} from "three/webgpu";

/**
 * A high key light whose soft shadows tie the glass to the ground. `span` is the shadowed area in world units.
 * The light only sees layer 2, where `shadowCaster` places stand-ins for the glass.
 */
export function createShadowLight(span: number) {
  const light = new DirectionalLight("#fff6ea", 6);
  light.position.set(-span * 0.3, span, span * 0.45);
  light.castShadow = true;
  light.shadow.mapSize.set(1024, 1024);
  light.shadow.radius = 4;
  // Half floats let the transmitted shadow carry caustics brighter than 1.
  light.shadow.mapType = HalfFloatType;
  light.shadow.bias = -0.0005;
  const camera = light.shadow.camera;
  camera.layers.set(2);
  camera.left = camera.bottom = -span * 0.6;
  camera.right = camera.top = span * 0.6;
  camera.near = span * 0.2;
  camera.far = span * 2.5;
  camera.updateProjectionMatrix();
  return light;
}

/**
 * Pairs `mesh` with a shadow-only twin inside a group that carries the transform. three draws each shadow map
 * once per frame on the first render, which is the glass backdrop pass with the glass hidden. The twin sits
 * beside the glass on layer 2, so the light still sees it and the screen never does.
 */
export function withShadow(mesh: Mesh, material: MeshBasicNodeMaterial) {
  const twin = new Mesh(mesh.geometry, material);
  twin.layers.set(2);
  twin.castShadow = true;
  const body = new Group();
  body.add(mesh, twin);
  return body;
}
