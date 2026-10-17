import {
  ExtrudeGeometry,
  Path,
  Shape,
  ShapePath,
  Vector2,
  Vector3,
  type BufferGeometry,
} from "three/webgpu";
import { toCreasedNormals } from "three/addons/utils/BufferGeometryUtils.js";
import polygonClipping, { type Pair, type Polygon } from "polygon-clipping";
import type { GlyphLayoutInspection } from "@pmndrs/glyph";

/** Deterministic cells make replay and resize produce the same fracture. */
export function random(seed: number) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) | 0;
    return (seed >>> 0) / 4294967296;
  };
}

export function glyphShapes(layout: GlyphLayoutInspection, index: number) {
  const path = new ShapePath();
  const size = layout.glyphFontSizes[index];
  const x = (n: number) => layout.x[index] + n * size;
  const y = (n: number) => -(layout.y[index] + n * size);
  for (const contour of layout.outlineAt(index)) {
    if (!contour.length) continue;
    path.moveTo(x(contour[0][0]), y(contour[0][1]));
    for (const [, , cx, cy, x1, y1, line] of contour) {
      if (line) path.lineTo(x(x1), y(y1));
      else path.quadraticCurveTo(x(cx), y(cy), x(x1), y(y1));
    }
    path.currentPath?.closePath();
  }
  const shapes = path.toShapes();
  if (!shapes.length) return shapes;
  // Variable fonts can retain overlapping or self-intersecting contours. Normalize before extrusion.
  return polygonShapes(
    polygonClipping.union(
      shapes.map((shape) => {
        const points = shape.extractPoints(8);
        return [ring(points.shape), ...points.holes.map(ring)];
      }),
    ),
  );
}

function halfPlane(polygon: Pair[], nx: number, ny: number, distance: number) {
  const output: Pair[] = [];
  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i],
      b = polygon[(i + 1) % polygon.length];
    const da = a[0] * nx + a[1] * ny - distance;
    const db = b[0] * nx + b[1] * ny - distance;
    if (da <= 0) output.push(a);
    if (da <= 0 !== db <= 0) {
      const t = da / (da - db);
      output.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    }
  }
  return output;
}

function ring(points: Vector2[]): Pair[] {
  const result: Pair[] = points.map((p) => [p.x, p.y]);
  if (result.length) result.push([...result[0]]);
  return result;
}

function polygonShapes(polygons: Polygon[]) {
  return polygons.map(([outer, ...holes]) => {
    const shape = new Shape(outer.map(([x, y]) => new Vector2(x, y)));
    shape.holes = holes.map(
      (hole) => new Path(hole.map(([x, y]) => new Vector2(x, y))),
    );
    return shape;
  });
}

export function extrude(
  shapes: Shape[],
  bevel = 0.012,
  depth = 0.22,
  smooth = true,
) {
  const geometry = new ExtrudeGeometry(shapes, {
    depth,
    steps: 1,
    bevelEnabled: bevel > 0,
    bevelSegments: 5,
    bevelSize: bevel,
    bevelThickness: bevel,
    curveSegments: 32,
  });
  if (smooth) {
    // Unit-size font outlines need finer welding than the normal helper's 0.01 grid.
    geometry.scale(100, 100, 100);
    toCreasedNormals(geometry, Math.PI / 3);
    geometry.scale(0.01, 0.01, 0.01);
  }
  geometry.computeBoundingBox();
  return geometry;
}

/** Turns standing glyph extrusion onto the ground so the letter faces point up. */
export function sitOnGround(geometry: BufferGeometry) {
  geometry.rotateX(-Math.PI / 2);
  geometry.computeBoundingBox();
  const box = geometry.boundingBox!;
  geometry.translate(0, -box.min.y, -(box.min.z + box.max.z) / 2);
  geometry.computeBoundingBox();
  return geometry;
}

/**
 * Intersect each Voronoi cell with the full letter, preserving counters and disconnected islands.
 * `impact` places the strike as a fraction of the word's bounds, where splinters cluster.
 */
export function fractureGlyph(
  shapes: Shape[],
  seed: number,
  options: { cells?: number; depth?: number; impact?: [number, number] } = {},
) {
  const rng = random(seed);
  const polygons: Polygon[] = shapes.map((shape) => {
    const points = shape.extractPoints(32);
    return [ring(points.shape), ...points.holes.map(ring)];
  });
  const points = polygons.flat(2);
  const xs = points.map((p) => p[0]),
    ys = points.map((p) => p[1]);
  const minX = Math.min(...xs),
    maxX = Math.max(...xs);
  const minY = Math.min(...ys),
    maxY = Math.max(...ys);
  const [ix, iy] = options.impact ?? [0.58, 0.52];
  const impact: Pair = [minX + (maxX - minX) * ix, minY + (maxY - minY) * iy];
  // A single impact field spans the word. Dense splinters mix with large, irregular cells.
  const sites: Pair[] = Array.from({ length: options.cells ?? 11 }, (_, i) => {
    if (i % 3 === 0) {
      const angle = rng() * Math.PI * 2,
        radius = rng() ** 1.7;
      return [
        impact[0] + Math.cos(angle) * radius * (maxX - minX) * 0.35,
        impact[1] + Math.sin(angle) * radius * (maxY - minY) * 0.6,
      ];
    }
    return [minX + rng() * (maxX - minX), minY + rng() * (maxY - minY)];
  });
  return sites.flatMap((site, i) => {
    let cell: Pair[] = [
      [minX - 1, minY - 1],
      [maxX + 1, minY - 1],
      [maxX + 1, maxY + 1],
      [minX - 1, maxY + 1],
    ];
    sites.forEach((other, j) => {
      if (i === j || !cell.length) return;
      const nx = other[0] - site[0],
        ny = other[1] - site[1];
      cell = halfPlane(
        cell,
        nx,
        ny,
        (other[0] ** 2 + other[1] ** 2 - site[0] ** 2 - site[1] ** 2) / 2,
      );
    });
    if (cell.length < 3) return [];
    const clipped = polygonClipping.intersection(polygons, [
      [...cell, cell[0]],
    ]);
    if (!clipped.length) return [];
    return polygonShapes(clipped).map((piece) => {
      const geometry = extrude([piece], 0.0008, options.depth ?? 0.22, false);
      const center = geometry.boundingBox!.getCenter(new Vector3());
      geometry.translate(-center.x, -center.y, -center.z);
      const distance = Math.hypot(center.x - impact[0], center.y - impact[1]);
      return {
        geometry,
        center,
        velocity: new Vector3(
          (center.x - impact[0]) * 0.65 + (rng() - 0.5) * 0.65,
          0.15 + rng() * 1.3,
          (rng() - 0.5) * 1.7,
        ),
        spin: new Vector3(
          (rng() - 0.5) * 7,
          (rng() - 0.5) * 8,
          (rng() - 0.5) * 6,
        ),
        delay:
          Math.min(0.28, (distance / Math.max(maxX - minX, 0.01)) * 0.35) +
          rng() * 0.035,
      };
    });
  });
}
