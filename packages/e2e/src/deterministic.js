import seedrandom from "seedrandom";

const sayCheeseParam = new URLSearchParams(window.location.search).has(
  "saycheese"
);
if (sayCheeseParam) {
  seedrandom("hello.", { global: true });

  var style = document.createElement("style");
  style.innerHTML = `
  canvas[data-engine] {
    animation: none !important;
    transition: none !important;

    opacity: 1!important;
  }
`;
  document.head.appendChild(style);
}
