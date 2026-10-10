import { SITE } from "../../data/site.js";
import { mount, basePath } from "../utilities/dom.js";
import { MOUNT } from "../core/contract.js";
import { renderCaseMarkup } from "./case-markup.js";

export function renderCaseStudy() {
  const slug = document.body.dataset.case;
  const element = mount(MOUNT.CASE);
  if (!slug || !element) return;
  if (element.dataset.prerendered !== "true") element.innerHTML = renderCaseMarkup(SITE, slug, basePath());
  const controls = [...element.querySelectorAll('[data-case-view]')];
  const setView = view => {
    element.dataset.view = view;
    controls.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.caseView === view)));
  };
  controls.forEach(button => button.addEventListener('click', () => setView(button.dataset.caseView)));
  setView('full');
}
