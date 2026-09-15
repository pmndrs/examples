import {
  CameraControls,
  PivotControls,
  useCubeCamera,
  useGLTF,
} from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { button, useControls } from "leva";
import { easing } from "maath";
import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  Matrix4,
  MeshBasicMaterial,
  type Mesh,
  type Object3D,
  type SkinnedMesh,
  Vector3,
} from "three";
import { CCDIKHelper, CCDIKSolver, type IKS } from "three-stdlib";
import kiraUrl from "./kira.glb?url";

// Indices into `Kira_Shirt_left.skeleton.bones` -- see the joint list of the glb.
const iks = [
  {
    target: 22, // "target_hand_l"
    effector: 6, // "hand_l"
    links: [
      {
        index: 5, // "lowerarm_l"
        rotationMin: new Vector3(1.2, -1.8, -0.4),
        rotationMax: new Vector3(1.7, -1.1, 0.3),
      },
      {
        index: 4, // "Upperarm_l"
        rotationMin: new Vector3(0.1, -0.7, -1.8),
        rotationMax: new Vector3(1.1, 0, -1.4),
      },
    ],
  },
  // CCDIKSolver fills in `iteration`, `minAngle`, `maxAngle` and `links[].enabled`,
  // but its typings declare them as required.
] as unknown as IKS[];

const v0 = new Vector3();
const v1 = new Vector3();

export default function Scene() {
  const camera = useThree((state) => state.camera);
  const { scene, nodes } = useGLTF(kiraUrl);

  const sphere = nodes.boule as Mesh;
  const head = nodes.head as Object3D;
  const hand = nodes.hand_l as Object3D;
  const targetHand = nodes.target_hand_l as Object3D;
  const kira = nodes.Kira_Shirt_left as SkinnedMesh;

  const { restPosition, solver, helper } = useMemo(() => {
    scene.updateMatrixWorld(true);

    // Where the camera looks at start -- the sphere's resting place, before it is picked up.
    const restPosition = sphere.getWorldPosition(new Vector3());

    // From now on the sphere rides in the character's hand.
    hand.attach(sphere);

    // CCDIKSolver walks the skinned mesh's own subtree, so the root bone has to live under it.
    kira.add(kira.skeleton.bones[0]);

    return {
      restPosition,
      solver: new CCDIKSolver(kira, iks),
      helper: new CCDIKHelper(kira, iks, 0.01),
    };
  }, [scene, sphere, hand, kira]);

  // Mirror sphere: a cube camera sitting inside the sphere, re-rendering the room around it.
  // 256 rather than the 1024 the three.js original uses -- six extra passes a frame is
  // what this costs, and the ball is never more than a few hundred pixels wide.
  const {
    fbo,
    camera: cubeCamera,
    update: updateCubeCamera,
  } = useCubeCamera({ resolution: 256, near: 0.05, far: 50 });

  useEffect(() => {
    const previousMaterial = sphere.material;
    const mirrorMaterial = new MeshBasicMaterial({ envMap: fbo.texture });
    sphere.material = mirrorMaterial;

    return () => {
      sphere.material = previousMaterial;
      mirrorMaterial.dispose();
    };
  }, [sphere, fbo]);

  const updateIK = useCallback(() => {
    solver.update();

    // The bones moved, so the bounding spheres used for frustum culling are stale.
    scene.traverse((object) => {
      const skinnedMesh = object as SkinnedMesh;
      if (skinnedMesh.isSkinnedMesh) skinnedMesh.computeBoundingSphere();
    });
  }, [solver, scene]);

  // leva's `button` captures its callback once, so hand it a ref instead.
  const updateIKRef = useRef(updateIK);
  updateIKRef.current = updateIK;

  const { followSphere, turnHead, ikAutoUpdate } = useControls({
    followSphere: { value: false, label: "follow sphere" },
    turnHead: { value: true, label: "turn head" },
    ikAutoUpdate: { value: true, label: "IK auto update" },
    "IK manual update()": button(() => updateIKRef.current()),
  });

  const cameraControls = useRef<CameraControls>(null);

  // The gizmo drives the IK target rather than wrapping it: the bone has to stay
  // in the skeleton. `PivotControls` owns this matrix and writes the drag into it.
  const pivotMatrix = useMemo(
    () => new Matrix4().setPosition(targetHand.getWorldPosition(new Vector3())),
    [targetHand],
  );

  // `setLookAt` rather than `setTarget`, which would carry the camera along with
  // the target and lose the position the <Canvas> was given.
  useEffect(() => {
    cameraControls.current?.setLookAt(
      camera.position.x,
      camera.position.y,
      camera.position.z,
      restPosition.x,
      restPosition.y,
      restPosition.z,
      false,
    );
  }, [camera, restPosition]);

  useFrame((_state, delta) => {
    // The sphere must not see itself.
    sphere.visible = false;
    sphere.getWorldPosition(cubeCamera.position);
    updateCubeCamera();
    sphere.visible = true;

    if (followSphere && cameraControls.current) {
      sphere.getWorldPosition(v0);
      cameraControls.current.getTarget(v1);
      easing.damp3(v1, v0, 0.25, delta);
      cameraControls.current.setTarget(v1.x, v1.y, v1.z, false);
    }

    if (turnHead) {
      sphere.getWorldPosition(v0);
      head.lookAt(v0);
      // `lookAt` points the bone's +z at the ball, and the face looks the other
      // way down -z, so turn it around.
      head.rotation.set(
        head.rotation.x,
        head.rotation.y + Math.PI,
        head.rotation.z,
      );
    }

    if (ikAutoUpdate) updateIK();
  });

  return (
    <>
      <primitive object={scene} />
      <primitive object={helper} />

      <CameraControls
        makeDefault
        ref={cameraControls}
        minDistance={0.2}
        maxDistance={1.5}
      />

      {/* `makeDefault` above is what lets this disable the camera while dragging. */}
      <PivotControls
        matrix={pivotMatrix}
        activeAxes={[false, true, true]}
        disableSliders
        disableRotations
        disableScaling
        depthTest={false}
        fixed
        scale={100}
        lineWidth={3}
        onDrag={(_local, _deltaLocal, world) => {
          v0.setFromMatrixPosition(world);
          targetHand.parent?.worldToLocal(v0);
          targetHand.position.copy(v0);
        }}
      />
    </>
  );
}

useGLTF.preload(kiraUrl);
