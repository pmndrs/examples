import { BlendHints } from "@pmndrs/klipp";
import {
  Aim,
  Body,
  Extension,
  Klipp,
  VirtualCamera,
} from "@pmndrs/klipp/react";
import type { OrbitFollowBodyThree } from "@pmndrs/klipp/three";
import {
  ContactShadows,
  Environment,
  Html,
  Lightformer,
  Loader,
  useGLTF,
} from "@react-three/drei";
import { applyProps, Canvas, useThree } from "@react-three/fiber";
import {
  memo,
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import type {
  BufferGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  Object3D,
} from "three";
import { infopoints, type Infopoint } from "./infopoints";
import { OrbitInput } from "./OrbitInput";
import { ViewfinderEffects } from "./ViewfinderEffects";
import { ViewfinderHud } from "./ViewfinderHud";
import camcorderUrl from "./models/camcorder.glb?url";

const modelUrl =
  "https://sketchfab.com/3d-models/panasonic-m5-vhs-camcorder-game-ready-model-2d60a254516b4b639a0097520c4b0db6";
const floorY = -0.34;
const recentering = { enabled: true, wait: 4, time: 2 };

function Camcorder({ ref }: { ref: RefObject<Group | null> }) {
  const { scene, materials } = useGLTF(camcorderUrl);
  const body = materials.lambert1 as MeshStandardMaterial;
  const glass = useMemo(() => body.clone(), [body]);

  useLayoutEffect(() => {
    // The model shares one blended material, which would draw every part without depth: only the glass is see-through.
    applyProps(body, {
      transparent: false,
      depthWrite: true,
      alphaTest: 0.5,
      needsUpdate: true,
    });
    applyProps(glass, {
      transparent: true,
      depthWrite: false,
      alphaTest: 0,
      needsUpdate: true,
    });
    for (const material of [body, glass]) {
      // The normal map is baked with green pointing down, the opposite of what three expects.
      material.normalScale.set(1, -1);
    }
    scene.traverse((object) => {
      const mesh = object as Mesh<BufferGeometry, MeshStandardMaterial>;
      if (!mesh.isMesh) return;
      mesh.castShadow = mesh.receiveShadow = true;
      mesh.material = mesh.name.startsWith("glass") ? glass : body;
    });
  }, [scene, body, glass]);

  return (
    <group ref={ref}>
      <primitive object={scene} />
    </group>
  );
}

function StaticShadows() {
  const gl = useThree((state) => state.gl);

  useLayoutEffect(() => {
    gl.shadowMap.autoUpdate = false;
    gl.shadowMap.needsUpdate = true;
    return () => {
      gl.shadowMap.autoUpdate = true;
    };
  }, [gl]);

  return null;
}

const Stage = memo(function Stage({
  model,
}: {
  model: RefObject<Group | null>;
}) {
  return (
    <>
      <color attach="background" args={["#201e29"]} />
      <ambientLight intensity={0.4 * Math.PI} />
      <spotLight
        position={[1.5, 4, -2]}
        angle={0.4}
        penumbra={1}
        intensity={6 * Math.PI}
        decay={0}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
        shadow-normalBias={0.01}
      />
      <Environment resolution={256} environmentIntensity={1}>
        <Lightformer
          intensity={2}
          rotation-x={Math.PI / 2}
          position={[0, 5, 0]}
          scale={[8, 8, 1]}
        />
        <Lightformer
          color="#ff3ea5"
          intensity={6}
          rotation-y={Math.PI / 2}
          position={[-6, 1, 0]}
          scale={[10, 0.4, 1]}
        />
        <Lightformer
          color="#2de2ff"
          intensity={6}
          rotation-y={-Math.PI / 2}
          position={[6, 1, 0]}
          scale={[10, 0.4, 1]}
        />
        <Lightformer intensity={1.5} position={[0, 1, -8]} scale={[6, 3, 1]} />
      </Environment>
      <Suspense fallback={null}>
        <Camcorder ref={model} />
        <StaticShadows />
        <ContactShadows
          position={[0, floorY, 0]}
          scale={4}
          blur={2.5}
          opacity={0.6}
          far={1}
          frames={1}
        />
      </Suspense>
    </>
  );
});

function Hotspots({
  model,
  onSelect,
}: {
  model: RefObject<Group | null>;
  onSelect: (infopoint: Infopoint) => void;
}) {
  useGLTF(camcorderUrl);

  return infopoints.map((infopoint) => (
    <Html
      key={infopoint.title}
      position={infopoint.anchor}
      center
      occlude={[model as RefObject<Object3D>]}
      zIndexRange={[10, 0]}
    >
      <button
        type="button"
        className="infopoint"
        aria-label={infopoint.title}
        title={infopoint.title}
        onClick={() => onSelect(infopoint)}
      >
        +
      </button>
    </Html>
  ));
}

const radiansToDegrees = (radians: number) => (radians * 180) / Math.PI;

function InfopointCamera({
  infopoint,
  live,
}: {
  infopoint: Infopoint;
  live: boolean;
}) {
  const { position, lookAt } = infopoint;
  const offset = [
    position[0] - lookAt[0],
    position[1] - lookAt[1],
    position[2] - lookAt[2],
  ];
  const radius = Math.hypot(offset[0], offset[1], offset[2]);
  const horizontal = radiansToDegrees(Math.atan2(-offset[0], offset[2]));
  const vertical = radiansToDegrees(Math.asin(offset[1] / radius));
  const orbit = useRef<OrbitFollowBodyThree>(null);

  // Every visit starts from the close-up's own framing, not from where the last one was left.
  useLayoutEffect(() => {
    if (!live || !orbit.current) return;
    for (const axis of Object.values(orbit.current.inputAxes))
      axis.setValue(axis.center);
  }, [live]);

  return (
    <VirtualCamera
      name={infopoint.title}
      priority={20}
      active={live}
      hints={BlendHints.sphericalPosition}
    >
      <Body.OrbitFollow
        ref={orbit}
        target={lookAt}
        radius={radius}
        horizontal={{
          center: horizontal,
          range: [horizontal - 35, horizontal + 35],
          damping: 0.15,
          recentering,
        }}
        vertical={{
          center: vertical,
          range: [vertical - 20, vertical + 20],
          damping: 0.15,
          recentering,
        }}
        radial={{ range: [Math.log(0.7), Math.log(1.4)], damping: 0.15 }}
      >
        {live && <OrbitInput />}
      </Body.OrbitFollow>
      <Aim.HardLookAt target={lookAt} />
      <Extension.Lens fov={infopoint.fov} />
    </VirtualCamera>
  );
}

function Scene({
  selected,
  onSelect,
}: {
  selected: Infopoint | null;
  onSelect: (infopoint: Infopoint) => void;
}) {
  const model = useRef<Group>(null);

  return (
    <>
      <Stage model={model} />
      <ViewfinderEffects focus={selected?.lookAt ?? null} />
      <Suspense fallback={null}>
        {!selected && <Hotspots model={model} onSelect={onSelect} />}
      </Suspense>

      <Klipp defaultBlend={{ damping: 0.4, maxSpeed: 1 }}>
        <VirtualCamera
          name="overview"
          priority={10}
          hints={BlendHints.sphericalPosition}
          initialState={{ fov: 30 }}
        >
          <Body.OrbitFollow
            target={[0, 0, 0]}
            radius={3.2}
            horizontal={{ center: 135, damping: 0.15, recentering }}
            vertical={{
              center: 15,
              range: [-5, 60],
              damping: 0.15,
              recentering,
            }}
            radial={{ damping: 0.15 }}
          >
            {!selected && <OrbitInput />}
          </Body.OrbitFollow>
          <Aim.HardLookAt target={[0, 0, 0]} />
        </VirtualCamera>
        {infopoints.map((infopoint) => (
          <InfopointCamera
            key={infopoint.title}
            infopoint={infopoint}
            live={selected === infopoint}
          />
        ))}
      </Klipp>
    </>
  );
}

export default function App() {
  const [selected, setSelected] = useState<Infopoint | null>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <Canvas
        camera={{ position: [0, 0, 12.5], fov: 30 }}
        dpr={[1, 1.5]}
        shadows
      >
        <Scene selected={selected} onSelect={setSelected} />
      </Canvas>
      <ViewfinderHud take={selected?.title ?? null} />
      {selected && (
        <div className="infopoint-card">
          <h2>{selected.title}</h2>
          <p>{selected.text}</p>
          <button type="button" onClick={() => setSelected(null)}>
            Back
          </button>
        </div>
      )}
      <a
        className="showcase-credit"
        href={modelUrl}
        target="_blank"
        rel="noreferrer"
      >
        Panasonic M5 VHS Camcorder by kennethtzh, CC BY 4.0
      </a>
      <Loader />
    </>
  );
}

useGLTF.preload(camcorderUrl);
