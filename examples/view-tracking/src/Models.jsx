import { useState, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

// From the poimandres market (https://market.pmnd.rs/), vendored locally since the original CDN is offline.
import sodaModel from "./assets/soda-bottle.gltf?url";
import duckModel from "./assets/duck.gltf?url";
import candyModel from "./assets/candy-bucket.gltf?url";
import lightningModel from "./assets/lightning.gltf?url";
import appleModel from "./assets/apple-half.gltf?url";
import targetModel from "./assets/target-stand.gltf?url";

export function Soda(props) {
  const ref = useRef();
  const [hovered, spread] = useHover();
  const { nodes, materials } = useGLTF(sodaModel);
  useFrame((state, delta) => (ref.current.rotation.y += delta));
  return (
    <group ref={ref} {...props} {...spread} dispose={null}>
      <mesh geometry={nodes.Mesh_sodaBottle.geometry}>
        <meshStandardMaterial
          color={hovered ? "red" : "green"}
          roughness={0.33}
          metalness={0.8}
          envMapIntensity={2}
        />
      </mesh>
      <mesh
        geometry={nodes.Mesh_sodaBottle_1.geometry}
        material={materials.red}
        material-envMapIntensity={0}
      />
    </group>
  );
}

function useHover() {
  const [hovered, hover] = useState(false);
  return [
    hovered,
    { onPointerOver: (e) => hover(true), onPointerOut: () => hover(false) },
  ];
}

export function Duck(props) {
  const { scene } = useGLTF(duckModel);
  return <primitive object={scene} {...props} />;
}

export function Candy(props) {
  const { scene } = useGLTF(candyModel);
  useFrame((state, delta) => (scene.rotation.z = scene.rotation.y += delta));
  return <primitive object={scene} {...props} />;
}

export function Flash(props) {
  const { scene } = useGLTF(lightningModel);
  useFrame((state, delta) => (scene.rotation.y += delta));
  return <primitive object={scene} {...props} />;
}

export function Apple(props) {
  const { scene } = useGLTF(appleModel);
  useFrame((state, delta) => (scene.rotation.y += delta));
  return <primitive object={scene} {...props} />;
}

export function Target(props) {
  const { scene } = useGLTF(targetModel);
  useFrame((state, delta) => (scene.rotation.y += delta));
  return <primitive object={scene} {...props} />;
}
