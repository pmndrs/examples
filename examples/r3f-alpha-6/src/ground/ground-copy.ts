import {
  Group,
  MathUtils,
  Mesh,
  MeshBasicNodeMaterial,
  PlaneGeometry,
  Shape,
  ShapeGeometry,
  Vector2,
  type BufferGeometry,
  type Object3D,
  type PerspectiveCamera,
} from "three/webgpu";
import { uniform } from "three/tsl";
import { credits } from "../credits";
import { ease } from "../timeline";
import { createLabels, spreadRow, type LabelOptions } from "../labels";
import { createHitAreas } from "../shell/hit-areas";
import { impactTime, spring } from "./choreography";
import { quiet } from "../shell/quiet";
import type { Typography } from "../typography";
import type { GroundLayout } from "./layout";
import type { GroundSettings } from "./settings";

/** The closing copy starts building this long into the choreography, as the world turns light. */
const beat = impactTime + 0.3;

/** Overshoots past 1 and settles back, for entrances with a little snap. */
const backOut = (x: number) =>
  1 + 2.70158 * (x - 1) ** 3 + 1.70158 * (x - 1) ** 2;

/**
 * Announcement copy printed flat on the ground. Each item sits under the same screen position as the flat
 * layout, sized in pixels, so the HTML hit areas still line up. `copyStretch` lengthens type along the
 * ground like road markings so distant lines stay legible. The top heading stays upright on the screen,
 * and `footerOnGround` moves the credits between the ground and the screen.
 */
export function createGroundCopy(
  typography: Typography,
  settings: GroundSettings,
  onError: (error: unknown) => void,
  layout: GroundLayout,
  w: number,
  h: number,
) {
  const root = new Group(),
    screen = new Group(),
    hits = createHitAreas();
  root.add(screen);
  const labels = createLabels(typography, onError, true);
  // Entrance cues for the closing copy, each run from 0 to 1 by `update`.
  const enter = {
    version: uniform(0),
    alpha: uniform(0),
    now: uniform(0),
    headline: uniform(0),
  };
  const compact = w < 650;
  const patches: { group: Group; scale: number; slant: number }[] = [];
  const geometries: BufferGeometry[] = [];
  const materials: MeshBasicNodeMaterial[] = [];
  /** A patch of ground under a screen point where one unit reads as one pixel. */
  const place = (x: number, y: number, ...children: Object3D[]) => {
    const point = layout.at(x, y);
    const group = new Group();
    group.position.set(point.x, 2, point.z);
    group.rotation.x = -Math.PI / 2;
    if (children.length) group.add(...children);
    root.add(group);
    patches.push({
      group,
      scale: layout.scale(point),
      slant: layout.slant(point),
    });
    return group;
  };
  /** A point on the screen plane that follows the camera, one unit per pixel. */
  const pin = (x: number, y: number, ...children: Object3D[]) => {
    const group = new Group();
    group.position.set(x, y, 0);
    if (children.length) group.add(...children);
    screen.add(group);
    return group;
  };
  const label = (
    text: string,
    x: number,
    y: number,
    fontSize: number,
    options: LabelOptions = {},
    at = place,
  ) => {
    const object = labels.create(text, fontSize, options);
    at(x, y, object);
    return object;
  };
  const plane = (width: number, height: number, color: string, opacity = 1) => {
    const material = new MeshBasicNodeMaterial({
      color,
      transparent: true,
      opacity,
      depthWrite: false,
      toneMapped: false,
    });
    const geometry = new PlaneGeometry(width, height);
    materials.push(material);
    geometries.push(geometry);
    return new Mesh(geometry, material);
  };

  label(
    "-  B R E A K I N G   C H A N G E S  -",
    0,
    h / 2 - 46,
    compact ? 9 : 10,
    { tone: "heading" },
    pin,
  );
  label(
    "REACT THREE FIBER",
    -w / 2 + 32,
    h / 2 - 46,
    10,
    { tone: "muted", align: "left" },
    pin,
  ).visible = !compact;

  const versionSize = compact ? 17 : 21;
  const version = labels.create("r3f v10", versionSize, {
    reveal: { progress: enter.version, rise: 0.6, stagger: 0.8 },
  });
  const alpha = labels.create("Alpha 6", versionSize, {
    tone: "accent",
    reveal: { progress: enter.alpha, rise: 0.8, tracking: 0.4, stagger: 0.8 },
  });
  const versionWidth = version.measure().width,
    alphaWidth = alpha.measure().width;
  const releaseWidth = versionWidth + 14 + alphaWidth;
  place(0, -h * 0.067, version, alpha);
  label("is now", 0, -h * 0.118, compact ? 14 : 16, {
    tone: "muted",
    reveal: { progress: enter.now, rise: 0.6, stagger: 0.6 },
  });
  label(
    "WebGPU First",
    0,
    -h * 0.182,
    Math.min(compact ? w * 0.087 : 50, h * 0.065),
    {
      bold: true,
      reveal: {
        progress: enter.headline,
        rise: 0.7,
        tracking: 0.35,
        stagger: 1.2,
      },
    },
  );

  // The Poimandres mark from the HTML logo, drawn at the same 36.52 px.
  const unit = (compact ? 33.2 : 36.52) / 3.32;
  const square = (
    x: number,
    y: number,
    points: [number, number][] = [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ],
  ) =>
    new Shape(
      points.map(
        ([px, py]) =>
          new Vector2((x + px - 1.66) * unit, (1.66 - y - py) * unit),
      ),
    );
  const markGeometry = new ShapeGeometry([
    square(0, 1.16),
    square(1.16, 1.16),
    square(1.16, 2.32),
    square(1.16, 0, [
      [0, 0],
      [2.16, 0],
      [2.16, 2.16],
      [1.16, 2.16],
      [1.16, 1],
      [0, 1],
    ]),
  ]);
  const markMaterial = new MeshBasicNodeMaterial({
    transparent: true,
    depthWrite: false,
    toneMapped: false,
  });
  markMaterial.colorNode = labels.ink;
  const mark = new Mesh(markGeometry, markMaterial);
  geometries.push(markGeometry);
  materials.push(markMaterial);
  hits.add("logo", place(0, -h * 0.286, mark), 0, 0, 56, 56);

  const linkCues = ["Docs", "/", "Examples", "/", "WebGL"].map(() =>
    uniform(0),
  );
  const links = ["Docs", "/", "Examples", "/", "WebGL"].map((text, i) => {
    const reveal = { progress: linkCues[i], rise: 0.6, stagger: 0.5 };
    return text === "/"
      ? labels.create(text, 12, { tone: "muted", reveal })
      : labels.create(text, 14, { reveal });
  });
  const centers = spreadRow(links, 18);
  const row = place(0, -h * 0.353, ...links);
  ["docs", "examples", "webgl"].forEach((key, i) =>
    hits.add(
      key,
      row,
      centers[i * 2],
      0,
      links[i * 2].measure().width + 28,
      44,
    ),
  );

  const trackWidth = compact ? 190 : 226;
  const track = plane(trackWidth, 2, "#77716a", 0.18),
    progress = plane(trackWidth, 2, "#ed582c");
  progress.position.z = 0.1;
  // The scrubber's thumb travels its width minus the 9 px thumb, so it spans the drawn track.
  hits.add(
    "timeline",
    place(0, -h * 0.407, track, progress),
    0,
    0,
    trackWidth + 9,
    32,
  );

  // Each footer item rides in a carrier that moves between a spot on the ground and one on the screen.
  const footer: { carrier: Group; ground: Group; screen: Group }[] = [];
  const foot = (
    text: string,
    x: number,
    y: number,
    fontSize: number,
    options: LabelOptions = {},
  ) => {
    const object = labels.create(text, fontSize, { tone: "muted", ...options });
    const carrier = new Group();
    carrier.add(object);
    footer.push({ carrier, ground: place(x, y), screen: pin(x, y) });
    return object;
  };
  const footY = -h / 2 + 29;
  credits.forEach(([text], i) => {
    const x = compact
      ? i < 3
        ? ((i - 1) * (w - 32)) / 3
        : ((i - 3.5) * (w - 32)) / 2
      : [-210, -130, -20, 90, 190][i];
    const credit = foot(
      text,
      x,
      compact ? -h / 2 + (i < 3 ? 42 : 14) : footY,
      compact ? 9 : 11,
    );
    hits.add(
      `credit-${i}`,
      credit.parent!,
      0,
      0,
      credit.measure().width + 20,
      compact ? 28 : 38,
    );
  });
  foot("BUILT WITH", -w / 2 + 32, footY, 9, { align: "left" }).visible =
    w > 800;
  foot("ALPHA 6", w / 2 - 32, footY, 9, { align: "right" }).visible = w > 800;
  // A quiet recording keeps the announcement and drops the header and credits around it.
  if (quiet) {
    screen.visible = false;
    footer.forEach(({ carrier }) => (carrier.visible = false));
  }

  return {
    root,
    screen,
    /** `t` is choreography time and `amount` is overall intro progress from 0 to 1. */
    update(t: number, amount: number, settings: GroundSettings) {
      labels.theme.value = ease(t, impactTime + 0.05, impactTime + 1.2);
      labels.headingColor.value.set(settings.color2);
      // The sentence builds on a beat once the world turns light, each line overlapping the last.
      const cue = (start: number, length: number) =>
        Math.max(0, Math.min(1, (t - beat - start) / length));
      enter.version.value = cue(0, 0.5);
      enter.alpha.value = cue(0.3, 0.5);
      // "Alpha 6" drives in from the right and shoves "r3f v10" aside on a spring.
      const shove =
        t < beat + 0.3 ? 0 : 1 - spring(t - beat - 0.3, 1, 0, -6, 11, 0.5);
      version.position.x =
        -versionWidth / 2 + (-releaseWidth / 2 + versionWidth / 2) * shove;
      alpha.position.x =
        -releaseWidth / 2 + versionWidth + 14 + (1 - shove) * alphaWidth * 0.6;
      enter.now.value = cue(0.6, 0.45);
      enter.headline.value = cue(0.75, 0.95);
      // The mark spins a quarter turn as it pops in, then the links follow one by one.
      const pop = backOut(cue(1.35, 0.5));
      mark.scale.setScalar(pop);
      mark.rotation.z = (pop - 1) * (Math.PI / 2);
      linkCues.forEach((link, i) => (link.value = cue(1.45 + i * 0.07, 0.45)));
      // The track draws on from the left, and the playback progress fills only what is drawn.
      const draw = 1 - (1 - cue(1.75, 0.5)) ** 3;
      track.scale.x = Math.max(0.001, draw);
      track.position.x = (-trackWidth * (1 - track.scale.x)) / 2;
      progress.scale.x = Math.max(0.001, Math.min(amount, draw));
      progress.position.x = (-trackWidth * (1 - progress.scale.x)) / 2;
      for (const { group, scale, slant } of patches)
        group.scale.set(
          scale,
          scale * (1 + (1 / slant - 1) * settings.copyStretch),
          scale,
        );
      labels.update();
      for (const spot of footer)
        (settings.footerOnGround ? spot.ground : spot.screen).add(spot.carrier);
    },
    /** Holds the screen copy just past the near plane, facing the camera at one unit per pixel, then moves the link hit areas. */
    follow(camera: PerspectiveCamera, canvas: HTMLCanvasElement) {
      const near = camera.near * 2;
      screen.position
        .set(0, 0, -near)
        .applyQuaternion(camera.quaternion)
        .add(camera.position);
      screen.quaternion.copy(camera.quaternion);
      screen.scale.setScalar(
        (2 * near * Math.tan(MathUtils.degToRad(camera.fov / 2))) /
          camera.zoom /
          h,
      );
      hits.update(camera, canvas);
    },
    dispose() {
      hits.dispose();
      labels.dispose();
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
    },
  };
}
