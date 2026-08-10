/* ==========================================================================
   main.js — module entry. Renders the data-driven DOM, then wires behaviour.
   Order matters: nav + menu must be rendered before their handlers attach.
   ========================================================================== */
import { initContract } from "./core/contract.js";
import { renderNavigation, renderMenu, renderBackButton } from "./render/navigation.js";
import { initNowPlaying } from "./render/now-playing.js";
import { renderWork, renderClients } from "./render/projects.js";
import { renderCapabilities, renderTestimonial, fillSlots } from "./render/sections.js";
import { renderCaseStudy } from "./render/case-study.js";
import { renderWriting } from "./render/writing.js";
import { renderFooter } from "./render/footer.js";
import { initSplitText } from "./core/split-text.js";
import { initScrollReveal } from "./core/scroll.js";
import { initNavigation } from "./core/navigation.js";
import { initMenu } from "./core/menu.js";
import { initYear } from "./core/year.js";
import { initForm } from "./core/form.js";
import { initCursorField } from "./core/cursor-field.js";
import { initFooterScene } from "./core/footer-scene.js";

/* Verify the HTML/JS contract before rendering anything. A mount name that
   exists in one half but not the other is reported here instead of showing up
   later as a section that silently never filled. See js/core/contract.js. */
initContract();

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

/* Behaviour: attach handlers to the freshly rendered DOM.
   Split runs before the reveal observer so words are wrapped and measured
   before anything can be marked visible. */
initSplitText();
initScrollReveal();
initNavigation();
initMenu();
initYear();
initForm();
initCursorField();
initFooterScene();
