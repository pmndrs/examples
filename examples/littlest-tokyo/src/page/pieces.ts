const docs = "https://pmndrs.github.io/klipp/docs/";

/** What a shot is built from, each with its page in the docs. */
export const pieces = {
  "Body.Follow": "body/follow",
  "Body.PositionComposer": "body/position-composer",
  "Body.SplineDolly": "body/spline-dolly",
  "Aim.HardLookAt": "aim/hard-look-at",
  "Aim.RotateWithFollowTarget": "aim/rotate-with-follow-target",
  "Aim.RotationComposer": "aim/rotation-composer",
  "Aim.SplineDollyLookAtTargets": "aim/spline-dolly-look-at-targets",
  "Extension.GroupFraming": "extension/group-framing",
  "Extension.Lens": "extension/lens",
  "Extension.Recomposer": "extension/recomposer",
  "Extension.SplineRoll": "extension/spline-roll",
  "Noise.BasicMultiChannelPerlin": "noise/basic-multi-channel-perlin",
  "klipp.shot": "api/klipp#the-shot",
} as const;

export type Piece = keyof typeof pieces;

export const pieceUrl = (piece: Piece): string => docs + pieces[piece];
