import { rand } from "./utils.js";

export const STAR_PALETTE = [
  { color: "#b0c8ff", rgb: "176,200,255" },
  { color: "#d0e0ff", rgb: "208,224,255" },
  { color: "#eef2ff", rgb: "238,242,255" },
  { color: "#ffffff", rgb: "255,255,255" },
  { color: "#fffce8", rgb: "255,252,232" },
  { color: "#fff4b0", rgb: "255,244,176" },
  { color: "#ffd878", rgb: "255,216,120" },
];

const PALETTE_WEIGHTS = [0.1, 0.18, 0.2, 0.25, 0.14, 0.08, 0.05];

export function pickStarEntry() {
  let r = Math.random(),
    cum = 0;
  for (let i = 0; i < PALETTE_WEIGHTS.length; i++) {
    cum += PALETTE_WEIGHTS[i];
    if (r < cum) return STAR_PALETTE[i];
  }
  return STAR_PALETTE[3];
}

function mkStarGlowCanvas(rgb) {
  const gc = document.createElement("canvas");
  gc.width = gc.height = 20;
  const gctx = gc.getContext("2d");
  const grad = gctx.createRadialGradient(10, 10, 0, 10, 10, 9);
  grad.addColorStop(0, `rgba(${rgb},0.35)`);
  grad.addColorStop(1, `rgba(${rgb},0)`);
  gctx.fillStyle = grad;
  gctx.fillRect(0, 0, 20, 20);
  return gc;
}

export const STARS = Array.from({ length: 260 }, () => {
  const sr = Math.random();
  const size = sr < 0.72 ? 1 : sr < 0.93 ? 2 : 3;
  const entry = pickStarEntry();
  return {
    x: Math.random(),
    y: Math.random(),
    phase: Math.random() * Math.PI * 2,
    speed: rand(0.003, 0.018),
    baseOp:
      size === 1
        ? rand(0.15, 0.65)
        : size === 2
          ? rand(0.3, 0.8)
          : rand(0.55, 0.95),
    color: entry.color,
    rgb: entry.rgb,
    size,
    glowCanvas: size === 3 ? mkStarGlowCanvas(entry.rgb) : null,
  };
});

export function drawStars(ctx, width, height, starsAlpha) {
  for (const s of STARS) s.phase += s.speed;

  // glow pass
  for (const s of STARS) {
    if (!s.glowCanvas) continue;
    const alpha = Math.max(
      0,
      (s.baseOp + Math.sin(s.phase) * 0.28) * starsAlpha,
    );
    if (alpha < 0.01) continue;
    ctx.globalAlpha = alpha;
    ctx.drawImage(
      s.glowCanvas,
      Math.round(s.x * width) - 9,
      Math.round(s.y * height) - 9,
    );
  }

  // core pass
  for (const s of STARS) {
    ctx.globalAlpha = Math.max(
      0,
      (s.baseOp + Math.sin(s.phase) * 0.28) * starsAlpha,
    );
    ctx.fillStyle = s.color;
    ctx.fillRect(
      Math.round(s.x * width),
      Math.round(s.y * height),
      s.size,
      s.size,
    );
  }
  ctx.globalAlpha = 1;
}
