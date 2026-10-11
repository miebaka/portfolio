/* ==========================================================================
   main.js — module entry. Renders the data-driven DOM, then wires behaviour.
   Order matters: the nav must be rendered before its handlers attach.
   ========================================================================== */
import { initContract } from "./core/contract.js";

import { renderNavigation } from "./render/navigation.js";
import { renderWork, renderClients, renderProjectArchive } from "./render/projects.js";
import { renderCapabilities, renderExperience, fillSlots } from "./render/sections.js";
import { renderCaseStudy } from "./render/case-study.js";
import { renderWriting } from "./render/writing.js";
import { renderFooter } from "./render/footer.js";
import { initNowPlaying } from "./render/now-playing.js";
import { initNavigation } from "./core/navigation.js";
import { initYear } from "./core/year.js";
import { initForm } from "./core/form.js";
import { initDecisionField } from "./core/decision-field.js";
import { initFooterSignature } from "./core/footer-signature.js";
import { initProofSystem } from "./core/proof-system.js";

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
if (has('[data-project-archive]')) run("project archive render", renderProjectArchive);
if (has('[data-mount="clients"]')) run("clients render", renderClients);
if (has('[data-mount="capabilities"]')) run("capabilities render", renderCapabilities);
if (has('[data-mount="experience"]')) run("experience render", renderExperience);
if (isCaseStudy) run("case study render", renderCaseStudy);
if (has('[data-mount="writing"]')) run("writing render", renderWriting);
run("footer render", renderFooter);
run("proof system", initProofSystem);
run("content slots", fillSlots);
if (has('[data-mount="now-playing"]')) run("listening status", initNowPlaying);

/* Behaviour: attach handlers to the freshly rendered DOM. */
run("navigation behaviour", initNavigation);
run("year", initYear);
run("footer signature", initFooterSignature);
if (page === "contact") run("contact form", initForm);
if (has("[data-decision-field]")) run("404 identity field", () => { void initDecisionField(); });
