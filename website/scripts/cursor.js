const cursor = document.querySelector(".cursor");
let mouseX = 0,
  mouseY = 0,
  currentX = 0,
  currentY = 0;

const trailCanvas = document.createElement("canvas");
trailCanvas.style.cssText =
  "position:fixed;top:0;left:0;pointer-events:none;z-index:9998;filter:blur(0.8px);";
document.body.appendChild(trailCanvas);
const trailCtx = trailCanvas.getContext("2d");

function resize() {
  trailCanvas.width = innerWidth;
  trailCanvas.height = innerHeight;
}
resize();
window.addEventListener("resize", resize);

const history = [];
const TRAIL_LIFE = 600;
const MAX_WIDTH = 7;
const ACCENT_DARK = [255, 255, 255];
const ACCENT_LIGHT = [240, 96, 144];
let accentR = ACCENT_DARK[0], accentG = ACCENT_DARK[1], accentB = ACCENT_DARK[2];

function targetAccent() {
  return document.documentElement.dataset.theme === "light" ? ACCENT_LIGHT : ACCENT_DARK;
}
function accentRGB() {
  return [Math.round(accentR), Math.round(accentG), Math.round(accentB)];
}
let trailVisible = false;
let cursorAlpha = 0;
let cursorAlphaTarget = 0;
let idleTimer = null;

function drawTrail(now) {
  trailCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);

  while (
    history.length > 0 &&
    now - history[history.length - 1].ts > TRAIL_LIFE
  )
    history.pop();

  if (history.length < 2) return;

  const [r, g, b] = accentRGB();
  const n = history.length;

  const nx = new Float32Array(n);
  const ny = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const prev = history[Math.max(0, i - 1)];
    const next = history[Math.min(n - 1, i + 1)];
    let dx = next.x - prev.x,
      dy = next.y - prev.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    nx[i] = -dy / len;
    ny[i] = dx / len;
  }
  const snx = new Float32Array(n);
  const sny = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    let ax = 0,
      ay = 0;
    for (let j = Math.max(0, i - 2); j <= Math.min(n - 1, i + 2); j++) {
      ax += nx[j];
      ay += ny[j];
    }
    const len = Math.sqrt(ax * ax + ay * ay) || 1;
    snx[i] = ax / len;
    sny[i] = ay / len;
  }

  const hw = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const fade = Math.max(0, 1 - (now - history[i].ts) / TRAIL_LIFE);
    hw[i] = (1 - t) * MAX_WIDTH * 0.5 * fade;
  }

  const head = history[0],
    tail = history[n - 1];
  const grad = trailCtx.createLinearGradient(head.x, head.y, tail.x, tail.y);
  grad.addColorStop(0, `rgba(${r},${g},${b},1.0)`);
  grad.addColorStop(1, `rgba(${r},${g},${b},0)`);

  trailCtx.beginPath();
  trailCtx.moveTo(head.x + snx[0] * hw[0], head.y + sny[0] * hw[0]);
  for (let i = 1; i < n; i++)
    trailCtx.lineTo(
      history[i].x + snx[i] * hw[i],
      history[i].y + sny[i] * hw[i],
    );
  for (let i = n - 1; i >= 0; i--)
    trailCtx.lineTo(
      history[i].x - snx[i] * hw[i],
      history[i].y - sny[i] * hw[i],
    );
  trailCtx.closePath();
  trailCtx.fillStyle = grad;
  trailCtx.fill();
}

function animate(now) {
  currentX += 0.12 * (mouseX - currentX);
  currentY += 0.12 * (mouseY - currentY);
  cursor.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;

  const [tr, tg, tb] = targetAccent();
  accentR += (tr - accentR) * 0.015;
  accentG += (tg - accentG) * 0.015;
  accentB += (tb - accentB) * 0.015;

  cursorAlpha += (cursorAlphaTarget - cursorAlpha) * 0.025;
  const alpha = Math.max(0, Math.min(1, cursorAlpha));
  cursor.style.opacity = alpha;
  trailCanvas.style.opacity = alpha;

  if (trailVisible) {
    const last = history[0];
    const dx = currentX - (last ? last.x : currentX);
    const dy = currentY - (last ? last.y : currentY);
    if (!last || dx * dx + dy * dy > 0.25) {
      history.unshift({ x: currentX, y: currentY, ts: now });
      if (history.length > 300) history.length = 300;
    }
  }

  drawTrail(now);
  requestAnimationFrame(animate);
}

function onPointerActivity(x, y) {
  mouseX = x;
  mouseY = y;
  trailVisible = true;
  cursorAlphaTarget = 1;
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    cursorAlphaTarget = 0;
    trailVisible = false;
  }, 100);
}

document.addEventListener("mousemove", (e) => {
  onPointerActivity(e.clientX, e.clientY);
});

document.addEventListener("touchmove", (e) => {
  const t = e.touches[0];
  onPointerActivity(t.clientX, t.clientY);
}, { passive: true });

document.addEventListener("touchstart", (e) => {
  const t = e.touches[0];
  currentX = t.clientX;
  currentY = t.clientY;
  onPointerActivity(t.clientX, t.clientY);
}, { passive: true });

document.documentElement.addEventListener("mouseleave", () => {
  trailVisible = false;
  cursorAlphaTarget = 0;
});

animate(performance.now());
