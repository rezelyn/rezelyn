(function () {
  const CODES = [
    { keys: "eye",    desc: "hide the page" },
    { keys: "clear",  desc: "hide particles" },
    { keys: "vacuum", desc: "vacuum mode" },
    { keys: "miette", desc: "???" },
  ];

  const trigger = document.createElement("div");
  trigger.textContent = "Copyright © 2026 Rezelyn - All Rights Reserved";
  trigger.style.cssText = `
    position: fixed;
    bottom: 24px;
    left: 24px;
    z-index: 99997;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem;
    color: rgba(255,255,255,0.2);
    transition: color 0.2s ease;
    user-select: none;
    cursor: default;
  `;

  const table = document.createElement("div");
  table.style.cssText = `
    position: fixed;
    bottom: 48px;
    left: 24px;
    z-index: 99997;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s ease;
  `;

  CODES.forEach(({ keys, desc }) => {
    const row = document.createElement("div");
    row.style.cssText = "display: flex; align-items: center; gap: 8px; margin-bottom: 4px;";

    const badge = document.createElement("span");
    badge.textContent = keys;
    badge.style.cssText = `
      background: rgba(255,255,255,0.07);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 3px;
      padding: 0 5px;
      color: #fff;
      min-width: 52px;
      text-align: center;
    `;

    const label = document.createElement("span");
    label.textContent = desc;
    label.style.color = "rgba(255,255,255,0.45)";

    row.appendChild(badge);
    row.appendChild(label);
    table.appendChild(row);
  });

  document.body.appendChild(table);
  document.body.appendChild(trigger);

  trigger.addEventListener("mouseenter", () => {
    table.style.opacity = "1";
    trigger.style.color = "rgba(255,255,255,0.5)";
  });
  trigger.addEventListener("mouseleave", () => {
    table.style.opacity = "0";
    trigger.style.color = "rgba(255,255,255,0.2)";
  });
})();
