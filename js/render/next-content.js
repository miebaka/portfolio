import { escapeHTML as esc } from "../utilities/dom.js";
import { writing } from "../../data/writing.js";

/* One native-link component for project and editorial continuations.
   The legacy case/article selectors remain as compatibility hooks. */
export function renderNextContent({ label, title, href, essay = false }) {
  const classes = `case-next next-content${essay ? " article-next" : ""} container`;
  return `<section class="${classes}" aria-label="${esc(label)}"><a class="case-next__link" href="${esc(href)}"><span class="case-next__label">${esc(label)}</span><span class="case-next__name">${esc(title)}</span></a></section>`;
}

export function renderNextEssayMarkup(path) {
  const current = path.split("/").pop();
  const index = writing.findIndex(entry => entry.href.split("/").pop() === current);
  if (index < 0 || writing.length < 2) return "";
  const next = writing[(index + 1) % writing.length];
  return renderNextContent({ label: "Next essay", title: next.title, href: next.href.split("/").pop(), essay: true });
}
