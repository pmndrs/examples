import { BlendHints } from "@pmndrs/klipp";
import { Aim, Body, Extension, VirtualCamera } from "@pmndrs/klipp/react";
import { useLayoutEffect, useState } from "react";
import { Matrix4, Object3D, Quaternion, Vector3 } from "three";

import { useTownNodes } from "../model";

// The tram's own axes are `+X` ahead and `+Z` up. The rig, in its middle, turns them into `-Z` ahead and `+Y` up.
const rigRotation = new Quaternion().setFromRotationMatrix(
  new Matrix4().makeBasis(
    new Vector3(0, -1, 0),
    new Vector3(0, 0, 1),
    new Vector3(-1, 0, 0),
  ),
);

/** A point riding in the middle of the tram, with axes cameras can bind to. */
function useTramRig() {
  const { tram } = useTownNodes();
  const [rig] = useState(() => {
    const object = new Object3D();
    object.position.set(0, -5, 70);
    object.quaternion.copy(rigRotation);
    return object;
  });
  useLayoutEffect(() => {
    tram.add(rig);
    return () => void tram.remove(rig);
  }, [tram, rig]);
  return rig;
}

/** Fixed to the tram's side at window height, facing the way the tram faces, like an action cam. */
export function GoProCamera({ live }: { live: boolean }) {
  const rig = useTramRig();
  return (
    <VirtualCamera
      name="tram-gopro"
      priority={20}
      active={live}
      initialState={{ fov: 70 }}
      hints={BlendHints.sphericalPosition}
    >
      <Body.Follow
        target={rig}
        bindingMode="lockToTarget"
        offset={[-0.56, -0.4, 1]}
      />
      <Aim.RotateWithFollowTarget target={rig} />
      <Extension.Recomposer dutch={-20} />
    </VirtualCamera>
  );
}

/** Rides next to the tram on the outside of the curve, looking at it. */
export function AlongsideCamera({ live }: { live: boolean }) {
  const rig = useTramRig();
  return (
    <VirtualCamera
      name="tram-alongside"
      priority={20}
      active={live}
      initialState={{ fov: 75 }}
      hints={BlendHints.sphericalPosition}
    >
      <Body.Follow
        target={rig}
        bindingMode="lockToTargetWithWorldUp"
        offset={[2, 0, 0]}
        damping={0.1}
      />
      <Aim.HardLookAt target={rig} />
      <Extension.GroupFraming
        members={[{ target: rig, size: 1.7 }]}
        damping={0.1}
        fitMode="ceiling"
        padding={0.2}
      />
    </VirtualCamera>
  );
}
