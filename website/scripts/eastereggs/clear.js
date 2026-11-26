(function () {
  const SEQUENCE = "clear";
  let buffer = "";
  let hidden = false;
  const sndOn = new Audio("assets/audio/on.wav");
  const sndOff = new Audio("assets/audio/off.wav");

  document.addEventListener("keydown", (e) => {
    if (e.key.length !== 1) return;
    buffer = (buffer + e.key).slice(-SEQUENCE.length);
    if (buffer !== SEQUENCE) return;
    buffer = "";
    hidden = !hidden;
    const snd = (hidden ? sndOff : sndOn).cloneNode();
    snd.volume = 0.05;
    snd.play().catch(() => {});
    window.setParticlesVisible?.(!hidden);
  });
})();
