const randomVector = (r: number): [number, number, number] => [
  r / 2 - Math.random() * r,
  r / 2 - Math.random() * r,
  r / 2 - Math.random() * r,
];
const randomEuler = (): [number, number, number] => [
  Math.random() * Math.PI,
  Math.random() * Math.PI,
  Math.random() * Math.PI,
];
const data = Array.from({ length: 1000 }, (r: number = 10) => ({
  random: Math.random(),
  position: randomVector(r),
  rotation: randomEuler(),
}));

export { data };
