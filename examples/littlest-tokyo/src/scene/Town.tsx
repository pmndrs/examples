import { Damper } from "@pmndrs/klipp";
import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import {
  AnimationClip,
  type AnimationAction,
  type KeyframeTrack,
  type Mesh,
} from "three";

import { townUrl, tramNode, tramParts } from "../model";

// The tram runs on its own action, so the scroll can drive it while the rest of the town keeps moving.
const isTramTrack = (track: KeyframeTrack) =>
  tramParts.includes(track.name.split(".")[0]);

/** When the tram leaves its stop: the clip holds it there for a moment first. */
function departure(clip: AnimationClip): number {
  const track = clip.tracks.find(({ name }) => name === `${tramNode}.position`);
  if (!track) return 0;
  const { times, values } = track;
  const size = values.length / times.length;
  for (let key = 1; key < times.length; key++) {
    for (let i = 0; i < size; i++)
      if (values[key * size + i] !== values[i]) return times[key - 1];
  }
  return 0;
}

const timeScale = 0.5;

/** The town and its animation. The tram drives its first leg as `tramProgress` goes from `0` to `1`. */
export function Town({ tramProgress }: { tramProgress: number }) {
  const { scene, animations } = useGLTF(townUrl);
  const clips = useMemo(() => {
    const [take] = animations;
    return [
      new AnimationClip(
        "town",
        take.duration,
        take.tracks.filter((track) => !isTramTrack(track)),
      ),
      new AnimationClip("tram", take.duration, take.tracks.filter(isTramTrack)),
    ];
  }, [animations]);
  const { actions } = useAnimations(clips, scene);
  const leaves = useMemo(() => departure(clips[1]), [clips]);

  useLayoutEffect(() => {
    scene.traverse((object) => {
      if ((object as Mesh).isMesh)
        object.castShadow = object.receiveShadow = true;
    });
  }, [scene]);

  useEffect(() => {
    actions.town?.play().setEffectiveTimeScale(timeScale);
  }, [actions]);

  const tram = useRef<AnimationAction | null>(null);
  useEffect(() => {
    tram.current = actions.tram?.play() ?? null;
    if (tram.current) tram.current.paused = true;
  }, [actions]);

  // Eases after the scroll, so a turn of the wheel moves the tram smoothly instead of in steps.
  const drive = useRef({ damper: new Damper(), value: 0 });
  useFrame((_, dt) => {
    const action = tram.current;
    if (!action) return;
    drive.current.value = drive.current.damper.update(
      drive.current.value,
      tramProgress,
      0.3,
      dt,
    );
    action.time =
      leaves + drive.current.value * (action.getClip().duration / 2 - leaves);
  });

  return <primitive object={scene} position={[1, 1, 0]} scale={0.01} />;
}

useGLTF.preload(townUrl);
