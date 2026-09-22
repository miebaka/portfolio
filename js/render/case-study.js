import { SITE } from "../../data/site.js";
import { mount, basePath } from "../utilities/dom.js";
import { MOUNT } from "../core/contract.js";
import { renderCaseMarkup } from "./case-markup.js";

export function renderCaseStudy() {
  const slug = document.body.dataset.case;
  const element = mount(MOUNT.CASE);
  if (!slug || !element || element.dataset.prerendered === "true") return;
  element.innerHTML = renderCaseMarkup(SITE, slug, basePath());
}
