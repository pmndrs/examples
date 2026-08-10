import * as THREE from "three";
import React, { useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import {
  GLTFLoader,
  type GLTF,
} from "three/examples/jsm/loaders/GLTFLoader.js";
import useStore, { type Data } from "../store";

import rockModel from "./rock.gltf?url";

type GLTFResult = GLTF & {
  nodes: {
    node_id4_Material_52_0: THREE.Mesh;
  };
  materials: {
    Material_52: THREE.MeshStandardMaterial;
  };
};

export default function Rocks() {
  const gltf = useLoader(GLTFLoader, rockModel) as unknown as GLTFResult;
  const rocks = useStore((state) => state.rocks);
  return rocks.map((data) => <Rock {...gltf} key={data.guid} data={data} />);
}

const Rock = React.memo(
  ({
    nodes,
    materials,
    data,
  }: Pick<GLTFResult, "nodes" | "materials"> & { data: Data }) => {
    const ref = useRef<THREE.Group>(null!);
    const { clock } = useStore((state) => state.mutation);
    useFrame(() => {
      const r = Math.cos((clock.getElapsedTime() / 2) * data.speed) * Math.PI;
      ref.current.rotation.set(r, r, r);
    });
    return (
      <group
        ref={ref}
        position={data.offset}
        scale={[data.scale, data.scale, data.scale]}
      >
        <group
          position={[
            -0.016298329457640648, -0.012838120572268963, 0.24073271453380585,
          ]}
          rotation={[
            3.0093872578726644, 0.27444228385461117, -0.22745113653772078,
          ]}
          scale={[20, 20, 20]}
        >
          <mesh
            geometry={nodes.node_id4_Material_52_0.geometry}
            material={materials.Material_52}
            material-roughness={1}
            material-metalness={1}
          />
        </group>
      </group>
    );
  },
);
