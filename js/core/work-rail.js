/* work-rail.js — the two things the work gallery needs that CSS cannot do.

   The gallery itself is a plain horizontal scroll container. Scrolling, drag,
   momentum, arrow keys, Home/End, focus scrolling and the scrollbar are all
   the browser's, not ours. Card sizing is a CSS hover rule.

   Earlier versions of this file drove a translated track from a JS index, and
   later mirrored each project's title into a separate caption block. Both are
   gone: `overflow-x: auto` replaced the first, and putting the title on the
   card itself replaced the second.

   What is left is the one thing with no CSS equivalent: the cursor-following
   pill, because CSS cannot read pointer coordinates. It is a pointer
   affordance on top of a gallery that already works without it. If this file
   fails to load, the section still scrolls and every project is still
   reachable and still labelled. */

import { SITE } from "../../data/site.js";

export function initWorkRail() {
  const rail = document.querySelector(".sl-rail");
  if (!rail) return;

  const cards = [...rail.querySelectorAll(".sl-card")];
  const pill = rail.querySelector(".sl-rail__pill");
  if (!cards.length) return;

  const fine = window.matchMedia("(hover: hover) and (pointer: fine)");

  /* ── Pointer pill ────────────────────────────────────────────────────────
     Position is written onto the pill's own transform. Setting a custom
     property on a shared ancestor would invalidate style for every descendant
     on each mouse move, which is the whole track; this touches one element. */
  function place(e) {
    if (!pill) return;
    pill.style.setProperty("--px", `${e.clientX + 16}px`);
    pill.style.setProperty("--py", `${e.clientY + 16}px`);
  }

  cards.forEach((card, i) => {
    const project = SITE.projects[i];

    if (!fine.matches || !pill) return;
    card.addEventListener("pointerenter", (e) => {
      /* A project with no case study behind it has nothing to view, so the
         pill would be a promise the click cannot keep. */
      if (!project || project.caseReady === false) return;
      pill.textContent = `View ${project.title} project`;
      pill.dataset.show = "true";
      place(e);
    });
    card.addEventListener("pointermove", place);
    card.addEventListener("pointerleave", () => { pill.dataset.show = "false"; });
  });

  /* Dragging the scroller must not leave the pill stranded mid-screen. */
  const viewport = rail.querySelector(".sl-rail__viewport");
  if (viewport && pill) {
    viewport.addEventListener("pointerdown", () => { pill.dataset.show = "false"; });
    viewport.addEventListener("scroll", () => { pill.dataset.show = "false"; }, { passive: true });
  }
}
