import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import {
  EffectComposer,
  Select,
  Selection,
  SelectiveBloom,
} from "@react-three/postprocessing";
import { useControls } from "leva";
import { useRef, useState } from "react";
import * as THREE from "three";

type ScatterItem = {
  position: [number, number, number];
  dimColor: string;
  glowColor: string;
  geometry: "icosahedron" | "box" | "octahedron" | "cone";
};

const scatter: ScatterItem[] = [
  {
    position: [-3.6, 1.2, -1],
    dimColor: "#5a6a78",
    glowColor: "#4d9de0",
    geometry: "icosahedron",
  },
  {
    position: [3.4, -0.9, -1.6],
    dimColor: "#5c5666",
    glowColor: "#7768ae",
    geometry: "box",
  },
  {
    position: [-2.3, -1.7, 1.2],
    dimColor: "#6b4f4f",
    glowColor: "#e15554",
    geometry: "octahedron",
  },
  {
    position: [2.7, 1.7, 0.6],
    dimColor: "#4a5f52",
    glowColor: "#3bb273",
    geometry: "cone",
  },
  {
    position: [0.2, -2.0, -2.2],
    dimColor: "#6b6350",
    glowColor: "#e1b12c",
    geometry: "icosahedron",
  },
  {
    position: [-4, -0.3, 1.6],
    dimColor: "#5f5266",
    glowColor: "#c86bfa",
    geometry: "box",
  },
];

function ScatterObject({
  position,
  dimColor,
  glowColor,
  geometry,
}: ScatterItem) {
  const [hovered, setHovered] = useState(false);

  return (
    <Select enabled={hovered}>
      <mesh
        position={position}
        castShadow
        receiveShadow
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        {geometry === "icosahedron" && <icosahedronGeometry args={[0.6, 0]} />}
        {geometry === "box" && <boxGeometry args={[0.9, 0.9, 0.9]} />}
        {geometry === "octahedron" && <octahedronGeometry args={[0.7, 0]} />}
        {geometry === "cone" && <coneGeometry args={[0.6, 1.1, 32]} />}
        <meshStandardMaterial
          color={hovered ? glowColor : dimColor}
          roughness={0.4}
          metalness={0.2}
        />
      </mesh>
    </Select>
  );
}

function HoverGlowSphere() {
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const active = hovered || clicked;

  return (
    <Select enabled={active}>
      <mesh
        position={[2.1, 0, 1.6]}
        castShadow
        receiveShadow
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          setClicked((v) => !v);
        }}
      >
        <sphereGeometry args={[0.85, 32, 32]} />
        <meshStandardMaterial
          color={active ? "#ffd23f" : "#8a8a8a"}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
    </Select>
  );
}

function GlowTorusKnot({ forcedOn }: { forcedOn: boolean }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Select enabled={forcedOn || hovered}>
      <mesh
        position={[-0.4, 0.3, 0]}
        castShadow
        receiveShadow
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <torusKnotGeometry args={[0.9, 0.28, 128, 32]} />
        <meshStandardMaterial
          color={forcedOn || hovered ? "#ff5470" : "#6b4a52"}
          roughness={0.25}
          metalness={0.3}
        />
      </mesh>
    </Select>
  );
}

export default function App() {
  const light = useRef<THREE.DirectionalLight>(null!);

  const {
    torusGlow,
    intensity,
    luminanceThreshold,
    luminanceSmoothing,
    mipmapBlur,
    radius,
    inverted,
  } = useControls("Postprocessing - SelectiveBloom", {
    torusGlow: { value: true, label: "torus always glows" },
    intensity: { value: 3, min: 0, max: 10, step: 0.1 },
    luminanceThreshold: { value: 0, min: 0, max: 1, step: 0.01 },
    luminanceSmoothing: { value: 0.2, min: 0, max: 1, step: 0.01 },
    mipmapBlur: { value: true },
    radius: { value: 0.8, min: 0, max: 1, step: 0.01 },
    inverted: { value: false, label: "invert selection" },
  });

  return (
    <>
      <div
        style={{
          position: "absolute",
          bottom: 24,
          left: 0,
          width: "100%",
          textAlign: "center",
          color: "#8a8a90",
          fontSize: 16,
          pointerEvents: "none",
          zIndex: 10,
        }}
      >
        hover the shapes to bloom them
      </div>
      <Canvas shadows camera={{ position: [0, 1.2, 9], fov: 50 }}>
        <color attach="background" args={["#0c0c10"]} />
        <ambientLight intensity={0.35 * Math.PI} />
        <directionalLight
          ref={light}
          position={[4, 6, 5]}
          intensity={0.6 * Math.PI}
          castShadow
        />

        <mesh
          position={[0, -2.6, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <circleGeometry args={[8, 64]} />
          <meshStandardMaterial color="#17171c" roughness={0.9} />
        </mesh>

        <Selection>
          {scatter.map((item, i) => (
            <ScatterObject key={i} {...item} />
          ))}

          <GlowTorusKnot forcedOn={torusGlow} />

          <HoverGlowSphere />

          <EffectComposer>
            <SelectiveBloom
              lights={[light]}
              intensity={intensity}
              luminanceThreshold={luminanceThreshold}
              luminanceSmoothing={luminanceSmoothing}
              mipmapBlur={mipmapBlur}
              radius={radius}
              inverted={inverted}
            />
          </EffectComposer>
        </Selection>

        <OrbitControls autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </>
  );
}
