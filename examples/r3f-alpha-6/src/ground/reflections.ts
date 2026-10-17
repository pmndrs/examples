import {
  BackSide,
  CubeCamera,
  CubeRenderTarget,
  HalfFloatType,
  Mesh,
  MeshBasicNodeMaterial,
  PMREMGenerator,
  SphereGeometry,
  type DirectionalLight,
  type Object3D,
  type RenderTarget,
  type Scene,
  type Texture,
  type Vector3,
  type WebGPURenderer,
} from "three/webgpu";
import {
  cos,
  float,
  pmremTexture,
  positionLocal,
  sin,
  uniform,
  vec3,
} from "three/tsl";

/**
 * Reflections for the glass that include the room it lies in. A cube camera at the title photographs the
 * scene without the glass, with the environment drawn on a sky dome that only this camera sees, and the
 * result is prefiltered into the scene environment. The dome carries the environment rotation and
 * intensity, so the floor, grid, and copy reflect at their true brightness.
 */
export function createReflections(
  renderer: WebGPURenderer,
  scene: Scene,
  sky: Texture,
  radius: number,
) {
  const skyLayer = 2;
  const cube = new CubeRenderTarget(256, { type: HalfFloatType });
  const camera = new CubeCamera(1, radius * 2, cube);
  camera.children.forEach((child) => child.layers.enable(skyLayer));
  const pmrem = new PMREMGenerator(renderer);
  const angle = uniform(0),
    strength = uniform(1);
  const direction = positionLocal.normalize(),
    c = cos(angle),
    s = sin(angle);
  const material = new MeshBasicNodeMaterial({
    side: BackSide,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
  });
  material.colorNode = pmremTexture(
    sky,
    vec3(
      direction.x.mul(c).add(direction.z.mul(s)),
      direction.y,
      direction.z.mul(c).sub(direction.x.mul(s)),
    ),
    float(0),
  ).mul(strength);
  const geometry = new SphereGeometry(radius, 32, 16);
  const dome = new Mesh(geometry, material);
  dome.layers.set(skyLayer);
  dome.renderOrder = -1;
  dome.frustumCulled = false;
  scene.add(dome);
  let filtered: RenderTarget | null = null;

  return {
    /** Re-photographs from `at` with `hide` out of view and returns the prefiltered environment. */
    update(
      at: Vector3,
      hide: Object3D[],
      lights: DirectionalLight[],
      rotation: number,
      intensity: number,
    ) {
      angle.value = (rotation * Math.PI) / 180;
      strength.value = intensity;
      dome.position.copy(at);
      camera.position.copy(at);
      const shown = hide.map((object) => object.visible),
        refresh = lights.map((light) => light.shadow.autoUpdate);
      hide.forEach((object) => {
        object.visible = false;
      });
      lights.forEach((light) => {
        light.shadow.autoUpdate = false;
      });
      camera.update(renderer, scene);
      hide.forEach((object, i) => {
        object.visible = shown[i];
      });
      lights.forEach((light, i) => {
        light.shadow.autoUpdate = refresh[i];
      });
      filtered = pmrem.fromCubemap(cube.texture, filtered);
      return filtered.texture;
    },
    dispose() {
      scene.remove(dome);
      geometry.dispose();
      material.dispose();
      filtered?.dispose();
      cube.dispose();
      pmrem.dispose();
    },
  };
}
