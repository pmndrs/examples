import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Center,
  Text3D,
  OrbitControls,
  useMatcapTexture,
  Environment,
} from "@react-three/drei";
import { useControls } from "leva";

function TextScene() {
  const { text, size, height, bevel, bevelSize } = useControls({
    text: "Hello",
    size: { value: 1, min: 0.1, max: 3, step: 0.1 },
    height: { value: 0.3, min: 0.05, max: 1, step: 0.05, label: "depth" },
    bevel: { value: true, label: "bevel" },
    bevelSize: { value: 0.02, min: 0, max: 0.1, step: 0.005 },
  });

  const [matcap] = useMatcapTexture("CB4E88_F99AD6_F384C3_ED75B9");

  return (
    <Center>
      <Text3D
        font="/Inter_Bold.json"
        size={size}
        height={height}
        bevelEnabled={bevel}
        bevelSize={bevelSize}
        bevelThickness={0.01}
        bevelSegments={5}
        curveSegments={12}
        letterSpacing={0.02}
      >
        {text}
        <meshMatcapMaterial matcap={matcap} />
      </Text3D>
    </Center>
  );
}

export default function App() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
      <Suspense fallback={null}>
        <TextScene />
      </Suspense>
      <Environment preset="city" />
      <OrbitControls makeDefault />
    </Canvas>
  );
}
