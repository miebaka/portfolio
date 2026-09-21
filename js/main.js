/* ==========================================================================
   main.js — module entry. Renders the data-driven DOM, then wires behaviour.
   Order matters: the nav must be rendered before its handlers attach.
   ========================================================================== */
import { initContract } from "./core/contract.js";

import { renderNavigation } from "./render/navigation.js";
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
import { initCountUp } from "./core/count-up.js";
import { initSwissScene } from "./core/swiss-scene.js";
import { initFooterScene } from "./core/footer-scene.js";
import { initCaseRail } from "./core/case-rail.js";

/* Verify the HTML/JS contract before rendering anything. A mount name that
   exists in one half but not the other is reported here instead of showing up
   later as a section that silently never filled. See js/core/contract.js. */
const page = document.body.dataset.page || "";
const has = (selector) => Boolean(document.querySelector(selector));
const isCaseStudy = Boolean(document.body.dataset.case);
const run = (label, task) => {
  try { task(); }
  catch (error) { console.error("[portfolio] " + label + " failed", error); }
};

run("DOM contract", initContract);

/* Render: build markup from site data into the [data-mount] points. */
run("navigation render", renderNavigation);
if (has('[data-mount="work"], [data-mount="work-grid"]')) run("work render", renderWork);
if (has('[data-mount="clients"]')) run("clients render", renderClients);
if (has('[data-mount="capabilities"]')) run("capabilities render", renderCapabilities);
if (has('[data-mount="testimonial"]')) run("testimonial render", renderTestimonial);
if (isCaseStudy) run("case study render", renderCaseStudy);
if (has('[data-mount="writing"]')) run("writing render", renderWriting);
run("footer render", renderFooter);
run("content slots", fillSlots);
if (page === "home") run("listening status", initNowPlaying);

/* Behaviour: attach handlers to the freshly rendered DOM. Content stays visible;
   the observer retains the existing readiness contract without delaying copy. */
run("scroll reveal", initScrollReveal);
run("navigation behaviour", initNavigation);
run("year", initYear);
if (page === "contact") run("contact form", initForm);
/* After renderCaseStudy() has built the metric markup. */
if (isCaseStudy) run("case metrics", initCountUp);
if (isCaseStudy) run("case chapter rail", initCaseRail);
if (page === "home" && has("[data-swiss-scene]")) run("hero scene", initSwissScene);
run("footer signature scene", initFooterScene);
