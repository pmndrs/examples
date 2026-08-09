// Public assets need the example's base path when mounted by the examples site.
const baseUrl = import.meta.env.BASE_URL.replace(/\/?$/, "/");

const state = {
  top: 0,
  pages: 0,
  threshold: 4,
  mouse: [0, 0],
  content: [
    {
      tag: "00",
      text: `The Bacchic\nand Dionysiac\nRites`,
      images: ["BH41NVu.jpg", "fBoIJLX.jpg", "04zTfWB.jpg"].map(
        (image) => `${baseUrl}images/${image}`,
      ),
    },
    {
      tag: "01",
      text: `The Elysian\nMysteries`,
      images: ["c4cA8UN.jpg", "ajQ73ol.jpg", "gZOmLNU.jpg"].map(
        (image) => `${baseUrl}images/${image}`,
      ),
    },
    {
      tag: "02",
      text: `The Hiramic\nLegend`,
      images: ["mbFIW1b.jpg", "mlDUVig.jpg", "gwuZrgo.jpg"].map(
        (image) => `${baseUrl}images/${image}`,
      ),
    },
  ],
  depthbox: [
    {
      depth: 0,
      color: "#cccccc",
      textColor: "#ffffff",
      text: "In a void,\nno one could say\nwhy a thing\nonce set in motion\nshould stop anywhere.",
      image: `${baseUrl}images/cAKwexj.jpg`,
    },
    {
      depth: -5,
      textColor: "#272727",
      text: "For why should it stop\nhere rather than here?\nSo that a thing\nwill either be at rest\nor must be moved\nad infinitum.",
      image: `${baseUrl}images/04zTfWB.jpg`,
    },
  ],
  lines: [
    {
      points: [
        [-20, 0, 0],
        [-9, 0, 0],
      ],
      color: "black",
      lineWidth: 0.5,
    },
    {
      points: [
        [20, 0, 0],
        [9, 0, 0],
      ],
      color: "black",
      lineWidth: 0.5,
    },
  ],
};

export default state;
