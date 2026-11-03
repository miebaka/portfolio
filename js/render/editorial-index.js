import { escapeHTML as esc, safeToken, safeURL } from "../utilities/dom.js";

function renderRow(item) {
  const tag = item.href ? "a" : "div";
  const href = tag === "a" && item.href ? ` href="${safeURL(item.href)}"` : "";
  const external = tag === "a" && item.external ? ' target="_blank" rel="noopener noreferrer"' : "";
  const label = item.label ? ` aria-label="${esc(item.label)}"` : "";
  const tone = item.tone ? ` project-tone project-tone--${safeToken(item.tone)}` : "";
  const className = item.className ? `${String(item.className).split(/\s+/).filter(Boolean).map(safeToken).join(" ")} ` : "";
  return `<li class="editorial-index__item${tone}"><${tag} class="${className}editorial-index__row"${href}${external}${label}>${item.content}</${tag}></li>`;
}

export function renderEditorialIndex(items, { variant, ordered = false, className = "" } = {}) {
  const tag = ordered ? "ol" : "ul";
  const modifier = variant ? ` editorial-index--${safeToken(variant)}` : "";
  const extra = className ? ` ${safeToken(className)}` : "";
  return `<${tag} class="editorial-index${modifier}${extra}">${items.map(renderRow).join("")}</${tag}>`;
}
