import {
  Color,
  DoubleSide,
  MeshBasicNodeMaterial,
  type Node,
} from "three/webgpu";
import { color, mix, uniform } from "three/tsl";
import { defineTextMaterial } from "@pmndrs/glyph/three";
import type { Typography } from "./typography";

export type Tone = "ink" | "muted" | "accent" | "heading";
type Opacity = Node<"float">;
export type LabelOptions = {
  tone?: Tone;
  opacity?: Opacity;
  bold?: boolean;
  align?: "left" | "center" | "right";
};

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
  const material = (tone: Tone, opacity: Opacity = uniform(1)) =>
    defineTextMaterial((context) => {
      const material = new MeshBasicNodeMaterial({
        transparent: true,
        depthWrite: false,
        depthTest,
        toneMapped: false,
        side: DoubleSide,
      });
      material.positionNode = context.position;
      material.colorNode =
        tone === "heading"
          ? headingColor
          : tone === "accent"
            ? color("#ee5429")
            : tone === "muted"
              ? muted
              : ink;
      material.opacityNode = context.shader.opacity.mul(opacity);
      materials.push(material);
      return material;
    });
  return {
    theme,
    headingColor,
    ink,
    /** Text positioned so its local origin is the alignment anchor at the vertical ink center. */
    create(text: string, fontSize: number, options: LabelOptions = {}) {
      const object = typography.handle.createText({
        font: options.bold ? typography.display : typography.detail,
        text,
        style: { fontSize, lineHeight: 1.1 },
        material: material(options.tone ?? "ink", options.opacity),
      });
      object.onError = onError;
      const m = object.glyphs();
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
