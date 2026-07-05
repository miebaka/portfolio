/* ==========================================================================
   main.js — module entry. Renders the data-driven DOM, then wires behaviour.
   Order matters: nav + menu must be rendered before their handlers attach.
   ========================================================================== */
import { renderNavigation, renderMenu, renderBackButton } from "./render/navigation.js";
import { initNowPlaying } from "./render/now-playing.js";
import { renderWork, renderClients } from "./render/projects.js";
import { renderCapabilities, renderTestimonial, fillSlots } from "./render/sections.js";
import { renderCaseStudy } from "./render/case-study.js";
import { renderWriting } from "./render/writing.js";
import { renderFooter } from "./render/footer.js";
import { initScrollReveal } from "./core/scroll.js";
import { initNavigation } from "./core/navigation.js";
import { initMenu } from "./core/menu.js?v=5";
import { initYear } from "./core/year.js";
import { initForm } from "./core/form.js";
import { initInteractions } from "./core/interactions.js?v=3";
import { initFooterScene } from "./core/footer-scene.js";
import { initHeroScene }  from "./three/hero-scene.js";
import { initPageScene }  from "./core/page-scene.js?v=4";

/* Render: build markup from site data into the [data-mount] points. */
renderNavigation();
renderMenu();
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

/* Behaviour: attach handlers to the freshly rendered DOM. */
initScrollReveal();
initNavigation();
initMenu();
initYear();
initForm();
initInteractions();
initPageScene();
initFooterScene();
initHeroScene();
