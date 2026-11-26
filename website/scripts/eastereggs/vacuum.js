(function () {
  window.vacuumMode = false;

  let currentNotif = null;
  let currentNotifTimeout = null;

  function showNotif(text) {
    if (currentNotif) {
      clearTimeout(currentNotifTimeout);
      currentNotif.remove();
      currentNotif = null;
    }
    const isLight = document.documentElement.dataset.theme === "light";
    const el = document.createElement("div");
    el.textContent = text;
    el.style.cssText = `
      position: fixed;
      bottom: 30px;
      left: 50%;
      translate: -50% 0;
      z-index: 99998;
      background: transparent;
      color: ${isLight ? "#2a1a22" : "#fff"};
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8rem;
      padding: 8px 20px;
      pointer-events: none;
      opacity: 0;
      text-align: center;
      white-space: pre;
      transition: opacity 0.5s ease;
    `;
    document.body.appendChild(el);
    currentNotif = el;
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        el.style.opacity = "1";
      }),
    );
    currentNotifTimeout = setTimeout(() => {
      el.style.transition = "opacity 0.8s ease";
      el.style.opacity = "0";
      el.addEventListener("transitionend", () => {
        el.remove();
        if (currentNotif === el) currentNotif = null;
      });
    }, 1800);
  }

  const SEQUENCE = "vacuum";
  let buffer = "";
  const sndOn = new Audio("assets/audio/on.wav");
  const sndOff = new Audio("assets/audio/off.wav");
  document.addEventListener("keydown", (e) => {
    if (e.key.length !== 1) return;
    buffer = (buffer + e.key).slice(-SEQUENCE.length);
    if (buffer !== SEQUENCE) return;
    buffer = "";
    window.vacuumMode = !window.vacuumMode;
    const snd = (window.vacuumMode ? sndOn : sndOff).cloneNode();
    snd.volume = 0.05;
    snd.play().catch(() => {});
    if (!window.vacuumMode && window.vacuumFlakes && window.vacuumMkFlake)
      window.vacuumFlakes.forEach((f) =>
        Object.assign(f, window.vacuumMkFlake(false)),
      );
    showNotif(window.vacuumMode ? "vacuum mode on" : "vacuum mode off");
  });
})();
