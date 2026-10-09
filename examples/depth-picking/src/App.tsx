import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  DepthPicking,
  EffectComposer,
  useDepthPicking,
  type DepthPickingApi,
} from "@react-three/postprocessing";
import { button, useControls } from "leva";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Decorations } from "./Decorations";
import {
  randomLandPoint,
  Terrain,
  terrainHeightAt,
  terrainNormalAt,
  Water,
} from "./Terrain";
import { Trees, type TreeData, type TreeKind } from "./Trees";

const MAX_TREES = 200;
const INITIAL_TREES = 24;
const FOLIAGE: Record<TreeKind, string[]> = {
  pine: ["#2f6b3a", "#3c7d45", "#28593a"],
  round: ["#6fae3f", "#8cbf4a", "#a8c94f", "#d9a441"],
};
const SKY = "#cde6f5";
// How far above the terrain a hit may be and still count as ground - beyond
// that, the pick landed on a tree, a rock or the lake.
const GROUND_TOLERANCE = 0.25;
const UP = new THREE.Vector3(0, 1, 0);

let nextId = 0;

function createTree(
  position: THREE.Vector3,
  kind: TreeKind = Math.random() < 0.6 ? "pine" : "round",
): TreeData {
  const colors = FOLIAGE[kind];
  return {
    id: nextId++,
    kind,
    position,
    normal: terrainNormalAt(position.x, position.z, new THREE.Vector3()),
    scale: 0.8 + Math.random() * 0.7,
    rotation: Math.random() * Math.PI * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
  };
}

function initialTrees() {
  return Array.from({ length: INITIAL_TREES }, () =>
    createTree(randomLandPoint(36)),
  );
}

function Picker({ onPlant }: { onPlant: (position: THREE.Vector3) => void }) {
  const pass = useRef<DepthPickingApi>(null);
  const getHit = useDepthPicking(pass);
  const cursor = useRef<THREE.Group>(null);
  const normal = useRef(new THREE.Vector3());
  const gl = useThree((state) => state.gl);

  const picking = useRef(false);
  const plantRequested = useRef(false);

  // DepthPickingPass serves one read at a time - a second readDepth before
  // the first resolves silently drops the first. So every read goes through
  // this one loop, and a click only flags that the next read should plant.
  useFrame(({ pointer }) => {
    if (picking.current) return;
    picking.current = true;
    const plant = plantRequested.current;
    plantRequested.current = false;
    getHit(pointer.x, pointer.y).then((hit) => {
      picking.current = false;
      const onGround =
        hit && hit.y - terrainHeightAt(hit.x, hit.z) < GROUND_TOLERANCE;
      if (!cursor.current) return;
      cursor.current.visible = !!onGround;
      if (!onGround) return;
      cursor.current.position.copy(hit);
      cursor.current.quaternion.setFromUnitVectors(
        UP,
        terrainNormalAt(hit.x, hit.z, normal.current),
      );
      if (plant) onPlant(hit);
    });
  });

  // A click, not the end of an orbit drag.
  useEffect(() => {
    const canvas = gl.domElement;
    let down: { x: number; y: number } | null = null;
    const onPointerDown = (e: PointerEvent) => {
      down = { x: e.clientX, y: e.clientY };
    };
    const onPointerUp = (e: PointerEvent) => {
      if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) < 5) {
        plantRequested.current = true;
      }
      down = null;
    };
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointerup", onPointerUp);
    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointerup", onPointerUp);
    };
  }, [gl]);

  return (
    <>
      <EffectComposer>
        <DepthPicking ref={pass} />
      </EffectComposer>
      <group ref={cursor} visible={false}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.35, 0.5, 32]} />
          {/* Never write depth here - the next pick would land on the cursor
              itself and walk it towards the camera. */}
          <meshBasicMaterial
            color="#ffffff"
            depthWrite={false}
            depthTest={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </>
  );
}

export default function App() {
  const [trees, setTrees] = useState(initialTrees);

  const { tree } = useControls("Depth picking", {
    tree: { value: "random", options: ["random", "pine", "round"] },
    clear: button(() => setTrees([])),
  });

  const plant = useCallback(
    (position: THREE.Vector3) => {
      const kind = tree === "random" ? undefined : (tree as TreeKind);
      setTrees((trees) =>
        [...trees, createTree(position, kind)].slice(-MAX_TREES),
      );
    },
    [tree],
  );

  return (
    <Canvas shadows camera={{ position: [0, 14, 20], fov: 45 }}>
      <color attach="background" args={[SKY]} />
      <fog attach="fog" args={[SKY, 30, 60]} />
      <hemisphereLight args={["#d6ecff", "#6b7f45", 0.5 * Math.PI]} />
      <directionalLight
        position={[14, 16, 8]}
        intensity={1.1 * Math.PI}
        color="#fff1d6"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0005}
      >
        <orthographicCamera
          attach="shadow-camera"
          args={[-30, 30, 30, -30, 1, 60]}
        />
      </directionalLight>

      <Terrain />
      <Water />
      <Decorations />
      <Trees trees={trees} />
      <Picker onPlant={plant} />

      <OrbitControls maxPolarAngle={Math.PI / 2.3} maxDistance={40} />
    </Canvas>
  );
}
