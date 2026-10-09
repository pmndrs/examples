import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { CITY, createRandom, ROAD_CENTERS } from "./Town";

const LANE = 0.35;
const COLORS = [
  "#e63946",
  "#f1c40f",
  "#3498db",
  "#ffffff",
  "#2ecc71",
  "#ff8c42",
  "#9b59b6",
  "#1d3557",
];

type Car = {
  // Along x when true, along z otherwise.
  horizontal: boolean;
  lane: number;
  direction: 1 | -1;
  start: number;
  speed: number;
  color: string;
};

function generateCars(): Car[] {
  const random = createRandom(11);
  const cars: Car[] = [];
  for (const horizontal of [true, false]) {
    for (const center of ROAD_CENTERS) {
      for (const direction of [1, -1] as const) {
        const count = 1 + Math.floor(random() * 2);
        for (let k = 0; k < count; k++) {
          cars.push({
            horizontal,
            lane: center + direction * LANE * (horizontal ? 1 : -1),
            direction,
            start: random() * CITY,
            speed: 1.2 + random() * 1.2,
            color: COLORS[Math.floor(random() * COLORS.length)],
          });
        }
      }
    }
  }
  return cars;
}

export function Cars() {
  const cars = useMemo(generateCars, []);
  const bodies = useRef<THREE.InstancedMesh>(null!);
  const cabins = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useLayoutEffect(() => {
    const color = new THREE.Color();
    cars.forEach((car, i) =>
      bodies.current.setColorAt(i, color.set(car.color)),
    );
    bodies.current.instanceColor!.needsUpdate = true;
  }, [cars]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    cars.forEach((car, i) => {
      const along =
        THREE.MathUtils.euclideanModulo(
          car.start + car.direction * car.speed * t,
          CITY,
        ) -
        CITY / 2;
      const heading =
        (car.horizontal ? 0 : -Math.PI / 2) + (car.direction < 0 ? Math.PI : 0);

      if (car.horizontal) dummy.position.set(along, 0.12, car.lane);
      else dummy.position.set(car.lane, 0.12, along);
      dummy.rotation.set(0, heading, 0);
      dummy.updateMatrix();
      bodies.current.setMatrixAt(i, dummy.matrix);

      dummy.translateY(0.18);
      dummy.translateX(-0.05);
      dummy.updateMatrix();
      cabins.current.setMatrixAt(i, dummy.matrix);
    });
    bodies.current.instanceMatrix.needsUpdate = true;
    cabins.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh
        ref={bodies}
        args={[undefined, undefined, cars.length]}
        castShadow
      >
        <boxGeometry args={[0.6, 0.2, 0.3]} />
        <meshStandardMaterial flatShading />
      </instancedMesh>
      <instancedMesh
        ref={cabins}
        args={[undefined, undefined, cars.length]}
        castShadow
      >
        <boxGeometry args={[0.32, 0.16, 0.26]} />
        <meshStandardMaterial color="#cfd8e3" flatShading />
      </instancedMesh>
    </>
  );
}
