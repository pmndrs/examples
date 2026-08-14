[![Static](https://img.shields.io/badge/example-%23646CFF.svg?logo=html5&logoColor=white)](https://pmndrs.github.io/examples/caustics)
[![CodeSandbox](https://img.shields.io/badge/codesandbox-040404?logo=codesandbox&logoColor=DBDBDB)](https://codesandbox.io/s/github/pmndrs/examples/tree/main/examples/caustics)
[![Stackblitz](https://img.shields.io/badge/stackblitz-fff?logo=Stackblitz&logoColor=1389FD)](https://stackblitz.com/github/pmndrs/examples/tree/main/examples/caustics)

```sh
$ npx degit pmndrs/examples/examples/caustics
```

![](thumbnail.webp)

## The problem

A glass object lit from above should not cast a flat grey shadow. It should throw a pattern — bright filaments where the curved surface has concentrated light, and darkness around them where that light came from. Getting there by simulation means tracing photons, which no real-time renderer does, and faking it with a texture means the pattern stops belonging to the object the moment either one moves.

## The technique

The bright part is measured rather than simulated, and it is measured once.

`Caustics` fits an orthographic camera to its children's bounds along the light direction and re-renders them into an off-screen buffer with their normals as colour. A single full-screen pass then walks that buffer: for every texel it takes four taps a fixed distance apart _in world space_, refracts each through the normal it sampled, intersects the four refracted rays with the ground plane, and writes the ratio of the entry area to the exit area. Where refraction squeezes four rays together the ratio explodes and a bright filament appears. That ratio is a photon-density estimate — no rays are marched and nothing bounces.

The resulting map is projected onto a horizontal quad, auto-sized and auto-placed beneath the object, through the light camera's matrices. It is shadow mapping's projection with the sign flipped: the same trick, used to paint light in rather than take it out.

`worldRadius` and `intensity` are the two dials that matter, and they pull against each other. `worldRadius` is the step of a finite difference: shrink it and neighbouring rays diverge harder relative to their spacing, so the pattern breaks into thinner, brighter threads. `intensity` then scales the whole thing back into range. This demo runs the step twelve times finer than the default and pays for it with a gain sixteen times lower.

`MeshTransmissionMaterial` supplies the glass, and the coupling between the two is free. That material renders the whole scene into its own buffer and refracts it — and because that buffer is a real render of the real scene, it contains the catcher plane. The glass shows the caustic through itself with nothing wiring them together.

## The pitfalls

**`lightSource` is a direction, not a position.** Whatever you pass is normalised, so its length is discarded and moving the light closer changes nothing. drei's documentation calls it a camera position.

**It adds light and can never remove it.** The projection blends additively. The dark ring a real caustic sits in has to come from somewhere else — here, from `AccumulativeShadows`. Without it the effect reads as a glow rather than as focused light.

**The cost is memory, not frame time.** At the default `resolution` the buffers come to roughly a quarter of a gigabyte, held for the component's lifetime, for a texture written once. Two of them exist only for `backside` and are allocated whether or not it is on.

**`resolution` does not buy detail.** The tap spacing reduces algebraically to `worldRadius` in world units, independent of the buffer size. Raising `resolution` costs memory and changes nothing you can see; `worldRadius` is the knob.

**One receiver, and it is a plane.** The catcher is a horizontal quad in the group's own space. Caustics cannot land on a wall, on a curve, or on another object — tilt the group and the plane tilts with it.

**`frames` counts bakes, not frames.** At its default the map is baked once per React render, so an unrelated re-render silently re-bakes. An animated object or a moving light needs it unbounded, which turns a one-off cost into a per-frame one.
