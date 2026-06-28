/* Current year — fills every [data-year] slot (e.g. the footer copyright). */
export function initYear() {
  const year = String(new Date().getFullYear());
  document.querySelectorAll("[data-year]").forEach((el) => { el.textContent = year; });
}
