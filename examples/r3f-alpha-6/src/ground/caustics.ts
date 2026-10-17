import {
  LightingModel,
  MultiplyBlending,
  NodeMaterial,
  type Color,
} from "three/webgpu";
import {
  cos,
  diffuseColor,
  float,
  length,
  normalView,
  positionLocal,
  sin,
  time,
  vec2,
  vec3,
  vec4,
} from "three/tsl";

/**
 * What the glass casts into the transmitted shadow map: its tint darkened toward the rims and lit up by
 * a drifting caustic web. The web comes from the glyph's own xz so it travels with each letter and shard.
 * Red, green and blue see slightly shifted webs, which splits the bright lines into colored fringes.
 */
export function causticCast(tint: Color) {
  const web = (offset: number) => {
    const p = positionLocal.xz.mul(14).sub(250).add(vec2(offset, 0));
    // TSL node chains are untyped here, so the loop carries them as `any`.
    let i: any = p;
    let c: any = float(1);
    for (let n = 0; n < 4; n++) {
      const t = time.mul(0.3).mul(1 - 3.5 / (n + 1));
      const ix = i.x,
        iy = i.y;
      i = p.add(
        vec2(
          cos(t.sub(ix)).add(sin(t.add(iy))),
          sin(t.sub(iy)).add(cos(t.add(ix))),
        ),
      );
      c = c.add(
        float(1).div(
          length(
            vec2(
              p.x.div(sin(i.x.add(t)).div(0.005)),
              p.y.div(cos(i.y.add(t)).div(0.005)),
            ),
          ),
        ),
      );
    }
    return float(1.17).sub(c.div(4).pow(1.4)).abs().pow(8);
  };
  const facing = normalView.z.max(0).pow(6);
  const light = vec3(web(-0.35), web(0), web(0.35)).mul(5).add(0.5);
  return vec4(light.mul(facing).mul(vec3(tint.r, tint.g, tint.b)), 1);
}

/** Multiplies the floor by the colored light that reaches it: 1 in the open, darker in shadow, above 1 in caustics. */
class CausticLighting extends LightingModel {
  light = vec3(1).toVar("causticLight");
  strength: unknown;

  constructor(strength: unknown) {
    super();
    this.strength = strength;
  }

  // `shadowNode` is only set on lights that cast.
  direct({ lightNode }: any) {
    if (lightNode.shadowNode) this.light.mulAssign(vec3(lightNode.shadowNode));
  }

  finish({ context }: any) {
    diffuseColor.a.assign(1);
    context.outgoingLight.rgb.assign(
      float(1).add(this.light.sub(1).mul(this.strength as never)),
    );
  }
}

export class CausticReceiverMaterial extends NodeMaterial {
  isCausticReceiver = true;
  strength: unknown;

  constructor(strength: unknown) {
    super();
    this.strength = strength;
    this.lights = true;
    this.transparent = true;
    this.depthWrite = false;
    this.blending = MultiplyBlending;
    this.premultipliedAlpha = true;
  }

  setupLightingModel() {
    return new CausticLighting(this.strength);
  }
}
