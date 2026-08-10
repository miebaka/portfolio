/* work-preview.js — a cursor-following cover preview for the work index.

   On a pointer device, hovering a project row shows a small plate of that
   project's cover which tracks the cursor. Touch gets nothing (there is no
   cursor to follow, and the row already links straight through), and a row with
   no cover shows no plate. One shared element, moved on the `transform`
   property so a pointer move touches a single node rather than the whole list.
   The static offset (right of the cursor, vertically centred) lives on the
   `translate` property in CSS, which composes with the JS transform. */

export function initWorkPreview() {
  const rows = document.querySelectorAll(".work-index__row[data-cover]");
  if (!rows.length) return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  const preview = document.createElement("div");
  preview.className = "work-preview";
  preview.setAttribute("aria-hidden", "true");
  const img = document.createElement("img");
  img.alt = "";
  img.decoding = "async";
  preview.appendChild(img);
  document.body.appendChild(preview);

  let raf = 0;
  let x = 0;
  let y = 0;
  function place() {
    raf = 0;
    preview.style.transform = "translate3d(" + x + "px, " + y + "px, 0)";
  }
  function onMove(e) {
    x = e.clientX;
    y = e.clientY;
    if (!raf) raf = requestAnimationFrame(place);
  }

  rows.forEach((row) => {
    const src = row.dataset.cover;
    if (!src) return;
    row.addEventListener("pointerenter", (e) => {
      if (img.getAttribute("src") !== src) img.src = src;
      x = e.clientX;
      y = e.clientY;
      place();
      preview.dataset.show = "true";
    });
    row.addEventListener("pointermove", onMove);
    row.addEventListener("pointerleave", () => { preview.dataset.show = "false"; });
  });
}
