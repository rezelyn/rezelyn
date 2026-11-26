import { rand } from "./utils.js";

const NEBULA_PALETTE = [
  "90,20,160",  // violet
  "10,50,180",  // deep blue
  "5,110,120",  // teal
  "140,15,100", // magenta-purple
  "20,40,140",  // indigo
  "160,40,10",  // ember
  "10,100,80",  // seafoam
];

function mkNebulas() {
  const palette = NEBULA_PALETTE.slice().sort(() => Math.random() - 0.5);
  return Array.from({ length: 5 }, (_, i) => ({
    cx: rand(0.08, 0.92),
    cy: rand(0.05, 0.92),
    rx: rand(0.18, 0.34),
    ry: rand(0.12, 0.24),
    rgb: palette[i % palette.length],
    opPhase: rand(0, Math.PI * 2),
    opSpeed: rand(0.002, 0.006),
    dxPhase: rand(0, Math.PI * 2),
    dxSpeed: rand(0.0008, 0.002),
    dyPhase: rand(0, Math.PI * 2),
    dySpeed: rand(0.0006, 0.0015),
    canvas: null,
    screenCx: 0,
    screenCy: 0,
    r: 0,
  }));
}

const NEBULAS = mkNebulas();

function renderNebulaCanvas(n, w, h) {
  n.screenCx = n.cx * w;
  n.screenCy = n.cy * h;
  const rx = n.rx * w;
  const ry = n.ry * h;
  n.r = Math.max(rx, ry);
  const size = Math.ceil(n.r * 2) + 2;
  if (!n.canvas) n.canvas = document.createElement("canvas");
  n.canvas.width = n.canvas.height = size;
  const nc = n.canvas.getContext("2d");
  const half = size / 2;
  nc.clearRect(0, 0, size, size);
  nc.save();
  nc.translate(half, half);
  nc.scale(rx / n.r, ry / n.r);
  const grad = nc.createRadialGradient(0, 0, 0, 0, 0, n.r);
  grad.addColorStop(0,    `rgba(${n.rgb},0.07)`);
  grad.addColorStop(0.45, `rgba(${n.rgb},0.022)`);
  grad.addColorStop(1,    `rgba(${n.rgb},0)`);
  nc.fillStyle = grad;
  nc.fillRect(-n.r, -n.r, n.r * 2, n.r * 2);
  nc.restore();
}

export function resizeNebulas(w, h) {
  for (const n of NEBULAS) renderNebulaCanvas(n, w, h);
}

export function drawNebulas(ctx, width, height, starsAlpha) {
  if (!NEBULAS[0].canvas) resizeNebulas(width, height);
  for (const n of NEBULAS) {
    n.opPhase += n.opSpeed;
    n.dxPhase += n.dxSpeed;
    n.dyPhase += n.dySpeed;
    const driftAmp = n.r * 0.012;
    const dx = Math.sin(n.dxPhase) * driftAmp;
    const dy = Math.sin(n.dyPhase) * driftAmp;
    const opMod = 0.82 + 0.18 * Math.sin(n.opPhase);
    ctx.globalAlpha = opMod * starsAlpha;
    const half = n.canvas.width / 2;
    ctx.drawImage(n.canvas, Math.round(n.screenCx + dx - half), Math.round(n.screenCy + dy - half));
  }
  ctx.globalAlpha = 1;
}
