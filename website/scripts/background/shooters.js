import { rand } from "./utils.js";

const SHOOTERS = [];

function mkShooter(width, height) {
  const angle = rand(0.12, 0.42) * Math.PI;
  const speed = rand(1.2, 2.5);
  return {
    x: rand(-0.05, 0.85) * width,
    y: rand(0, 0.6) * height,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    life: 1,
    decay: rand(0.007, 0.013),
    trailLen: rand(160, 280),
  };
}

export function tickShooters(ctx, width, height, starsAlpha) {
  if (starsAlpha > 0.5 && SHOOTERS.length < 3 && Math.random() < 0.0008)
    SHOOTERS.push(mkShooter(width, height));

  for (let i = SHOOTERS.length - 1; i >= 0; i--) {
    const s = SHOOTERS[i];
    s.life -= s.decay;
    if (s.life <= 0 || s.x > width + 80 || s.y > height + 80) {
      SHOOTERS.splice(i, 1);
      continue;
    }
    const len = Math.hypot(s.vx, s.vy);
    const tx = s.x - (s.vx / len) * s.trailLen;
    const ty = s.y - (s.vy / len) * s.trailLen;
    const grad = ctx.createLinearGradient(tx, ty, s.x, s.y);
    grad.addColorStop(0, "rgba(210,225,255,0)");
    grad.addColorStop(
      1,
      `rgba(210,225,255,${(s.life * 0.45 * starsAlpha).toFixed(3)})`,
    );
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(s.x, s.y);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1;
    ctx.stroke();
    s.x += s.vx;
    s.y += s.vy;
  }
}
