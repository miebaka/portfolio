/* Five expressions on one 8 × 8 construction grid (128 × 128 units).
   Decorative artwork inherits the card's foreground, never its own palette. */
const motifs = new Map([
  ["brand-identity-systems", '<g class="motif-a"><rect x="16" y="16" width="28" height="28" fill="currentColor"/><rect x="48" y="16" width="28" height="28"/><rect x="16" y="48" width="28" height="28"/></g><rect x="48" y="48" width="28" height="28" fill="currentColor"/><g class="motif-b"><rect x="80" y="48" width="28" height="28"/><rect x="48" y="80" width="28" height="28"/><rect x="80" y="80" width="28" height="28" fill="currentColor"/></g>'],
  ["art-direction", '<path d="M16 40V16H40M88 16h24v24M112 88v24H88M40 112H16V88"/><circle cx="64" cy="64" r="38" class="motif-a" fill="currentColor" stroke="none"/><rect class="motif-b" x="32" y="32" width="64" height="64" stroke-dasharray="4 4"/><path d="M64 8v16m0 80v16M8 64h16m80 0h16"/>'],
  ["campaign-marketing", '<circle class="motif-a" cx="64" cy="64" r="48"/><circle class="motif-b" cx="64" cy="64" r="36"/><circle cx="64" cy="64" r="24"/><circle cx="64" cy="64" r="12" fill="currentColor"/><path d="M64 8v8m0 96v8M8 64h8m96 0h8"/>'],
  ["editorial-graphic", '<rect x="16" y="16" width="96" height="96"/><path d="M64 16v96" stroke-dasharray="3 5" opacity=".45"/><g class="motif-a"><path d="M24 72 42 28h6l18 44H55l-4-11H37l-4 11Zm16-20h8l-4-12Z" fill="currentColor" fill-rule="evenodd" stroke="none"/><path d="M24 84h28m-28 8h28m-28 8h20"/></g><g class="motif-b"><path d="M72 40h32M72 48h32M72 56h24M72 76h32M72 84h32M72 92h32M72 100h24" stroke-width="4"/></g>'],
  ["design-systems-production", '<path d="M64 16 112 40 64 64 16 40Z" class="motif-a" fill="currentColor" fill-opacity=".18"/><path d="M16 56 64 80 112 56M16 72 64 96 112 72"/><path d="M16 88 64 112 112 88" class="motif-b"/><path d="M16 40v48m48-24v48m48-72v48" stroke-dasharray="3 5" opacity=".55"/>'],
]);

export function renderServiceMotif(id) {
  const artwork = motifs.get(id);
  if (!artwork) return "";
  return '<svg class="service-stack__motif" viewBox="0 0 128 128" preserveAspectRatio="xMaxYMin meet" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter">' + artwork + '</svg>';
}
