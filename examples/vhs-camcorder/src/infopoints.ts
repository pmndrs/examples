export type Vec3 = [number, number, number];

export type Infopoint = {
  title: string;
  text: string;
  anchor: Vec3;
  position: Vec3;
  lookAt: Vec3;
  fov: number;
};

// The camcorder's lens points toward -z, the viewfinder is on its left (-x) and the microphone on its right.
export const infopoints: Infopoint[] = [
  {
    title: "Lens",
    text: "A 6:1 power zoom from 9 to 54 mm, with macro and auto iris. Two small motors drive zoom and focus, and slip clutches let you turn the rings by hand. Behind it sits a 1/2-inch CCD.",
    anchor: [-0.08, -0.12, -0.6],
    position: [0.35, -0.02, -1.35],
    lookAt: [-0.08, -0.12, -0.5],
    fov: 30,
  },
  {
    title: "Viewfinder",
    text: "A 2/3-inch electronic viewfinder on a swivel mount: a tiny CRT seen through a mirror and a magnifying lens, with the recording lights inside its frame.",
    anchor: [-0.27, 0.23, -0.12],
    position: [-0.75, 0.45, 0.45],
    lookAt: [-0.26, 0.17, -0.1],
    fov: 30,
  },
  {
    title: "Microphone",
    text: "A mono microphone on the right side records the single audio track, from 80 Hz to 8 kHz. Audio could be dubbed over afterwards, a feature borrowed from broadcast gear.",
    anchor: [0.11, 0.2, -0.24],
    position: [0.75, 0.4, -0.75],
    lookAt: [0.1, 0.15, -0.22],
    fov: 30,
  },
  {
    title: "Full-size VHS",
    text: "One of the first camcorders to record straight onto full-size VHS, and the first with VHS HQ: the tape went from the camera into any home VCR. Up to 240 minutes on an E-240 cassette, on four rotary heads.",
    anchor: [-0.13, 0, 0.25],
    position: [-1.1, 0.15, 0.55],
    lookAt: [-0.1, -0.02, 0.25],
    fov: 32,
  },
  {
    title: "Controls",
    text: "Power, manual tracking and the tape transport sit on top. Autofocus, white balance, shutter speed and the date are on the left side, along with fade to black.",
    anchor: [0.1, 0.25, 0.4],
    position: [-0.55, 0.85, 0.45],
    lookAt: [0.1, 0.23, 0.4],
    fov: 30,
  },
  {
    title: "Power",
    text: "It runs on 12 V from a 2.2 Ah lead-acid battery pack at the back, a car lighter or the AC adaptor, which could also send the picture straight to a TV. 2.5 kg without the battery, sold from 1986 to 1988.",
    anchor: [0.05, 0, 0.63],
    position: [0.45, 0.25, 1.45],
    lookAt: [0.05, 0, 0.55],
    fov: 32,
  },
];
