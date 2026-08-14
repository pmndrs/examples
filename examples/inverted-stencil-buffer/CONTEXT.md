# Inverted Stencil Buffer

Vocabulary local to this demo. The technique itself is in the README.

## Glossary

**Mask** — always a stencil region here, never an alpha texture. The word covers two objects that behave differently: the mesh that stamps, and the material that reads. Naming them apart is worth the effort, because everything surprising about the technique comes from confusing them.

**Writer** — the stamping mesh, `Mask` in drei. Invisible by construction, and occluding nothing; it is in the scene only for the pixels it covers.

**Consumer** — a material that has been given `useMask`'s properties. It never touches the buffer, only reads it, which is why any number of consumers can share one id without interfering.

**Invert** — a property of the consumer. drei's own documentation describes it as inverting _the mask_, which is misleading: the mask is identical either way, and two consumers of one id can invert independently of each other.

**Compound mask** — several writers sharing an id. Their silhouettes union, and every consumer of that id sees the union revealed or hidden as one region. This demo uses two.
