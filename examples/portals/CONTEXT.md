# Portals

Vocabulary local to this demo. The technique itself is in the README.

## Glossary

**Portal** — used in drei's sense throughout: a mesh whose material shows a separate scene through it, rendered from the same camera as its surroundings. React's and fiber's helpers of the same name are the plumbing underneath, and are never called portals here.

**Frame** — the mesh the material is applied to. It contributes a silhouette and a depth and never a colour, so it is closer to a stencil than to a surface. Calling it "the plane" or "the screen" is what leads people to expect an image on it.

**Portal scene** — the scene formed by a portal's children, with its own environment, background and lights. Its **outer scene** is whatever scene the frame itself sits in — for a nested portal that is the enclosing portal scene, not the canvas root.

**Stencil sampling** — looking the render up by the fragment's screen position rather than by the frame's texture coordinate. This is the whole technique in three words, and the reason parallax needs no correction.

**Television** — the failure mode stencil sampling avoids: a scene rendered to a texture and mapped on by UV, so the image skews with the surface as the camera moves. Render-to-texture is the machinery both share; the television is the mistake.

**Full-canvas render** — the unit of a portal's per-frame cost. One whole scene drawn at canvas size times device pixel ratio, no matter how small the frame appears. **Frustum gating** is the one thing that removes it, and it cascades down nesting.

**`resolution` here always means the distance-field buffer's side length.** The portal scene's render size is never called resolution, because nothing can set it.
