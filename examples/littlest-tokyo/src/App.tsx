import { BlendCurves, type CustomBlend } from "@pmndrs/klipp";
import { Klipp } from "@pmndrs/klipp/react";
import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useRef, useState } from "react";

import { AlleyCamera } from "./cameras/AlleyCamera";
import { BirdCamera } from "./cameras/BirdCamera";
import { fallAt } from "./cameras/dive";
import { DiveCamera } from "./cameras/DiveCamera";
import { FreeLookCamera } from "./cameras/FreeLookCamera";
import { SlidingCamera, TurningCamera } from "./cameras/MascotCameras";
import { outroOrbit, overviewOrbit } from "./cameras/overview";
import { OverviewCamera } from "./cameras/OverviewCamera";
import { AlongsideCamera, GoProCamera } from "./cameras/TramCameras";
import { Chapters } from "./page/Chapters";
import { Hero } from "./page/Hero";
import { Outro } from "./page/Outro";
import { ScrollRail } from "./page/ScrollRail";
import { Story } from "./page/Story";
import { Effects } from "./scene/Effects";
import { focusAt } from "./scene/focus";
import { Stage } from "./scene/Stage";
import { Town } from "./scene/Town";
import { useTour } from "./useTour";

// The free look starts from the shot on screen, so it cuts in.
const customBlends: CustomBlend[] = [
  { to: "free-look", blend: { curve: BlendCurves.cut, time: 0 } },
];

const modelUrl =
  "https://sketchfab.com/3d-models/littlest-tokyo-94b24a60dc1b48248de50bf087c0f042";

export default function App() {
  const [freeLook, setFreeLook] = useState(false);
  const [touring, setTouring] = useState(false);
  const [scroll, setScroll] = useState(0);
  const story = useRef<HTMLDivElement>(null);
  const tour = useTour(scroll);
  const { at, shot, finishing, arrive, progress, tramSide, mascotSlide } = tour;

  return (
    <>
      <Canvas
        camera={{ position: [0, 0, 12.5], fov: 30 }}
        dpr={[1, 1.5]}
        shadows
      >
        <Stage />
        <Klipp defaultBlend={{ damping: 0.75 }} customBlends={customBlends}>
          <FreeLookCamera live={freeLook} />
          <OverviewCamera
            name="overview"
            orbit={overviewOrbit}
            live={shot === "hero"}
          />
          <OverviewCamera
            name="outro"
            orbit={outroOrbit}
            live={shot === "outro"}
          />
          <Suspense fallback={null}>
            <Town tramProgress={progress.tram} />
            <Effects
              focus={focusAt(at)}
              speed={freeLook ? 0 : fallAt(progress.dive)}
            />
            <DiveCamera
              live={shot === "dive"}
              progress={progress.dive}
              finishing={finishing === "dive"}
              onArrive={arrive}
            />
            <TurningCamera live={shot === "mascot" && !mascotSlide} />
            <SlidingCamera live={shot === "mascot" && mascotSlide} />
            <AlleyCamera
              live={shot === "alley"}
              progress={progress.alley}
              finishing={finishing === "alley"}
              onArrive={arrive}
            />
            <GoProCamera live={shot === "tram" && !tramSide} />
            <AlongsideCamera live={tramSide} />
            <BirdCamera live={shot === "bird"} />
          </Suspense>
        </Klipp>
      </Canvas>

      <Story
        ref={story}
        onScroll={setScroll}
        freeLook={freeLook}
        touring={touring}
        setTouring={setTouring}
      >
        <Hero onPlay={() => setTouring(true)} />
        <Chapters tour={tour} />
        <Outro onTakeControl={() => setFreeLook(true)} />
      </Story>
      <ScrollRail story={story} scroll={scroll} />
      {freeLook && (
        <button
          type="button"
          className="tokyo-free-look"
          onClick={() => setFreeLook(false)}
        >
          Back to the tour
        </button>
      )}
      <a
        className="showcase-credit"
        href={modelUrl}
        target="_blank"
        rel="noreferrer"
      >
        Littlest Tokyo by glenatron, CC BY 4.0
      </a>
      <Loader />
    </>
  );
}
