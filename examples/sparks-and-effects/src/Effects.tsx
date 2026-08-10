import { useCallback, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { type Effect } from "postprocessing";
import { WaterEffect } from "./WaterEffect";

function AnimatedWaterEffect() {
  const effect = useRef<Effect | null>(null);
  const waterTime = useRef(0);
  const setEffect = useCallback((value: Effect | null) => {
    effect.current = value;
  }, []);

  useFrame(() => {
    const time = effect.current?.uniforms.get("waterTime");
    if (time) time.value = waterTime.current;
    waterTime.current += 0.05;
  });

  return <WaterEffect ref={setEffect} factor={1.5} />;
}

export default function Effects() {
  return (
    <EffectComposer multisampling={0}>
      <AnimatedWaterEffect />
      <Bloom
        mipmapBlur
        intensity={7}
        luminanceThreshold={0}
        luminanceSmoothing={0.01}
        radius={0.95}
        levels={6}
      />
      <Bloom
        mipmapBlur
        intensity={4}
        luminanceThreshold={0}
        luminanceSmoothing={0.01}
        radius={0.95}
        levels={9}
      />
    </EffectComposer>
  );
}
