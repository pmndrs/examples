# Caustics

Vocabulary local to this demo. The technique itself is in the README.

## Glossary

**Caustic map** — the single-channel image, rendered from the light's point of view, holding the photon density each light-space texel deposits. It is the intermediate product of the whole technique, and it is what the word "caustics" names here: not the effect on screen, but this buffer.

**Catcher plane** — the auto-sized horizontal quad the map is projected onto, at the origin of the `Caustics` group's _own_ space. Not "the floor": the demo's floor is a different mesh, and tilting the group tilts the catcher with it while the floor stays put.

**Differential quad** — the four neighbouring taps, a fixed world distance apart, whose refracted rays are traced together so their before-and-after areas can be compared. Its edge length is `worldRadius`, which is why that prop is a step size and not a blur radius.

**Bake** — one full run of the passes, producing a map that later frames reuse unchanged. `frames` counts bakes, not frames of animation, and the counter resets on every React render.

**Local-space bake** — the light direction, the light camera and the catcher plane are all computed in the group's own coordinates, with any world transform above it ignored. Moving the rig afterwards carries the caustic along and costs nothing.

**Backside** — needs a subject in this demo, because both components have a prop of that name and they are unrelated: the `Caustics` one doubles the bake to cover far surfaces, the `MeshTransmissionMaterial` one doubles the transmission renders. Never say it bare.

**`ior` here is not a refractive index.** It sets the refraction strength of the bake, and values below 1 — this demo uses one — spread rays instead of converging them. Real glass would be around 1.5.
