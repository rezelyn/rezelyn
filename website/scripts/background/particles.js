import { rand } from "./utils.js";

const SNOWFLAKES = Array.from({ length: 4 }, (_, n) => {
  const image = new Image();
  image.src = `assets/snowflakes/${n + 1}.png`;
  return image;
});

const LEAVES = Array.from({ length: 12 }, (_, n) => {
  const image = new Image();
  image.src = `assets/leaves/${n}.png`;
  return image;
});

function drawParticle(f, ctx, crossfadeT) {
  const pAlpha = window.particlesAlpha ?? 1;
  if (pAlpha < 0.001) return;
  const size = 16 * f.scale;
  const cos = Math.cos(f.angle);
  const sin = Math.sin(f.angle);
  if (crossfadeT < 0.999) {
    ctx.globalAlpha = f.op * (1 - crossfadeT) * pAlpha;
    ctx.setTransform(cos, sin, -sin, cos, f.x, f.y);
    ctx.drawImage(
      SNOWFLAKES[f.spriteIndex % SNOWFLAKES.length],
      -size / 2,
      -size / 2,
      size,
      size,
    );
  }
  if (crossfadeT > 0.001) {
    ctx.globalAlpha = f.op * crossfadeT * pAlpha;
    ctx.setTransform(cos, sin, -sin, cos, f.x, f.y);
    ctx.drawImage(
      LEAVES[f.spriteIndex % LEAVES.length],
      -size / 2,
      -size / 2,
      size,
      size,
    );
  }
}

export function mkParticle(fresh, width, height) {
  return {
    x: rand(0, width),
    y: fresh ? rand(-60, -4) : rand(0, height),
    spriteIndex: Math.floor(rand(0, 12)),
    scale: rand(0.3, 1.1),
    vx: rand(-0.2, 0.2),
    vy: rand(0.25, 0.7),
    op: rand(0.15, 1.0),
    angle: rand(0, Math.PI * 2),
    spin: rand(-0.015, 0.015),
    w1: rand(0, Math.PI * 2),
    w1s: rand(0.008, 0.022),
    w1a: rand(0.06, 0.18),
    w2: rand(0, Math.PI * 2),
    w2s: rand(0.018, 0.045),
    w2a: rand(0.02, 0.08),
    spinJitter: 0,
    spinJitterTimer: Math.floor(rand(40, 120)),
  };
}

export function mkParticleBack(fresh, width, height) {
  return {
    x: rand(0, width),
    y: fresh ? rand(-40, -2) : rand(0, height),
    spriteIndex: Math.floor(rand(0, 12)),
    scale: rand(0.1, 0.5),
    vx: rand(-0.12, 0.12),
    vy: rand(0.1, 0.35),
    op: rand(0.08, 0.55),
    angle: rand(0, Math.PI * 2),
    spin: rand(-0.01, 0.01),
    w1: rand(0, Math.PI * 2),
    w1s: rand(0.006, 0.016),
    w1a: rand(0.03, 0.1),
    w2: rand(0, Math.PI * 2),
    w2s: rand(0.012, 0.03),
    w2a: rand(0.01, 0.05),
    spinJitter: 0,
    spinJitterTimer: Math.floor(rand(60, 160)),
  };
}

export function mkParticleFront(fresh, width, height) {
  return {
    x: rand(0, width),
    y: fresh ? rand(-100, -8) : rand(0, height),
    spriteIndex: Math.floor(rand(0, 12)),
    scale: rand(0.9, 1.8),
    vx: rand(-0.3, 0.3),
    vy: rand(0.35, 0.9),
    op: rand(0.1, 0.5),
    angle: rand(0, Math.PI * 2),
    spin: rand(-0.02, 0.02),
    w1: rand(0, Math.PI * 2),
    w1s: rand(0.01, 0.025),
    w1a: rand(0.08, 0.22),
    w2: rand(0, Math.PI * 2),
    w2s: rand(0.02, 0.05),
    w2a: rand(0.03, 0.1),
    spinJitter: 0,
    spinJitterTimer: Math.floor(rand(30, 100)),
  };
}

export function tickBack(particles, ctx, mx, my, width, height, crossfadeT) {
  ctx.imageSmoothingEnabled = false;
  for (const f of particles) {
    const dx = f.x - mx,
      dy = f.y - my;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (window.vacuumMode) {
      if (d < 8) {
        Object.assign(f, mkParticleBack(true, width, height));
        continue;
      }
      if (d < 900 && d > 0) {
        const force = (1 - d / 900) * 0.08;
        f.vx -= (dx / d) * force;
        f.vy -= (dy / d) * force;
      }
    } else {
      if (d < 40 && d > 0) {
        const force = (1 - d / 40) * 0.04;
        f.vx += (dx / d) * force;
        f.vy += (dy / d) * force;
      }
    }
    f.vx *= 0.97;
    f.vy = f.vy * 0.98 + rand(0.1, 0.35) * 0.02;
    const wobbleX = Math.sin(f.w1) * f.w1a + Math.sin(f.w2) * f.w2a;
    f.x += f.vx + wobbleX;
    f.y += f.vy;
    f.w1 += f.w1s;
    f.w2 += f.w2s;
    f.spinJitterTimer--;
    if (f.spinJitterTimer <= 0) {
      f.spinJitter = rand(-0.005, 0.005);
      f.spinJitterTimer = Math.floor(rand(60, 180));
    }
    f.angle += f.spin + f.spinJitter;
    if (f.y > height + 20 || f.x < -30 || f.x > width + 30)
      Object.assign(f, mkParticleBack(true, width, height));
    drawParticle(f, ctx, crossfadeT);
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
}

export function tickMid(particles, ctx, mx, my, width, height, crossfadeT) {
  ctx.imageSmoothingEnabled = false;
  for (const f of particles) {
    const dx = f.x - mx,
      dy = f.y - my;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (window.vacuumMode) {
      if (d < 12) {
        Object.assign(f, mkParticle(true, width, height));
        continue;
      }
      if (d < 1200 && d > 0) {
        const force = (1 - d / 1200) * 0.15;
        f.vx -= (dx / d) * force;
        f.vy -= (dy / d) * force;
      }
    } else {
      if (d < 55 && d > 0) {
        const force = (1 - d / 55) * 0.07;
        f.vx += (dx / d) * force;
        f.vy += (dy / d) * force;
      }
    }
    f.vx *= 0.97;
    f.vy = f.vy * 0.98 + rand(0.25, 0.7) * 0.02;
    const wobbleX = Math.sin(f.w1) * f.w1a + Math.sin(f.w2) * f.w2a;
    f.x += f.vx + wobbleX;
    f.y += f.vy;
    f.w1 += f.w1s;
    f.w2 += f.w2s;
    f.spinJitterTimer--;
    if (f.spinJitterTimer <= 0) {
      f.spinJitter = rand(-0.008, 0.008);
      f.spinJitterTimer = Math.floor(rand(40, 140));
    }
    f.angle += f.spin + f.spinJitter;
    if (f.y > height + 20 || f.x < -40 || f.x > width + 40)
      Object.assign(f, mkParticle(true, width, height));
    drawParticle(f, ctx, crossfadeT);
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
}

export function tickFront(particles, ctx, mx, my, width, height, crossfadeT) {
  ctx.imageSmoothingEnabled = false;
  for (const f of particles) {
    const dx = f.x - mx,
      dy = f.y - my;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (window.vacuumMode) {
      if (d < 16) {
        Object.assign(f, mkParticleFront(true, width, height));
        continue;
      }
      if (d < 1400 && d > 0) {
        const force = (1 - d / 1400) * 0.22;
        f.vx -= (dx / d) * force;
        f.vy -= (dy / d) * force;
      }
    } else {
      if (d < 80 && d > 0) {
        const force = (1 - d / 80) * 0.12;
        f.vx += (dx / d) * force;
        f.vy += (dy / d) * force;
      }
    }
    f.vx *= 0.97;
    f.vy = f.vy * 0.98 + rand(0.35, 0.9) * 0.02;
    const wobbleX = Math.sin(f.w1) * f.w1a + Math.sin(f.w2) * f.w2a;
    f.x += f.vx + wobbleX;
    f.y += f.vy;
    f.w1 += f.w1s;
    f.w2 += f.w2s;
    f.spinJitterTimer--;
    if (f.spinJitterTimer <= 0) {
      f.spinJitter = rand(-0.012, 0.012);
      f.spinJitterTimer = Math.floor(rand(30, 100));
    }
    f.angle += f.spin + f.spinJitter;
    if (f.y > height + 60 || f.x < -80 || f.x > width + 80)
      Object.assign(f, mkParticleFront(true, width, height));
    drawParticle(f, ctx, crossfadeT);
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
}
