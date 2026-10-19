import {
  Color,
  DoubleSide,
  Matrix4,
  MeshBasicNodeMaterial,
  Vector3,
  type Node,
  type Object3D,
} from "three/webgpu";
import {
  color,
  float,
  instanceIndex,
  mix,
  smoothstep,
  uniform,
  varying,
} from "three/tsl";
import { defineTextMaterial } from "@pmndrs/glyph/three";
import type { Typography } from "./typography";

export type Tone = "ink" | "muted" | "accent" | "heading";
type Opacity = Node<"float">;
export type LabelOptions = {
  tone?: Tone;
  opacity?: Opacity;
  bold?: boolean;
  align?: "left" | "center" | "right";
  reveal?: Reveal;
};

/**
 * Letters enter in turn from the left as `progress` runs from 0 to 1: each rises `rise` font sizes into
 * place, overshoots, and settles, while the line closes in from `tracking` times its width wider.
 * `stagger` is how much of the progress the cascade spends waiting for the last letter.
 */
export type Reveal = {
  progress: Opacity;
  rise?: number;
  tracking?: number;
  stagger?: number;
};

/**
 * A revealing label's local x and y axes, scale included, in the glyph renderer's space, which is where
 * text materials see their vertices.
 */
type Frame = { space?: Object3D; right: Vector3; up: Vector3 };
const toSpace = new Matrix4();

/**
 * Glyph labels whose tones share one theme blend, so all copy flips from dark to light together.
 * `depthTest` lets solid geometry hide labels that lie on a surface.
 */
export function createLabels(
  typography: Typography,
  onError: (error: unknown) => void,
  depthTest = false,
) {
  const theme = uniform(0),
    headingColor = uniform(new Color());
  const ink = mix(color("#d1d0cd"), color("#24221f"), theme);
  const muted = mix(color("#818183"), color("#77716a"), theme);
  const materials: MeshBasicNodeMaterial[] = [];
  const texts: { dispose(): void }[] = [];
  const revealing: { object: Object3D; frame: Frame }[] = [];
  const material = (
    tone: Tone,
    opacity: Opacity = uniform(1),
    reveal?: Reveal & {
      fontSize: number;
      width: Opacity;
      letters: Opacity;
      frame: Frame;
    },
  ) =>
    defineTextMaterial((context) => {
      const material = new MeshBasicNodeMaterial({
        transparent: true,
        depthWrite: false,
        depthTest,
        toneMapped: false,
        side: DoubleSide,
      });
      material.positionNode = context.position;
      let shown: Opacity = float(1);
      if (reveal) {
        // Letters start in turn by their order in the line and each moves as one piece, rising on a
        // back-out curve that overshoots and settles while the line closes in from wider spacing.
        const {
          rise = 0.5,
          tracking = 0,
          stagger = 1,
          fontSize,
          width,
          letters,
          frame,
        } = reveal;
        frame.space = context.root.renderObject;
        const right = uniform(frame.right),
          up = uniform(frame.up);
        const order = instanceIndex
          .toFloat()
          .div(letters.sub(1).max(1))
          .clamp(0, 1);
        const own = reveal.progress
          .mul(1 + stagger)
          .sub(order.mul(stagger))
          .clamp(0, 1);
        const back = own.sub(1);
        const left = back
          .mul(back)
          .mul(back.mul(2.70158).add(1.70158))
          .add(1)
          .oneMinus();
        material.positionNode = context.position
          .add(right.mul(order.sub(0.5).mul(width).mul(left.mul(tracking))))
          .add(up.mul(left.mul(-rise * fontSize)));
        shown = varying(smoothstep(0, 0.12, own));
      }
      material.colorNode =
        tone === "heading"
          ? headingColor
          : tone === "accent"
            ? color("#ee5429")
            : tone === "muted"
              ? muted
              : ink;
      material.opacityNode = context.shader.opacity.mul(opacity).mul(shown);
      materials.push(material);
      return material;
    });
  return {
    theme,
    headingColor,
    ink,
    /** Text positioned so its local origin is the alignment anchor at the vertical ink center. */
    create(text: string, fontSize: number, options: LabelOptions = {}) {
      const width = uniform(1),
        letters = uniform(1);
      const frame: Frame | undefined = options.reveal && {
        right: new Vector3(1, 0, 0),
        up: new Vector3(0, 1, 0),
      };
      const object = typography.handle.createText({
        font: options.bold ? typography.display : typography.detail,
        text,
        style: { fontSize, lineHeight: 1.1 },
        material: material(
          options.tone ?? "ink",
          options.opacity,
          options.reveal &&
            frame && { ...options.reveal, fontSize, width, letters, frame },
        ),
      });
      object.onError = onError;
      if (frame) revealing.push({ object, frame });
      const m = object.glyphs();
      width.value = m.width;
      letters.value = m.glyphCount;
      const box = m.inkBounds!;
      object.position.set(
        -(options.align === "left"
          ? 0
          : options.align === "right"
            ? m.width
            : m.width / 2),
        box.y + box.height / 2,
        0,
      );
      texts.push(object);
      return object;
    },
    /** Follows each revealing label to where it is drawn, so its letters move along its own axes. Call after moving labels. */
    update() {
      for (const { object, frame } of revealing) {
        object.updateWorldMatrix(true, false);
        toSpace.identity();
        if (frame.space) toSpace.copy(frame.space.matrixWorld).invert();
        toSpace.multiply(object.matrixWorld);
        frame.right.setFromMatrixColumn(toSpace, 0);
        frame.up.setFromMatrixColumn(toSpace, 1);
      }
    },
    dispose() {
      texts.forEach((text) => text.dispose());
      materials.forEach((material) => material.dispose());
    },
  };
}

/** Lays centered labels out in a row around x = 0 with `gap` between neighbors and returns each label's center. */
export function spreadRow(
  row: { position: { x: number }; measure(): { width: number } }[],
  gap: number,
) {
  const widths = row.map((object) => object.measure().width);
  let x =
    -(widths.reduce((sum, width) => sum + width) + gap * (row.length - 1)) / 2;
  return row.map((object, i) => {
    const center = x + widths[i] / 2;
    object.position.x += center;
    x += widths[i] + gap;
    return center;
  });
}
