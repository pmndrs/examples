// Intensities are pi-scaled: the original sandbox predates three r155's physically correct lights
export default function Lights() {
  return (
    <>
      <hemisphereLight
        args={[0xffffff, 0xffffff, Math.PI]}
        color={0x7095c1}
        position={[0, 50, 0]}
        groundColor={0xcbc1b2}
      />
      <directionalLight
        position={[100, 200, 100]}
        intensity={Math.PI}
        castShadow
        shadow-mapSize={[4096, 4096]}
        shadow-camera-left={-22}
        shadow-camera-bottom={-22}
        shadow-camera-right={22}
        shadow-camera-top={22}
      />
    </>
  );
}
