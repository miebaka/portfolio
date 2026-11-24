/* ==========================================================================
   main.js — module entry. Renders the data-driven DOM, then wires behaviour.
   Order matters: the nav must be rendered before its handlers attach.
   ========================================================================== */
import { initPageLoader } from "./core/page-loader.js";
import { initContract } from "./core/contract.js";

import { renderNavigation } from "./render/navigation.js";
import { renderWork, renderClients, renderProjectArchive } from "./render/projects.js";
import { renderCapabilities, renderProfessionalEvidence, fillSlots } from "./render/sections.js";
import { renderCaseStudy } from "./render/case-study.js";
import { renderWriting } from "./render/writing.js";
import { renderFooter } from "./render/footer.js";
import { initNowPlaying } from "./render/now-playing.js";
import { initForm } from "./core/form.js";
import { initFooterSignature } from "./core/footer-signature.js";
import { initProjectFolderInteractions } from "./core/project-folder-interactions.js";
import { initCaseRouteTransitions } from "./core/case-route-transition.js";
import { initCopyEmail } from "./core/copy-email.js";
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

run("Page loader", initPageLoader);
run("DOM contract", initContract);

/* Render: build markup from site data into the [data-mount] points. */
run("navigation render", renderNavigation);
run("Last.fm listening status", initNowPlaying);
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
if (page === "writing" && has(".article-body")) run("article navigation", initArticleNavigation);
if (page === "explorations") run("experiments spatial archive", () => { void initExperimentsSpatial(); });

/* Behaviour: attach handlers to the freshly rendered DOM. */
run("project-folder interaction", initProjectFolderInteractions);
run("case-study route transitions", initCaseRouteTransitions);
run("footer signature", initFooterSignature);
if (page === "contact") run("contact form", initForm);

// The case legend is bounded by the narrative and shares the essay scroll-spy treatment.
if (isCaseStudy) run("case study navigation", () => {
  const links = [...document.querySelectorAll(".case-toc a")];
  const chapters = links.map(link => document.getElementById(link.hash.slice(1)));
  if (!links.length) return;
  let frame = 0;
  const update = () => {
    frame = 0;
    let active = 0;
    chapters.forEach((chapter, index) => {
      if (chapter && chapter.getBoundingClientRect().top <= Math.max(100, innerHeight * .28)) active = index;
    });
    links.forEach((link, index) => {
      if (index === active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
  addEventListener("scroll", schedule, { passive: true });
  addEventListener("resize", schedule, { passive: true });
  update();
});
