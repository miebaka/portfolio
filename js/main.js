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
import { initMenu } from "./core/menu.js";
import { initYear } from "./core/year.js";
import { initForm } from "./core/form.js";
import { initInteractions } from "./core/interactions.js";
import { initFooterScene } from "./core/footer-scene.js";
import { initHeroScene }  from "./three/hero-scene.js";

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
initFooterScene();
initHeroScene();
