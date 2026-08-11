import { useControls } from "leva";

export default function Lights() {
  const { color } = useControls("Scene", { color: "#ff0000" });

  return (
    <>
      <spotLight
        shadow-mapSize={[2048, 2048]}
        distance={30}
        angle={0.4}
        penumbra={0.3}
        castShadow
        color={color}
        position={[0, 0, -10]}
        intensity={4 * Math.PI}
      />
      <pointLight
        color={color}
        position={[0, 1, -10]}
        intensity={0.3 * 4 * Math.PI}
      />
      <spotLight
        position={[0, 1, 3]}
        intensity={0.4 * 4 * Math.PI}
        distance={10}
        color="blue"
      />
      <directionalLight position={[0, 0, 0]} intensity={0.1 * Math.PI} />
    </>
  );
}
