/* Render: home sections, capabilities and text slots. */
import { SITE } from "../../data/site.js";
import { escapeHTML as esc, mount } from "../utilities/dom.js";
import { MOUNT } from "../core/contract.js";

export function renderCapabilities() {
  const el = mount(MOUNT.CAPABILITIES);
  if (!el) return;
  const home = document.body.dataset.page === "home";
  if (home) {
    const labels = ["Identity", "Strategy", "Graphic design", "Art direction", "Production"];
    el.className = "proof-services__pin";
    el.innerHTML = '<div class="proof-services__frame"><div class="proof-services__heading"><span class="section-index">03</span><h2>Services</h2><p>Five connected ways I help teams turn an unclear brief into a system they can use.</p></div><ul class="proof-fan is-fanned" aria-label="Services">' + SITE.capabilities.map((c, index) => '<li class="proof-swatch" tabindex="0"><div class="proof-swatch__chip"><span class="proof-mono">' + labels[index] + '</span><span class="proof-mono">0' + (index + 1) + '</span></div><div class="proof-swatch__body"><h3>' + esc(c.title) + '</h3><p>' + esc(c.description) + '</p></div><span class="proof-swatch__rivet" aria-hidden="true"></span></li>').join("") + '</ul></div>';
    return;
  }
  el.className = "disciplines-index system-list";
  const heading = document.body.dataset.page === "services" ? "h2" : "h3";
  el.innerHTML = SITE.capabilities.map((c, index) =>
    '<details class="discipline system-list__item"><summary class="system-list__row"><span class="discipline__number">0' + (index + 1) + '</span><' + heading + '>' + esc(c.title) + '</' + heading + '><span class="system-list__toggle" aria-hidden="true"></span></summary><div class="system-list__panel"><p>' + esc(c.description) + '</p></div></details>'
  ).join("");
}

const EXPERIENCE = [
  ["2025 ·", "Rise", "Marketing Designer", "Hybrid", ["In-house designer for six marketing sub-teams, owning brand and campaign output for a fintech serving 800,000+ users.", "Ships 40+ creative assets a month across paid, organic, email and print, on one visual standard.", "Building an AI tool that uses open-source eye-tracking data to score where an ad actually pulls the eye."]],
  ["2025", "Anakle", "Creative Design Executive", "Hybrid", ["Led a design team through a full quarter of social creative for an FMCG brand.", "Led the rebrand of a Nigerian aerospace FBO over five months.", "Art directed winning pitch creative for brands including Spotify, InDrive and Access Bank."]],
  ["2024", "Rivo Studios", "Visual Designer", "Remote", ["Built the identity from wordmark and type through guidelines and production applications.", "Designed and finished the print work, from brochures to product booklets.", "Worked with Product and Marketing to carry the same logic across print, campaigns and day-to-day brand work."]],
  ["2022 · 23", "Grey Finance", "Brand Designer", "Remote · US", ["Made campaign and launch creative for a cross-border fintech speaking to Africans earning and spending globally.", "Built a brand pattern system still in use today.", "Designed a branded e-book that gave the product story more room than a campaign post could."]],
  ["2022", "WellaHealth", "Brand Designer", "Remote", ["Designed the everyday work of the brand: social, campaigns and product education for people navigating healthcare.", "Built a visual rhythm that could move between trust, urgency and plain-language explanation without changing character.", "Worked directly with stakeholders to turn business priorities into clear briefs and finished assets."]],
  ["2018 · 21", "Riv-TechCreek", "Generalist Designer", "Port Harcourt", ["Early-career generalist across brand, print and digital briefs for a range of clients.", "Where typography, layout and production stopped being software skills and became a way of thinking."]],
];

export function renderExperience() {
  const el = mount(MOUNT.EXPERIENCE);
  if (!el) return;
  el.className = "proof-jobs";
  el.innerHTML = EXPERIENCE.map(job => '<details class="proof-job" name="experience"><summary class="proof-job__head interactive-row"><span class="proof-job__year proof-mono">' + esc(job[0]) + '</span><span class="proof-job__company">' + esc(job[1]) + '</span><span class="proof-job__role">' + esc(job[2]) + '</span><span class="proof-job__mode proof-mono">' + esc(job[3]) + '</span><span class="proof-job__toggle" aria-hidden="true"></span></summary><div class="proof-job__body"><div><ul>' + job[4].map(line => '<li>' + esc(line) + '</li>').join("") + '</ul></div></div></details>').join("");
}

/* Fill simple text slots ([data-fill]) and email links.

   The hero portrait is plain markup in index.html rather than being built
   here: it is the LCP element, so it has to be in the HTML the browser
   receives, discoverable by the preload scanner, not appended by a module
   that only runs after the whole graph has parsed. */
export function fillSlots() {
  document.querySelectorAll("[data-fill]").forEach((node) => {
    const key = node.dataset.fill;
    if (SITE[key] != null) node.textContent = SITE[key];
  });
  document.querySelectorAll('[data-href="email"]').forEach((node) => {
    node.setAttribute("href", "mailto:" + SITE.email);
  });
}
