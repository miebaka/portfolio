/* ==========================================================================
   main.js — module entry. Renders the data-driven DOM, then wires behaviour.
   Order matters: the nav must be rendered before its handlers attach.
   ========================================================================== */
import { initContract } from "./core/contract.js";

/* Native cross-document view transitions (@view-transition in
   styles/base/view-transitions.css) reject their promise with an AbortError
   when one navigation supersedes an in-flight transition (rapid clicks,
   back/forward). It is harmless but surfaces as an unhandled rejection. Swallow
   exactly that case; let every other rejection through untouched. */
window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason;
  if (reason && reason.name === "AbortError" && /transition was skipped/i.test(reason.message || "")) {
    event.preventDefault();
  }
});
import { renderNavigation, renderBackButton } from "./render/navigation.js";
import { initNowPlaying } from "./render/now-playing.js";
import { renderWork, renderClients } from "./render/projects.js";
import { renderCapabilities, renderTestimonial, fillSlots } from "./render/sections.js";
import { renderCaseStudy } from "./render/case-study.js";
import { renderWriting } from "./render/writing.js";
import { renderFooter } from "./render/footer.js";
import { initSplitText } from "./core/split-text.js";
import { initScrollReveal } from "./core/scroll.js";
import { initNavigation } from "./core/navigation.js";
import { initYear } from "./core/year.js";
import { initForm } from "./core/form.js";
import { initWorkPreview } from "./core/work-preview.js";
import { initFooterScene } from "./core/footer-scene.js";

/* Verify the HTML/JS contract before rendering anything. A mount name that
   exists in one half but not the other is reported here instead of showing up
   later as a section that silently never filled. See js/core/contract.js. */
initContract();

/* Render: build markup from site data into the [data-mount] points. */
renderNavigation();
renderBackButton();
renderWork();
renderClients();
renderCapabilities();
renderTestimonial();
renderCaseStudy();
renderWriting();
renderFooter();
fillSlots();
initNowPlaying();

/* Behaviour: attach handlers to the freshly rendered DOM.
   Split runs before the reveal observer so words are wrapped and measured
   before anything can be marked visible. */
initSplitText();
initScrollReveal();
initNavigation();
initYear();
initForm();
initWorkPreview();
initFooterScene();
