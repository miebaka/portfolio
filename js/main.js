/* ==========================================================================
   main.js — module entry. Renders the data-driven DOM, then wires behaviour.
   Order matters: the nav must be rendered before its handlers attach.
   ========================================================================== */
import { initContract } from "./core/contract.js";

import { renderNavigation } from "./render/navigation.js";
import { renderWork, renderClients, renderProjectArchive } from "./render/projects.js";
import { renderCapabilities, renderProfessionalEvidence, fillSlots } from "./render/sections.js";
import { renderCaseStudy } from "./render/case-study.js";
import { renderWriting } from "./render/writing.js";
import { renderFooter } from "./render/footer.js";
import { initNavigation } from "./core/navigation.js";
import { initForm } from "./core/form.js";
import { initFooterSignature } from "./core/footer-signature.js";
import { initHeroWave } from "./core/hero-wave.js";
import { initCopyEmail } from "./core/copy-email.js";
import { initEditorialReveals } from "./core/editorial-reveals.js";
import { initMotionLanguage } from "./core/motion-language.js";
import { initScrollExperience } from "./core/scroll-experience.js";
import { initArticleNavigation } from "./core/article-navigation.js";
import { initExperimentsSpatial } from "./render/experiments.js";

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
if (has('[data-mount="experience"], [data-mount="cv"]')) run("professional evidence render", renderProfessionalEvidence);
if (isCaseStudy) run("case study render", renderCaseStudy);
if (has('[data-mount="writing"]')) run("writing render", renderWriting);
run("footer render", renderFooter);
run("content slots", fillSlots);
run("copy email", initCopyEmail);
run("editorial reveals", initEditorialReveals);
run("motion language", initMotionLanguage);
run("scroll experience", initScrollExperience);
if (page === "writing" && has(".article-body")) run("article navigation", initArticleNavigation);
if (page === "explorations") run("experiments spatial archive", () => { void initExperimentsSpatial(); });

/* Behaviour: attach handlers to the freshly rendered DOM. */
run("navigation behaviour", initNavigation);
run("footer signature", initFooterSignature);
run("hero wave", () => { void initHeroWave(); });
if (page === "contact") run("contact form", initForm);
