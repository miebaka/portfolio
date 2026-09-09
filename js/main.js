/* ==========================================================================
   main.js — module entry. Renders the data-driven DOM, then wires behaviour.
   Order matters: the nav must be rendered before its handlers attach.
   ========================================================================== */
import { initContract } from "./core/contract.js";

import { renderNavigation, renderBackButton } from "./render/navigation.js";
import { initNowPlaying } from "./render/now-playing.js";
import { renderWork, renderClients } from "./render/projects.js";
import { renderCapabilities, renderTestimonial, fillSlots } from "./render/sections.js";
import { renderCaseStudy } from "./render/case-study.js";
import { renderWriting } from "./render/writing.js";
import { renderFooter } from "./render/footer.js";
import { initScrollReveal } from "./core/scroll.js";
import { initNavigation } from "./core/navigation.js";
import { initYear } from "./core/year.js";
import { initForm } from "./core/form.js";
import { initHeroParallax } from "./core/hero-parallax.js";
import { initCountUp } from "./core/count-up.js";
import { initSwissScene } from "./core/swiss-scene.js";
import { initPageTransition } from "./core/page-transition.js";
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

/* Behaviour: attach handlers to the freshly rendered DOM. Content stays visible;
   the observer retains the existing readiness contract without delaying copy. */
initScrollReveal();
initNavigation();
initYear();
initForm();
initHeroParallax();
/* After renderCaseStudy() has built the metric markup. */
initCountUp();
initSwissScene();
initFooterScene();
initPageTransition();

/* Normalise directional link icons after all data-driven markup exists. */
for (const link of document.querySelectorAll("a, button[type=submit]")) {
  const walker = document.createTreeWalker(link, NodeFilter.SHOW_TEXT);
  const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const node of nodes) {
    if (!/[↗↘→←↓]/.test(node.textContent)) continue;
    const fragment = document.createDocumentFragment();
    node.textContent.split(/([↗↘→←↓])/).forEach(part => {
      if (/^[↗↘→←↓]$/.test(part)) { const arrow = document.createElement("span"); arrow.className="link-arrow"; arrow.setAttribute("aria-hidden","true"); arrow.textContent="↗"; fragment.append(arrow); }
      else fragment.append(document.createTextNode(part));
    }); node.replaceWith(fragment);
  }
}
