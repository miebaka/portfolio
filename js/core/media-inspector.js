const bestSource = (figure) => {
  const source = figure.querySelector('source[type="image/avif"]');
  const candidates = String(source?.srcset || "")
    .split(",")
    .map((item) => item.trim().split(/\s+/u)[0])
    .filter(Boolean);
  return candidates.at(-1) || figure.querySelector("img")?.currentSrc || figure.querySelector("img")?.src || "";
};

export function initMediaInspector() {
  const gallery = document.querySelector(".case-gallery-flow");
  if (!gallery || typeof HTMLDialogElement === "undefined") return;
  const figures = [...gallery.querySelectorAll("figure.case-shot")].filter((figure) =>
    figure.querySelector("picture img"),
  );
  if (!figures.length) return;

  const dialog = document.createElement("dialog");
  dialog.className = "media-inspector";
  dialog.setAttribute("aria-labelledby", "media-inspector-title");
  dialog.innerHTML = `
    <div class="media-inspector__bar">
      <h2 class="sr-only" id="media-inspector-title">Project image viewer</h2>
      <p class="media-inspector__count" aria-live="polite"></p>
      <button type="button" class="media-inspector__close" aria-label="Close image viewer">Close</button>
    </div>
    <div class="media-inspector__stage"><img alt=""><p class="media-inspector__caption"></p></div>
    <div class="media-inspector__controls">
      <button type="button" data-media-previous>Previous</button>
      <button type="button" data-media-next>Next</button>
    </div>`;
  document.body.append(dialog);
  const display = dialog.querySelector("img");
  const caption = dialog.querySelector(".media-inspector__caption");
  const count = dialog.querySelector(".media-inspector__count");
  const close = dialog.querySelector(".media-inspector__close");
  let active = 0;
  let returnTo = null;

  const show = (index) => {
    active = (index + figures.length) % figures.length;
    const figure = figures[active];
    const image = figure.querySelector("img");
    display.src = bestSource(figure);
    display.alt = image.alt;
    caption.textContent = figure.querySelector("figcaption")?.textContent.trim() || image.alt;
    count.textContent = `${String(active + 1).padStart(2, "0")} / ${String(figures.length).padStart(2, "0")}`;
  };
  const open = (index, trigger) => {
    active = index;
    returnTo = trigger;
    show(index);
    dialog.showModal();
    close.focus();
  };
  figures.forEach((figure, index) => {
    const picture = figure.querySelector("picture");
    const image = picture.querySelector("img");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "case-shot__inspect";
    button.setAttribute("aria-label", `Inspect image: ${image.alt}`);
    picture.before(button);
    button.append(picture);
    button.addEventListener("click", () => open(index, button));
  });
  close.addEventListener("click", () => dialog.close());
  dialog.querySelector("[data-media-previous]").addEventListener("click", () => show(active - 1));
  dialog.querySelector("[data-media-next]").addEventListener("click", () => show(active + 1));
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      show(active + (event.key === "ArrowLeft" ? -1 : 1));
    }
  });
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", () => returnTo?.focus());
}
