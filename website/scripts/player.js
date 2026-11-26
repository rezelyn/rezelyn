(function () {
  const songs = {
    dark: [
      {
        title: "Space",
        artist: "Andrew Prahlow",
        src: "assets/audio/song/Space.mp3",
        startAt: 0,
      },
      {
        title: "Dead Voxel",
        artist: "C418",
        src: "assets/audio/song/Dead Voxel.mp3",
        startAt: 72,
      },
      {
        title: "Lost Girl",
        artist: "Toby Fox",
        src: "assets/audio/song/Lost Girl.mp3",
        startAt: 0,
      },
      {
        title: "River's End",
        artist: "Andrew Prahlow",
        src: "assets/audio/song/River's End.mp3",
        startAt: 0,
      },
      {
        title: "Travelers' Encore",
        artist: "Andrew Prahlow",
        src: "assets/audio/song/Travelers' Encore.mp3",
        startAt: 0,
      },
    ],
    light: [
      {
        title: "The Sound of Water",
        artist: "Andrew Prahlow",
        src: "assets/audio/song/The Sound of Water.mp3",
        startAt: 0,
      },
      {
        title: "City of Tears",
        artist: "Christopher Larkin",
        src: "assets/audio/song/City of Tears.mp3",
        startAt: 0,
      },
      {
        title: "Subwoofer Lullaby",
        artist: "C418",
        src: "assets/audio/song/Subwoofer Lullaby.mp3",
        startAt: 0,
      },
    ],
  };

  const player = document.querySelector(".audio-player");
  const title = player.querySelector(".ap-title");
  const artist = player.querySelector(".ap-artist");
  const playBtn = player.querySelector(".ap-play");
  const prevBtn = player.querySelector(".ap-prev");
  const nextBtn = player.querySelector(".ap-next");

  const audioA = new Audio();
  const audioB = new Audio();
  const TARGET_VOLUME = 0.05;
  const FADE_IN_DURATION = 1500;
  const FADE_OUT_DURATION = 600;
  const SWITCH_FADE_DURATION = 1000;
  let active = audioA;
  let inactive = audioB;
  let index = 0;
  let playlist = [];

  function currentTheme() {
    return document.documentElement.dataset.theme === "light"
      ? "light"
      : "dark";
  }

  function fadeTo(audioEl, targetVol, duration, onDone) {
    if (audioEl._fade) clearInterval(audioEl._fade);
    const diff = targetVol - audioEl.volume;
    if (diff === 0) {
      if (onDone) onDone();
      return;
    }
    const steps = 60;
    const step = diff / steps;
    const intervalMs = duration / steps;
    audioEl._fade = setInterval(() => {
      const next = audioEl.volume + step;
      if ((step > 0 && next >= targetVol) || (step < 0 && next <= targetVol)) {
        audioEl.volume = targetVol;
        clearInterval(audioEl._fade);
        audioEl._fade = null;
        if (onDone) onDone();
      } else {
        audioEl.volume = next;
      }
    }, intervalMs);
  }

  function updateUI(track) {
    title.innerHTML = `<span>${track.title}</span>`;
    artist.textContent = track.artist;
    title.classList.remove("scrolling");
    requestAnimationFrame(() => {
      const span = title.querySelector("span");
      const overflow = span.scrollWidth - title.clientWidth;
      if (overflow > 0) {
        title.style.setProperty("--ap-overflow", `-${overflow}px`);
        title.classList.add("scrolling");
      }
    });
  }

  function switchTrack(i, autoplay) {
    const track = playlist[i];
    updateUI(track);
    if (autoplay) {
      const incoming = inactive;
      incoming.src = track.src;
      incoming.volume = 0;
      if (track.startAt)
        incoming.addEventListener(
          "canplay",
          () => {
            incoming.currentTime = track.startAt;
          },
          { once: true },
        );
      incoming.play();
      fadeTo(incoming, TARGET_VOLUME, SWITCH_FADE_DURATION);
      const outgoing = active;
      fadeTo(outgoing, 0, SWITCH_FADE_DURATION, () => {
        outgoing.pause();
        outgoing.src = "";
      });
      active = incoming;
      inactive = outgoing;
    } else {
      active.src = track.src;
      active.volume = 0;
      if (track.startAt)
        active.addEventListener(
          "canplay",
          () => {
            active.currentTime = track.startAt;
          },
          { once: true },
        );
    }
  }

  function syncPlaylist(autoplay) {
    const theme = currentTheme();
    const newPlaylist = songs[theme];
    const currentTitle = playlist[index]?.title;
    playlist = newPlaylist;
    const same = playlist.findIndex((t) => t.title === currentTitle);
    index = same >= 0 ? same : 0;
    if (same >= 0) {
      updateUI(playlist[index]);
    } else {
      switchTrack(index, autoplay);
    }
  }

  function updatePlayingState() {
    player.classList.toggle("playing", !active.paused);
  }

  playBtn.addEventListener("click", () => {
    if (active.paused) {
      active.play();
      fadeTo(active, TARGET_VOLUME, FADE_IN_DURATION);
    } else {
      fadeTo(active, 0, FADE_OUT_DURATION, () => active.pause());
    }
  });

  nextBtn.addEventListener("click", () => {
    index = (index + 1) % playlist.length;
    switchTrack(index, !active.paused);
  });

  prevBtn.addEventListener("click", () => {
    if (active.currentTime > 3) {
      const wasPlaying = !active.paused;
      fadeTo(active, 0, SWITCH_FADE_DURATION, () => {
        active.currentTime = 0;
        if (wasPlaying) fadeTo(active, TARGET_VOLUME, SWITCH_FADE_DURATION);
      });
    } else {
      index = (index - 1 + playlist.length) % playlist.length;
      switchTrack(index, !active.paused);
    }
  });

  function onEnded() {
    if (this !== active) return;
    index = (index + 1) % playlist.length;
    switchTrack(index, true);
  }

  audioA.addEventListener("ended", onEnded);
  audioB.addEventListener("ended", onEnded);
  audioA.addEventListener("play", updatePlayingState);
  audioA.addEventListener("pause", updatePlayingState);
  audioB.addEventListener("play", updatePlayingState);
  audioB.addEventListener("pause", updatePlayingState);

  const observer = new MutationObserver(() => {
    syncPlaylist(!active.paused);
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  syncPlaylist(false);

  window.playSong = function (songTitle) {
    const i = playlist.findIndex((t) => t.title === songTitle);
    if (i === -1) return;
    index = i;
    switchTrack(index, true);
    if (!started) {
      started = true;
      document.removeEventListener("click", tryStart);
      document.removeEventListener("keydown", tryStart);
      document.removeEventListener("touchstart", tryStart);
    }
  };

  let started = false;

  function tryStart() {
    if (started) return;
    started = true;
    active.play();
    fadeTo(active, TARGET_VOLUME, FADE_IN_DURATION);
    document.removeEventListener("click", tryStart);
    document.removeEventListener("keydown", tryStart);
    document.removeEventListener("touchstart", tryStart);
  }

  active
    .play()
    .then(() => {
      started = true;
      fadeTo(active, TARGET_VOLUME, FADE_IN_DURATION);
    })
    .catch(() => {
      document.addEventListener("click", tryStart);
      document.addEventListener("keydown", tryStart);
      document.addEventListener("touchstart", tryStart);
    });
})();
