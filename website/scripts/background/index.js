import {
  mkParticle,
  mkParticleBack,
  mkParticleFront,
  tickBack,
  tickMid,
  tickFront,
} from "./particles.js";
import { drawStars } from "./stars.js";
import { drawNebulas, resizeNebulas } from "./nebulas.js";
import { tickShooters } from "./shooters.js";
import { tickSupernovas } from "./supernovas.js";

const background = document.getElementById("background");
const backgroundBack = document.getElementById("background-back");
const backgroundFront = document.getElementById("background-front");
const ctx = background.getContext("2d");
const ctx2 = backgroundBack.getContext("2d");
const ctx3 = backgroundFront.getContext("2d");

let width,
  height,
  mx = -999,
  my = -999;

function resize() {
  width =
    background.width =
    backgroundBack.width =
    backgroundFront.width =
      innerWidth;
  height =
    background.height =
    backgroundBack.height =
    backgroundFront.height =
      innerHeight;
  resizeNebulas(width, height);
}
resize();
window.addEventListener("resize", resize);
document.addEventListener("mousemove", (e) => {
  mx = e.clientX;
  my = e.clientY;
});
document.addEventListener("mouseleave", () => {
  mx = my = -999;
});

const isInitiallyLight = document.documentElement.dataset.theme === "light";
let crossfadeT = isInitiallyLight ? 1 : 0;
let starsAlpha = isInitiallyLight ? 0 : 1;
let crossfadeTarget = crossfadeT;
let starsTarget = starsAlpha;

window.particlesAlpha = 1;
let particlesAlphaTarget = 1;

window.startParticleTransition = function (toLightMode) {
  crossfadeTarget = toLightMode ? 1 : 0;
  starsTarget = toLightMode ? 0 : 1;
};

window.setParticlesVisible = function (visible) {
  particlesAlphaTarget = visible ? 1 : 0;
};

const particlesBack = Array.from({ length: 120 }, () =>
  mkParticleBack(false, width, height),
);
const particles = Array.from({ length: 90 }, () =>
  mkParticle(false, width, height),
);
const particlesFront = Array.from({ length: 16 }, () =>
  mkParticleFront(false, width, height),
);

function tick() {
  crossfadeT += (crossfadeTarget - crossfadeT) * 0.035;
  if (Math.abs(crossfadeT - crossfadeTarget) < 0.002)
    crossfadeT = crossfadeTarget;
  starsAlpha += (starsTarget - starsAlpha) * 0.06;
  if (Math.abs(starsAlpha - starsTarget) < 0.002) starsAlpha = starsTarget;
  window.particlesAlpha += (particlesAlphaTarget - window.particlesAlpha) * 0.04;
  if (Math.abs(window.particlesAlpha - particlesAlphaTarget) < 0.002)
    window.particlesAlpha = particlesAlphaTarget;

  ctx2.clearRect(0, 0, width, height);
  tickBack(particlesBack, ctx2, mx, my, width, height, crossfadeT);

  ctx.clearRect(0, 0, width, height);
  if (starsAlpha > 0.01) {
    drawNebulas(ctx, width, height, starsAlpha);
    drawStars(ctx, width, height, starsAlpha);
    tickShooters(ctx, width, height, starsAlpha);
    tickSupernovas(ctx, width, height, starsAlpha);
  }
  tickMid(particles, ctx, mx, my, width, height, crossfadeT);

  ctx3.clearRect(0, 0, width, height);
  tickFront(particlesFront, ctx3, mx, my, width, height, crossfadeT);

  requestAnimationFrame(tick);
}
tick();
