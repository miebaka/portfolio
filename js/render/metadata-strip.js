import { escapeHTML as esc } from "../utilities/dom.js";

// Shared semantic label/value strip. The study hook updates in place when the gallery moves.
export function renderMetadataStrip(rows, {caseStudy = false} = {}) {
  return `<dl class="${caseStudy ? "case-facts container " : ""}metadata-strip">${rows.map(([label, value, study]) => `<div class="metadata-strip__cell${caseStudy ? " case-facts__cell" : ""}"><dt>${esc(label)}</dt><dd${study ? " data-experiment-title" : ""}>${esc(value)}</dd></div>`).join("")}</dl>`;
}
export function renderExperimentMetadata() {
  return renderMetadataStrip([["Study", "Wada Sanzō, Study 264", true], ["Medium", "Image + type"]]);
}
