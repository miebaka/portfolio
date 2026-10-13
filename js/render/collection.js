/* Pure collection markup, also usable when approved entries are ready. */
import { escapeHTML as esc, safeURL } from "../utilities/dom.js";

export function renderCollectionState({ title, introduction, entries = [], emptyMessage = "" }) {
  const heading = `<h1 class="hero__title measure-hero">${esc(title)}</h1>`;
  const intro = introduction ? `<p class="hero__intro">${esc(introduction)}</p>` : "";
  if (!entries.length) return heading + intro + (emptyMessage ? `<p class="hero__intro">${esc(emptyMessage)}</p>` : "");
  const items = entries.map(entry => `<li class="collection-entry"><h2><a href="${safeURL(entry.href)}">${esc(entry.title)}</a></h2>${entry.summary ? `<p>${esc(entry.summary)}</p>` : ""}</li>`).join("");
  return heading + intro + `<ul class="stack">${items}</ul>`;
}
