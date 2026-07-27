/* DOM utilities — shared helpers for rendering. */

/* Escape text before inserting into HTML strings.

   null and undefined become "" rather than the literal strings "null" and
   "undefined": every caller here interpolates optional data fields, and a
   missing field should render as nothing, not as the word "undefined". */
export function escapeHTML(value) {
  if (value == null) return "";
  return String(value).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

/* Schemes allowed in any href built from site data.

   Escaping an href protects the attribute delimiters but says nothing about
   the scheme, so `javascript:` survives escaping intact and still runs on
   click. The data here is author-written, so this is defence in depth rather
   than a live hole, but the check is free and removes a whole class of
   mistake from whoever edits data/site.js next. */
const SAFE_SCHEME = /^(https?:|mailto:|tel:)/i;

/* Returns a URL escaped for attribute use, or "#" when the scheme is one we
   are not willing to emit. Scheme-less values (relative paths, fragments)
   pass through untouched. */
export function safeURL(value) {
  const url = String(value == null ? "" : value).trim();
  if (!url) return "#";
  /* A colon before the first slash or hash means an explicit scheme */
  const colon = url.indexOf(":");
  if (colon !== -1) {
    const slash = url.indexOf("/");
    const hash = url.indexOf("#");
    const beforeSlash = slash === -1 || colon < slash;
    const beforeHash = hash === -1 || colon < hash;
    if (beforeSlash && beforeHash && !SAFE_SCHEME.test(url)) return "#";
  }
  return escapeHTML(url);
}

/* Strip anything that is not safe inside a class name. Used where a data
   field is concatenated into a class list, which escapeHTML would not make
   safe on its own (a space alone is enough to add an unintended class). */
export function safeToken(value) {
  return String(value == null ? "" : value).replace(/[^a-zA-Z0-9_-]/g, "");
}

/* Resolve a mount point declared in HTML with [data-mount="name"]. */
export function mount(name) {
  return document.querySelector('[data-mount="' + name + '"]');
}

/* Pages in subfolders set data-base="../" so internal links resolve at any depth. */
export function basePath() {
  return (document.body && document.body.dataset.base) || "";
}
