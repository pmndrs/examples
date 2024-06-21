const randomVector = (r) => [r / 2 - Math.random() * r, r / 2 - Math.random() * r, r / 2 - Math.random() * r]
const randomEuler = () => [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI]
const data = Array.from({ length: 1000 }, (r = 10) => ({ random: Math.random(), position: randomVector(r), rotation: randomEuler() }))

export { data }
