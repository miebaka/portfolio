/* DOM utilities — shared helpers for rendering. */

/* Escape text before inserting into HTML strings. */
export function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

/* Resolve a mount point declared in HTML with [data-mount="name"]. */
export function mount(name) {
  return document.querySelector('[data-mount="' + name + '"]');
}

/* Pages in subfolders set data-base="../" so internal links resolve at any depth. */
export function basePath() {
  return (document.body && document.body.dataset.base) || "";
}
