(function () {
  const HIDE = "eye";
  let buffer = "";
  let hidden = false;
  const sndOn = new Audio("assets/audio/on.wav");
  const sndOff = new Audio("assets/audio/off.wav");

  const QUOTES = [
    "I learned a lot, by the end of everything.",
    "This song is new to me, but I am honored to be a part of it.",
    "The future depends on the past, even if we don't get to see it.",
    "Come, sit with me, my fellow traveler. Let's sit together and watch the stars die.",
    "Every decision is made in darkness. Only by making a choice can we learn whether it was right or not.",
    "It's time for something new, now.",
  ];

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
    el.textContent = `“${text}”`;
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
      border-radius: 0px;
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
    }, 3500);
  }

  const targets = () => [
    document.querySelector(".cards"),
    document.querySelector(".audio-player"),
  ];

  function setHidden(yes) {
    hidden = yes;
    const isMobile = window.matchMedia("(pointer: coarse)").matches;
    for (const el of targets()) {
      if (!el) continue;
      el.style.transition = "opacity 0.7s ease";
      el.style.opacity = yes ? "0" : "1";
      el.style.pointerEvents = yes && !isMobile ? "none" : "";
    }
  }

  document.addEventListener("keydown", (e) => {
    if (e.key.length !== 1) return;
    buffer = (buffer + e.key).slice(-HIDE.length);
    if (buffer !== HIDE) return;
    buffer = "";
    const wasHidden = hidden;
    setHidden(!hidden);
    const snd = (hidden ? sndOff : sndOn).cloneNode();
    snd.volume = 0.05;
    snd.play().catch(() => {});
    if (!wasHidden) {
      showNotif(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    }
  });
})();
