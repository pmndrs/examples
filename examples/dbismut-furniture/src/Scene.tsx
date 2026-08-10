import * as THREE from "three";
import {
  useRef,
  useState,
  useEffect,
  useMemo,
  type RefObject,
  type JSX,
} from "react";
import {
  Canvas,
  useFrame,
  createPortal,
  useThree,
  type ObjectMap,
  type ThreeElements,
} from "@react-three/fiber";
import {
  PerspectiveCamera,
  ScreenQuad,
  useGLTF,
  useFBO,
} from "@react-three/drei";
import { a, useSprings, type SpringValue } from "@react-spring/three";
import { type GLTF } from "three-stdlib";
import { CrossFadeMaterial } from "./XFadeMaterial";

type ModelData = GLTF & ObjectMap;

type SpringTransitionProps = {
  rotation: SpringValue<number[]>;
  scale: SpringValue<number[]>;
};

// The installed @react-three/drei types dropped the legacy `multisample`
// FBO setting that this example still passes; widen the settings type
// locally instead of changing the values.
type FBOOptions = NonNullable<Parameters<typeof useFBO>[2]> & {
  multisample?: boolean;
};

const transitions = {
  from: { rotation: [0, -Math.PI / 10, 0], scale: [0.8, 0.8, 0.8] },
  enter: { rotation: [0, 0, 0], scale: [1, 1, 1] },
  leave: { rotation: [0, Math.PI / 10, 0], scale: [0.8, 0.8, 0.8] },
};

const sceneStyle = { width: "100vw", height: "56vw" };
const enter = transitions.enter;
const leave = transitions.leave;

// @react-spring/three's animated() wrapper computes a deeply recursive prop
// type for the generic `primitive` element that trips up the type checker
// ("Type instantiation is excessively deep"); widen the prop type locally
// instead of changing the values.
type AnimatedPrimitiveProps = ThreeElements["primitive"] &
  SpringTransitionProps;

const AnimatedPrimitive = a.primitive as unknown as (
  props: AnimatedPrimitiveProps,
) => JSX.Element;

type ModelProps = SpringTransitionProps & {
  model: ModelData;
};

function Model({ model, ...props }: ModelProps) {
  const ref = useRef<THREE.Group>(null!);
  const [rEuler, rQuaternion] = useMemo(
    () => [new THREE.Euler(), new THREE.Quaternion()],
    [],
  );
  useFrame((state) => {
    rEuler.set(
      0,
      (state.mouse.x * Math.PI) / 150,
      (-state.mouse.y * Math.PI) / 150,
    );
    ref.current.quaternion.slerp(rQuaternion.setFromEuler(rEuler), 0.1);
  });
  return (
    <group ref={ref}>
      <spotLight
        intensity={0.7 * Math.PI}
        decay={0}
        position={[8, 6, -4]}
        penumbra={0}
      />
      <AnimatedPrimitive {...props} object={model.scene} />
    </group>
  );
}

type RenderSceneProps = SpringTransitionProps & {
  target: THREE.WebGLRenderTarget;
  model: ModelData;
  camRef: RefObject<THREE.PerspectiveCamera>;
};

function RenderScene({ target, model, camRef, ...props }: RenderSceneProps) {
  const scene = useMemo(() => new THREE.Scene(), []);
  useFrame((state) => {
    state.gl.setRenderTarget(target);
    state.gl.render(scene, camRef.current);
  }, 0);
  return createPortal(<Model model={model} {...props} />, scene);
}

type ModelsProps = {
  shownIndex: number;
  models: string[];
};

function Models({ shownIndex, models }: ModelsProps) {
  const _models = useGLTF(models);
  const [idxesInScenes] = useState([
    shownIndex,
    (shownIndex + 1) % models.length,
  ]);
  const hiddenTxt = useRef(1);
  const shownTxt = useMemo(() => {
    if (idxesInScenes.indexOf(shownIndex) < 0)
      idxesInScenes[hiddenTxt.current] = shownIndex;
    const idx = idxesInScenes.indexOf(shownIndex);
    hiddenTxt.current = idx ? 0 : 1;
    return idx;
  }, [shownIndex, idxesInScenes]);

  const t0 = useFBO({ stencilBuffer: false, multisample: true } as FBOOptions);
  const t1 = useFBO({ stencilBuffer: false, multisample: true } as FBOOptions);
  const targets = [t0, t1];
  const camRef = useRef<THREE.PerspectiveCamera>(null!);

  useFrame((state) => {
    state.gl.setRenderTarget(null);
    state.gl.render(state.scene, state.camera);
  }, 1);

  const [springs, api] = useSprings(
    2,
    (i) => transitions[i === 0 ? "enter" : "from"],
  );
  const regress = useThree((state) => state.performance.regress);

  useEffect(() => {
    api.start((i) => {
      const isEntering = i === shownTxt;
      const t = isEntering ? enter : leave;
      return { ...t, onChange: () => regress() };
    });
  }, [api, shownTxt, regress]);

  return (
    <>
      <PerspectiveCamera
        ref={camRef}
        position={[-2.71, 1.34, 1.8]}
        rotation={[-0.74, -1.14, -0.7]}
        far={9}
        fov={37.1}
      />
      <ScreenQuad>
        <CrossFadeMaterial
          attach="material"
          texture1={t0.texture}
          texture2={t1.texture}
          shownTxt={shownTxt}
        />
      </ScreenQuad>
      {springs.map((props, i) => (
        <RenderScene
          key={i}
          target={targets[i]}
          model={_models[idxesInScenes[i]]}
          camRef={camRef}
          {...props}
        />
      ))}
    </>
  );
}

type SceneProps = {
  models: string[];
  shownIndex?: number;
  target: RefObject<HTMLDivElement>;
};

export function Scene({ models, shownIndex = 0, target }: SceneProps) {
  return (
    <Canvas
      orthographic
      gl={{ antialias: false }}
      eventSource={target.current}
      style={sceneStyle}
    >
      <Models shownIndex={shownIndex} models={models} />
    </Canvas>
  );
}
