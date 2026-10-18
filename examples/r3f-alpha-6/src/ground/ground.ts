import {
  Color,
  Group,
  Mesh,
  MeshBasicNodeMaterial,
  PlaneGeometry,
} from "three/webgpu";
import {
  color,
  float,
  mix,
  positionWorld,
  smoothstep,
  uniform,
  vec2,
} from "three/tsl";
import { grainGradient } from "../grain-gradient";
import { gridPattern } from "../grid";
import { CausticReceiverMaterial } from "./caustics";
import type { GroundSettings } from "./settings";

/**
 * The floor the glass lies on. It carries the grain gradient and grid in world space, fades into a flat
 * horizon, and catches shadows from the letters and shards.
 */
export function createGround(width: number, height: number, extent: number) {
  const root = new Group();
  const reveal = uniform(0),
    gridAlpha = uniform(0.2),
    cellSize = uniform(48),
    gridColor = uniform(new Color());
  const shader = uniform(0),
    crosshairOpacity = uniform(1),
    crosshairSpacing = uniform(4),
    horizon = uniform(new Color()),
    base = new Color();
  const world = positionWorld.xz;
  // One unit per viewport height, with far ground at the top like the flat layout's gradient. The grain reads
  // the same world position, so it is printed on the floor and foreshortens with the camera.
  const field = grainGradient(
    vec2(world.x, world.y.negate()).div(height),
    world.mul(0.7),
  );
  // Calm the near ground where the copy sits.
  const calm = smoothstep(0.23, 0.55, world.y.negate().div(height).add(0.5))
    .mul(0.9)
    .add(0.1);
  const colorField = mix(
    field.base,
    mix(field.base, field.gradient, field.mask),
    calm,
  );
  const surface = mix(
    mix(color("#080a0e"), colorField.mul(0.065), float(0.7)),
    colorField,
    reveal,
  );
  const reach = Math.max(width, height);
  const lines = gridPattern(world, cellSize, crosshairSpacing, crosshairOpacity)
    .mul(smoothstep(reach, reach * 0.4, world.length()))
    .mul(gridAlpha);
  const material = new MeshBasicNodeMaterial({ toneMapped: false });
  // The grain shader is optional. Without it the floor is the flat base color.
  material.colorNode = mix(
    mix(mix(horizon, surface, shader), gridColor, lines),
    horizon,
    smoothstep(extent * 0.12, extent * 0.5, world.length()),
  );
  const geometry = new PlaneGeometry(extent * 2, extent * 2);
  const floor = new Mesh(geometry, material);
  floor.rotation.x = -Math.PI / 2;
  const shadowStrength = uniform(0.7);
  const shadowMaterial = new CausticReceiverMaterial(shadowStrength);
  const shadows = new Mesh(geometry, shadowMaterial);
  shadows.rotation.x = -Math.PI / 2;
  shadows.position.y = 1;
  shadows.receiveShadow = true;
  shadows.renderOrder = 1;
  root.add(floor, shadows);
  return {
    root,
    time: field.time,
    /** The flat color the ground fades into, also used for the sky. */
    horizon: horizon.value,
    update(settings: GroundSettings, light: number) {
      field.update(settings);
      reveal.value = light;
      shader.value = settings.shaderGround ? 1 : 0;
      horizon.value.set("#0a0b0f").lerp(base.set(settings.baseColor), light);
      gridAlpha.value = settings.grid
        ? settings.gridOpacity * (0.45 + 0.55 * light)
        : 0;
      cellSize.value = settings.gridSize;
      gridColor.value.set(settings.gridColor);
      crosshairOpacity.value = settings.crosshairs ? 1 : 0;
      crosshairSpacing.value = settings.crosshairSpacing;
      shadowStrength.value = Math.min(
        1,
        settings.shadowOpacity * (0.35 + 0.65 * light) * 4,
      );
    },
    dispose() {
      geometry.dispose();
      material.dispose();
      shadowMaterial.dispose();
    },
  };
}
