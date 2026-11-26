(function () {
  const SEQUENCE = "miette";
  let buffer = "";

  document.addEventListener("keydown", (e) => {
    if (e.key.length !== 1) return;

    buffer = (buffer + e.key).slice(-SEQUENCE.length);
    if (buffer !== SEQUENCE) return;

    buffer = "";

    const sound = new Audio("assets/audio/vine-boom.mp3");
    sound.play();
    sound.volume = 0.25;

    const overlay = document.createElement("div");
    overlay.style.cssText = `
            position: fixed;
            inset: 0;
            z-index: 99999;
            background: #000 url('assets/miette.jpg') center/100% 100% no-repeat;
            animation: miette-fade 1s ease forwards;
        `;

    const style = document.createElement("style");
    style.textContent = `
            @keyframes miette-fade {
                0%   { opacity: 1; }
                100% { opacity: 0; }
            }
        `;
    document.head.appendChild(style);
    document.body.appendChild(overlay);

    setTimeout(() => {
      overlay.remove();
      style.remove();
    }, 1000);
  });
})();
