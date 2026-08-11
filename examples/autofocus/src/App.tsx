import {
  AccumulativeShadows,
  CameraControls,
  Center,
  Environment,
  RandomizedLight,
  Resize,
  useGLTF,
} from "@react-three/drei";
import { Canvas, type ThreeElements } from "@react-three/fiber";
import {
  Autofocus,
  type AutofocusApi,
  EffectComposer,
} from "@react-three/postprocessing";
import { button, folder, useControls } from "leva";
import { memo, useRef } from "react";
import { suspend } from "suspend-react";
import * as THREE from "three";
import { type GLTF } from "three-stdlib";

const city = import("@pmndrs/assets/hdri/city.exr");
const suzi = import("@pmndrs/assets/models/suzi.glb");

export default function App() {
  return (
    <Canvas shadows camera={{ position: [-15, 1.2, 14], fov: 15 }}>
      <color attach="background" args={["#303035"]} />
      <Scene />
    </Canvas>
  );
}

function Scene() {
  const autofocusRef = useRef<AutofocusApi>(null);

  const { manual, ...autofocusConfig } = useControls({
    target: { value: [-1, 1, 0.6], optional: true, disabled: true },
    mouse: false,
    debug: { value: 0.02, min: 0, max: 0.15, optional: true },
    smoothTime: { value: 0.5, min: 0, max: 1 },
    manual: false,
    "update (manual only)": button(() => {
      autofocusRef.current?.update(0, true);
    }),
    DepthOfField: folder(
      {
        focusRange: { min: 0, max: 0.05, value: 0.005, step: 0.001 },
        bokehScale: { min: 0, max: 50, value: 8 },
      },
      { collapsed: true },
    ),
  });

  return (
    <group position-y={-0.5} position-x={-1}>
      <Center top>
        <Resize scale={3.5}>
          <Suzi rotation={[-0.63, 0, 0]}>
            <meshStandardMaterial color="#9d4b4b" />
          </Suzi>
        </Resize>
      </Center>
      <Center top position={[-3.5, 0, 4]}>
        <mesh castShadow>
          <sphereGeometry args={[0.5, 64, 64]} />
          <meshStandardMaterial color="#9d4b4b" />
        </mesh>
      </Center>
      <Center top position={[2.5, 0, 1]}>
        <mesh castShadow rotation={[0, Math.PI / 4, 0]}>
          <boxGeometry args={[0.7, 0.7, 0.7]} />
          <meshStandardMaterial color="#9d4b4b" />
        </mesh>
      </Center>

      <EffectComposer>
        {/* AutofocusProps intersects DepthOfField's own inherited `ref` (Ref<DepthOfFieldEffect>)
            with its own `ref?: Ref<AutofocusApi>`, which TS can't reconcile into one assignable type. */}
        <Autofocus
          ref={autofocusRef as never}
          manual={manual}
          {...autofocusConfig}
        />
      </EffectComposer>

      <Shadows />
      <CameraControls />
      <Environment files={(suspend(city) as { default: string }).default} />
    </group>
  );
}

const Shadows = memo(() => (
  <AccumulativeShadows
    temporal
    frames={100}
    color="#9d4b4b"
    colorBlend={0.5}
    alphaTest={0.9}
    scale={20}
  >
    <RandomizedLight amount={8} radius={4} position={[5, 5, -10]} />
  </AccumulativeShadows>
));

type GLTFResult = GLTF & {
  nodes: { mesh: THREE.Mesh };
};

function Suzi(props: ThreeElements["mesh"]) {
  const { nodes } = useGLTF(
    (suspend(suzi) as { default: string }).default,
  ) as unknown as GLTFResult;
  return (
    <mesh castShadow receiveShadow geometry={nodes.mesh.geometry} {...props} />
  );
}
