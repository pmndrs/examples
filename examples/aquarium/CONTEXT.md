# Aquarium

Vocabulary local to this demo. The technique itself is in the README.

## Glossary

**Aquarium** — the component, which is the glass mesh _and_ the masked group together. The mesh alone is the box; neither half on its own is the aquarium, and a change that keeps the mesh but drops the group has not kept the aquarium.

**Contents** — exactly what `Aquarium` is handed as children, and so exactly the subtree whose materials are given the stencil test. Not a loose word for "what is inside the box": something rendered next to `Aquarium` rather than within it is not contents, however close it sits, and it will be drawn on the canvas like anything else.

**Mask** — used here in the opposite sense to drei's. A drei mask is a shape drawn to reveal what it covers; this one is written by nothing, so it reveals nowhere. Containment does not come from the mask succeeding, it comes from the mask being inert in the buffer the glass samples. Read `useMask` in this demo as "keep off the canvas", not as "show through the shape".
