// Each overlay is drawn for one blend function. The effect drops the
// texture's own alpha, so transparency has to come from the blend instead:
// black leaves the scene untouched under SCREEN, white under MULTIPLY.

function createRandom(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function drawLensDirt(ctx: CanvasRenderingContext2D) {
  const { width: w, height: h } = ctx.canvas;
  const unit = Math.min(w, h);
  const random = createRandom(3);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w, h);

  // Soft smudges.
  for (let i = 0; i < 70; i++) {
    const x = random() * w;
    const y = random() * h;
    const r = unit * (0.02 + random() * 0.12);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(255, 245, 230, ${0.04 + random() * 0.1})`);
    g.addColorStop(1, "rgba(255, 245, 230, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  // Wiped streaks.
  ctx.filter = `blur(${unit * 0.006}px)`;
  ctx.lineCap = "round";
  for (let i = 0; i < 6; i++) {
    const x = random() * w;
    const y = random() * h;
    const angle = random() * Math.PI;
    const length = unit * (0.15 + random() * 0.3);
    ctx.strokeStyle = `rgba(255, 250, 240, ${0.08 + random() * 0.08})`;
    ctx.lineWidth = unit * (0.01 + random() * 0.02);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(
      x + Math.cos(angle) * length * 0.5 + (random() - 0.5) * length * 0.4,
      y + Math.sin(angle) * length * 0.5 + (random() - 0.5) * length * 0.4,
      x + Math.cos(angle) * length,
      y + Math.sin(angle) * length,
    );
    ctx.stroke();
  }
  ctx.filter = "none";

  // Dust specks.
  for (let i = 0; i < 160; i++) {
    ctx.fillStyle = `rgba(255, 255, 255, ${0.2 + random() * 0.5})`;
    ctx.beginPath();
    ctx.arc(
      random() * w,
      random() * h,
      unit * (0.0008 + random() * 0.002),
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
}

export function drawScope(ctx: CanvasRenderingContext2D) {
  const { width: w, height: h } = ctx.canvas;
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(w, h) * 0.44;

  const lens = ctx.createRadialGradient(cx, cy, r * 0.9, cx, cy, r);
  lens.addColorStop(0, "#fff");
  lens.addColorStop(1, "#000");
  ctx.fillStyle = lens;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = "#000";
  // Thick posts from the rim, thin hairlines across the center.
  ctx.lineWidth = r * 0.025;
  for (const [dx, dy] of [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ]) {
    ctx.beginPath();
    ctx.moveTo(cx + dx * r, cy + dy * r);
    ctx.lineTo(cx + dx * r * 0.45, cy + dy * r * 0.45);
    ctx.stroke();
  }
  ctx.lineWidth = r * 0.004;
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.45, cy);
  ctx.lineTo(cx + r * 0.45, cy);
  ctx.moveTo(cx, cy - r * 0.45);
  ctx.lineTo(cx, cy + r * 0.45);
  ctx.stroke();

  ctx.fillStyle = "#000";
  for (let i = 1; i <= 4; i++) {
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      ctx.beginPath();
      ctx.arc(
        cx + dx * i * r * 0.09,
        cy + dy * i * r * 0.09,
        r * 0.008,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }
}

const COMPASS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

const HEADING = 312;

export function drawHelmet(ctx: CanvasRenderingContext2D) {
  const { width: w, height: h } = ctx.canvas;
  const unit = Math.min(w, h);
  const cx = w / 2;
  const cy = h / 2;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w, h);

  // The visor's rim, catching light at the edges.
  const rim = ctx.createRadialGradient(
    cx,
    cy,
    unit * 0.45,
    cx,
    cy,
    Math.hypot(w, h) * 0.55,
  );
  rim.addColorStop(0, "rgba(90, 150, 210, 0)");
  rim.addColorStop(1, "rgba(90, 150, 210, 0.55)");
  ctx.fillStyle = rim;
  ctx.fillRect(0, 0, w, h);

  const cyan = "rgba(110, 255, 230, 0.9)";
  ctx.strokeStyle = cyan;
  ctx.fillStyle = cyan;
  ctx.lineWidth = Math.max(1, unit * 0.002);
  ctx.font = `${Math.round(unit * 0.022)}px monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Reticle.
  const reticle = unit * 0.05;
  ctx.beginPath();
  ctx.arc(cx, cy, reticle, 0, Math.PI * 2);
  for (const a of [0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2]) {
    ctx.moveTo(
      cx + Math.cos(a) * reticle * 0.6,
      cy + Math.sin(a) * reticle * 0.6,
    );
    ctx.lineTo(
      cx + Math.cos(a) * reticle * 1.4,
      cy + Math.sin(a) * reticle * 1.4,
    );
  }
  ctx.stroke();

  // Heading tape.
  const tapeY = h * 0.1;
  const tapeWidth = unit * 0.6;
  const pxPerDegree = tapeWidth / 90;
  ctx.save();
  ctx.beginPath();
  ctx.rect(cx - tapeWidth / 2, tapeY - unit * 0.05, tapeWidth, unit * 0.1);
  ctx.clip();
  const first = Math.floor((HEADING - 45) / 5) * 5;
  for (let deg = first; deg <= HEADING + 45; deg += 5) {
    const x = cx + (deg - HEADING) * pxPerDegree;
    const major = deg % 45 === 0;
    ctx.beginPath();
    ctx.moveTo(x, tapeY);
    ctx.lineTo(x, tapeY + unit * (major ? 0.025 : 0.012));
    ctx.stroke();
    if (major) {
      const index = (((deg / 45) % 8) + 8) % 8;
      ctx.fillText(COMPASS[index], x, tapeY - unit * 0.02);
    }
  }
  ctx.restore();
  ctx.beginPath();
  ctx.moveTo(cx, tapeY + unit * 0.035);
  ctx.lineTo(cx - unit * 0.01, tapeY + unit * 0.05);
  ctx.lineTo(cx + unit * 0.01, tapeY + unit * 0.05);
  ctx.closePath();
  ctx.fill();
  ctx.fillText(String(HEADING), cx, tapeY + unit * 0.075);

  // Readouts.
  ctx.textAlign = "left";
  const left = w * 0.08;
  ctx.fillText("RNG 34000 KM", left, h * 0.78);
  ctx.fillText("O2  97%", left, h * 0.82);
  ctx.fillText("PWR 88%", left, h * 0.86);
  ctx.textAlign = "right";
  const right = w * 0.92;
  ctx.fillText("SUIT  NOMINAL", right, h * 0.78);
  ctx.fillText("COMMS LINKED", right, h * 0.82);
  ctx.fillText("TEMP  -42 C", right, h * 0.86);
}
