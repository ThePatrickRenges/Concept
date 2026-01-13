(() => {
  const grid = document.getElementById("grid");
  const q = document.getElementById("q");
  const toggle = document.getElementById("togglePreview");

  // Preview tuning
  const SCALE = 0.22;             // kleiner = mehr "Zoom out" in der Vorschau
  const VIEWPORT_W = 1200;        // virtuelle Breite der Website in der Vorschau
  const VIEWPORT_H = 800;         // virtuelle Höhe der Website in der Vorschau

  function buildIframe(src) {
    const iframe = document.createElement("iframe");

    // Mini-"browser" settings
    iframe.loading = "lazy";
    iframe.setAttribute("title", `Vorschau: ${src}`);
    iframe.setAttribute("sandbox", "allow-same-origin allow-forms allow-scripts"); 
    // Hinweis: allow-same-origin + allow-scripts ist nötig, damit moderne Sites normal laufen.
    // Für reine Vorschau ok. Wenn du maximal restriktiv willst: remove allow-same-origin.

    // Give the iframe a big virtual page and then scale it down
    iframe.style.width = `${VIEWPORT_W}px`;
    iframe.style.height = `${VIEWPORT_H}px`;
    iframe.style.border = "0";
    iframe.style.transformOrigin = "top left";
    iframe.style.transform = `scale(${SCALE})`;
    iframe.style.pointerEvents = "none"; // nicht im Preview scrollen/anklicken
    iframe.style.background = "transparent";

    // source
    iframe.src = src;

    return iframe;
  }

  function mountPreviews() {
    const previewBoxes = grid.querySelectorAll(".preview[data-preview-src]");
    previewBoxes.forEach(box => {
      if (box.dataset.mounted === "1") return;

      const src = box.getAttribute("data-preview-src");
      const hint = box.querySelector(".hint");
      if (hint) hint.remove();

      const iframe = buildIframe(src);

      // Make the box height match the scaled viewport
      const scaledH = Math.round(VIEWPORT_H * SCALE);
      const scaledW = Math.round(VIEWPORT_W * SCALE);

      // ensure preview box fits nicely
      box.style.height = `${Math.max(200, scaledH)}px`;

      // center it a bit / add padding feel via translate
      const inner = document.createElement("div");
      inner.style.position = "absolute";
      inner.style.inset = "0";
      inner.style.overflow = "hidden";

      // subtle inset so it doesn't stick to borders
      inner.style.padding = "10px";
      inner.style.display = "flex";
      inner.style.alignItems = "flex-start";
      inner.style.justifyContent = "flex-start";

      // "frame" look
      const frame = document.createElement("div");
      frame.style.width = `${scaledW}px`;
      frame.style.height = `${scaledH}px`;
      frame.style.borderRadius = "12px";
      frame.style.overflow = "hidden";
      frame.style.border = "1px solid rgba(255,255,255,.10)";
      frame.style.background = "rgba(0,0,0,.25)";

      frame.appendChild(iframe);
      inner.appendChild(frame);
      box.appendChild(inner);

      box.dataset.mounted = "1";
    });
  }

  function unmountPreviews() {
    const previewBoxes = grid.querySelectorAll(".preview[data-preview-src]");
    previewBoxes.forEach(box => {
      // remove everything except badges
      const keep = box.querySelector(".badge");
      box.innerHTML = "";
      if (keep) box.appendChild(keep);

      // reset hint
      const hint = document.createElement("div");
      hint.className = "hint";
      hint.textContent = "Live-Vorschau deaktiviert.";
      box.appendChild(hint);

      box.dataset.mounted = "0";
    });
  }

  function applyFilter() {
    const term = (q.value || "").trim().toLowerCase();
    const cards = grid.querySelectorAll(".card");

    cards.forEach(card => {
      const t = (card.dataset.title || "").toLowerCase();
      const f = (card.dataset.file || "").toLowerCase();

      const match = !term || t.includes(term) || f.includes(term);
      card.classList.toggle("is-hidden", !match);
    });
  }

  // Events
  q.addEventListener("input", applyFilter);

  toggle.addEventListener("change", () => {
    if (toggle.checked) mountPreviews();
    else unmountPreviews();
  });

  // initial
  applyFilter();
  if (toggle.checked) mountPreviews();
})();
