// gl-noise ships types for its package entry only; the ESM build is imported by
// path here, so point that specifier at the same declarations.
declare module "gl-noise/build/glNoise.m" {
  export * from "gl-noise/build/glNoise";
}
