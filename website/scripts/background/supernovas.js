import { rand } from "./utils.js";
import { pickStarEntry } from "./stars.js";

const SUPERNOVAS = [];
const SN_PIXEL = 3;
const supernovaSound = new Audio("assets/audio/supernova.wav");
supernovaSound.volume = 0.05;

function mkSnParticle(ox, oy, rgb) {
  const angle = rand(0, Math.PI * 2);
  const speed = rand(0.04, 0.35);
  const [r, g, b] = rgb.split(",").map(Number);
  return {
    x: ox,
    y: oy,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    life: 1,
    decay: rand(0.0008, 0.002),
    r,
    g,
    b,
    size: SN_PIXEL,
  };
}

function mkSupernova(width, height) {
  const entry = pickStarEntry();
  return {
    x: Math.round(rand(0.1, 0.9) * width),
    y: Math.round(rand(0.05, 0.85) * height),
    phase: 0,
    flash: 0,
    glow: 0,
    glowFading: false,
    color: entry.color,
    rgb: entry.rgb,
    particles: [],
  };
}

export function tickSupernovas(ctx, width, height, starsAlpha) {
  if (starsAlpha > 0.8 && SUPERNOVAS.length === 0 && Math.random() < 0.00015)
    SUPERNOVAS.push(mkSupernova(width, height));

  for (let i = SUPERNOVAS.length - 1; i >= 0; i--) {
    const s = SUPERNOVAS[i];

    // "I learned a lot, by the end of everyting..."
    if (s.phase === 0) {
      s.flash += 0.025;
      if (s.flash >= 1) {
        s.flash = 1;
        s.phase = 1;
        s.glow = 1;
        supernovaSound.currentTime = 0;
        setTimeout(() => supernovaSound.play().catch(() => {}), 500);
        for (let p = 0; p < 55; p++)
          s.particles.push(mkSnParticle(s.x, s.y, s.rgb));
      }
      const sz = Math.round(s.flash * 7);
      ctx.globalAlpha = s.flash * 0.5 * starsAlpha;
      ctx.fillStyle = s.color;
      ctx.fillRect(s.x - sz, s.y - SN_PIXEL, sz * 2 + SN_PIXEL, SN_PIXEL);
      ctx.fillRect(s.x - SN_PIXEL, s.y - sz, SN_PIXEL, sz * 2 + SN_PIXEL);
      ctx.fillRect(s.x - SN_PIXEL, s.y - SN_PIXEL, SN_PIXEL * 3, SN_PIXEL * 3);
      ctx.globalAlpha = 1;
    } else if (s.phase === 1) {
      if (s.glow > 0) {
        s.glow = Math.max(0, s.glow - 0.0015);
        const glowR = 10 + (1 - s.glow) * 30;
        const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, glowR);
        grad.addColorStop(0, `rgba(${s.rgb},${(s.glow * 0.55 * starsAlpha).toFixed(3)})`);
        grad.addColorStop(1, `rgba(${s.rgb},0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(s.x - glowR, s.y - glowR, glowR * 2, glowR * 2);
      }

      let alive = false;
      for (const p of s.particles) {
        p.life -= p.decay;
        if (p.life <= 0) continue;
        alive = true;
        p.vx *= 0.997;
        p.vy *= 0.997;
        p.x += p.vx;
        p.y += p.vy;
        ctx.globalAlpha = p.life * 0.55 * starsAlpha;
        ctx.fillStyle = `rgb(${p.r},${p.g},${p.b})`;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
      }
      ctx.globalAlpha = 1;
      if (!alive && s.glow <= 0) SUPERNOVAS.splice(i, 1);
    }
  }
}
