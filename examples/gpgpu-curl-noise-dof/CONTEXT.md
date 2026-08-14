# GPGPU Curl Noise DOF

Vocabulary local to this demo. The technique itself is in the README.

## Glossary

**Position field** — what this demo computes: a closed-form function from seed and time to position, evaluated fresh every frame. Read it in opposition to a particle simulation, which integrates state forward and therefore needs two buffers. The distinction decides what can be added to this demo and what cannot.

**Ping-pong** — the two-target swap that gives a GPGPU simulation memory. Named here because it is the thing this demo does **not** do, and because everything the folder name leads a reader to expect is on the other side of it.

**Texel address attribute** — a vertex attribute holding, instead of a position, the coordinate at which that vertex should look its position up. The indirection that lets geometry stay constant while positions change every frame.

**Seed shell** — the sphere _surface_ the starting points occupy, all at one radius and none inside. Not a seed sphere: it has no interior, and that is why the output reads as a sheet.

**Visible fraction** — the share of the cloud actually rasterised, gated per particle in the vertex shader. Exposed as `fov`, which it is not.
