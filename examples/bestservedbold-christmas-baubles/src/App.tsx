import * as THREE from "three";
import { useRef } from "react";
import { type GLTF } from "three-stdlib";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, useGLTF } from "@react-three/drei";
import { EffectComposer, N8AO } from "@react-three/postprocessing";
import {
  BallCollider,
  Physics,
  RigidBody,
  CylinderCollider,
  type RapierRigidBody,
  type RigidBodyProps,
} from "@react-three/rapier";

import capModel from "./cap.glb?url";
import adamsbridgeHdr from "./adamsbridge.hdr?url";

type GLTFResult = GLTF & {
  nodes: { Mesh_1: THREE.Mesh };
};

// `legacyMode` was removed from @types/three; kept to match upstream source
(THREE.ColorManagement as unknown as { legacyMode: boolean }).legacyMode =
  false;
const baubleMaterial = new THREE.MeshLambertMaterial({
  color: "#c0a0a0",
  emissive: "red",
});
const capMaterial = new THREE.MeshStandardMaterial({
  metalness: 0.75,
  roughness: 0.15,
  color: "#8a492f",
  emissive: "#600000",
  envMapIntensity: 20,
});
const sphereGeometry = new THREE.SphereGeometry(1, 28, 28);
const baubles = [...Array(50)].map(() => ({
  scale: [0.75, 0.75, 1, 1, 1.25][Math.floor(Math.random() * 5)],
}));

function Bauble({
  vec = new THREE.Vector3(),
  scale,
  r = THREE.MathUtils.randFloatSpread,
}: {
  vec?: THREE.Vector3;
  scale: number;
  r?: (range: number) => number;
}) {
  const { nodes } = useGLTF(capModel) as unknown as GLTFResult;
  const api = useRef<RapierRigidBody>(null!);
  useFrame((state, delta) => {
    delta = Math.min(0.1, delta);
    api.current.applyImpulse(
      vec
        .copy(api.current.translation())
        .normalize()
        .multiply({
          x: -50 * delta * scale,
          y: -150 * delta * scale,
          z: -50 * delta * scale,
        }),
      false,
    );
  });
  const rigidBodyProps = {
    linearDamping: 0.75,
    angularDamping: 0.15,
    friction: 0.2,
    position: [r(20), r(20) - 25, r(20) - 10],
    ref: api,
    colliders: false,
    // `dispose` is no longer part of RigidBodyProps in this version; kept as-is
    // (unknown, then narrowed) to match the upstream source verbatim.
    dispose: null,
  } as unknown as RigidBodyProps;
  return (
    <RigidBody {...rigidBodyProps}>
      <BallCollider args={[scale]} />
      <CylinderCollider
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 0, 1.2 * scale]}
        args={[0.15 * scale, 0.275 * scale]}
      />
      <mesh
        castShadow
        receiveShadow
        scale={scale}
        geometry={sphereGeometry}
        material={baubleMaterial}
      />
      <mesh
        castShadow
        scale={2.5 * scale}
        position={[0, 0, -1.8 * scale]}
        geometry={nodes.Mesh_1.geometry}
        material={capMaterial}
      />
    </RigidBody>
  );
}

function Pointer({ vec = new THREE.Vector3() }: { vec?: THREE.Vector3 }) {
  const ref = useRef<RapierRigidBody>(null!);
  useFrame(({ mouse, viewport }) => {
    vec.lerp(
      {
        x: (mouse.x * viewport.width) / 2,
        y: (mouse.y * viewport.height) / 2,
        z: 0,
      },
      0.2,
    );
    ref.current?.setNextKinematicTranslation(vec);
  });
  return (
    <RigidBody
      position={[100, 100, 100]}
      type="kinematicPosition"
      colliders={false}
      ref={ref}
    >
      <BallCollider args={[2]} />
    </RigidBody>
  );
}

export const App = () => (
  <Canvas
    shadows
    gl={{ alpha: true, stencil: false, depth: false, antialias: false }}
    camera={{ position: [0, 0, 20], fov: 32.5, near: 1, far: 100 }}
    onCreated={(state) => (state.gl.toneMappingExposure = 1.5)}
  >
    <ambientLight intensity={Math.PI} />
    <spotLight
      position={[20, 20, 25]}
      intensity={Math.PI}
      decay={0}
      penumbra={1}
      angle={0.2}
      color="white"
      castShadow
      shadow-mapSize={[512, 512]}
    />
    <directionalLight position={[0, 5, -4]} intensity={4 * Math.PI} />
    <directionalLight
      position={[0, -15, -0]}
      intensity={4 * Math.PI}
      color="red"
    />
    <Physics gravity={[0, 0, 0]}>
      <Pointer />
      {
        baubles.map((props, i) => <Bauble key={i} {...props} />) /* prettier-ignore */
      }
    </Physics>
    <Environment files={adamsbridgeHdr} />
    {/* `disableNormalPass` no longer exists in this postprocessing version; the normal pass is already disabled by default */}
    <EffectComposer>
      <N8AO color="red" aoRadius={2} intensity={1} />
    </EffectComposer>
  </Canvas>
);
