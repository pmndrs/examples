import type { Tour } from "../useTour";

import { Chapter } from "./Story";

/** The sections between the hero and the outro, each with what its shot is built from. */
export function Chapters({ tour: { mascotSlide, tramSide } }: { tour: Tour }) {
  return (
    <>
      <Chapter
        id="dive"
        title="Make an entrance"
        pieces={[
          "Body.SplineDolly",
          "Aim.SplineDollyLookAtTargets",
          "Extension.SplineRoll",
          "Extension.Lens",
          "Noise.BasicMultiChannelPerlin",
        ]}
      >
        <p>
          If you can draw the path, the camera can fly it. Swoop in, weave
          through, land on the moment.
        </p>
      </Chapter>
      <Chapter
        id="mascot"
        title="Keep it in frame"
        pieces={[
          mascotSlide ? "Body.PositionComposer" : "Aim.RotationComposer",
        ]}
      >
        <p>Your subject stays in the shot, wherever it runs.</p>
        <p data-hidden={mascotSlide ? undefined : ""}>
          Turn the camera or move it along. You say where things land on screen,
          Klipp does the rest.
        </p>
      </Chapter>
      <Chapter
        id="alley"
        title="Take the scenic route"
        pieces={[
          "Body.SplineDolly",
          "Aim.SplineDollyLookAtTargets",
          "Extension.SplineRoll",
          "Noise.BasicMultiChannelPerlin",
        ]}
      >
        <p>
          Point out the sights. The camera glances at each one as it rides past.
        </p>
      </Chapter>
      <Chapter
        id="tram"
        title="Ride along"
        pieces={
          tramSide
            ? ["Body.Follow", "Aim.HardLookAt", "Extension.GroupFraming"]
            : [
                "Body.Follow",
                "Aim.RotateWithFollowTarget",
                "Extension.Recomposer",
              ]
        }
      >
        <p>Mount a camera on anything that moves.</p>
        <p data-hidden={tramSide ? undefined : ""}>
          Steady like a dolly or rigid like an action cam, built from the same
          few pieces.
        </p>
      </Chapter>
      <Chapter
        id="bird"
        title="Look where it matters"
        pieces={["Aim.RotationComposer", "Extension.Lens", "klipp.shot"]}
      >
        <p>
          Point a long lens and the focus follows. Your effects always know what
          the camera is looking at.
        </p>
      </Chapter>
    </>
  );
}
