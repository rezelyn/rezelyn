let themeTransitioning = false;

function toggleTheme() {
  if (themeTransitioning) return;
  themeTransitioning = true;

  const btn = document.querySelector(".theme-toggle");
  const rect = btn.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  const maxR = Math.hypot(
    Math.max(x, innerWidth - x),
    Math.max(y, innerHeight - y),
  );

  const html = document.documentElement;
  const next = html.dataset.theme === "dark" ? "light" : "dark";

  const oldTheme = html.dataset.theme;
  const oldBg = getComputedStyle(html).getPropertyValue("--bg").trim();

  function paintOldBg() {
    if (oldTheme === "light") {
      const grad = oct.createLinearGradient(0, 0, 0, oc.height);
      grad.addColorStop(0, "#bdd8ee");
      grad.addColorStop(0.45, "#f4cdef");
      grad.addColorStop(0.8, "#e8d0da");
      grad.addColorStop(1, "#ead4dc");
      oct.fillStyle = grad;
    } else {
      oct.fillStyle = oldBg;
    }
    oct.fillRect(0, 0, oc.width, oc.height);
  }

  html.classList.add("transitioning");
  html.dataset.theme = next;
  if (window.startParticleTransition)
    window.startParticleTransition(next === "light");

  const bgCanvas = document.getElementById("background");

  const oc = document.createElement("canvas");
  oc.width = innerWidth;
  oc.height = innerHeight;
  oc.style.cssText =
    "position:fixed;inset:0;pointer-events:none;z-index:99999;";
  document.body.appendChild(oc);
  const oct = oc.getContext("2d");

  const start = performance.now();
  const DURATION = 500;

  function frame(now) {
    const t = Math.min(1, (now - start) / DURATION);
    const e = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    const r = maxR * e;

    oct.clearRect(0, 0, oc.width, oc.height);
    paintOldBg();
    oct.drawImage(document.getElementById("background-back"), 0, 0);
    oct.drawImage(bgCanvas, 0, 0);
    oct.drawImage(document.getElementById("background-front"), 0, 0);
    oct.save();
    oct.globalCompositeOperation = "destination-out";
    oct.beginPath();
    oct.arc(x, y, r, 0, Math.PI * 2);
    oct.fill();
    oct.restore();

    if (t < 1) {
      requestAnimationFrame(frame);
    } else {
      oc.remove();
      html.classList.remove("transitioning");
      themeTransitioning = false;
    }
  }

  requestAnimationFrame(frame);
}
