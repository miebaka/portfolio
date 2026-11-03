/* Render — writing list for the Writing page. */
import { SITE } from "../../data/site.js";
import { escapeHTML as esc, mount } from "../utilities/dom.js";
import { MOUNT } from "../core/contract.js";
import { renderEditorialIndex } from "./editorial-index.js";

/* Returns "" for a missing or unparseable date rather than "Invalid Date",
   which is what toLocaleDateString emits and which would otherwise be
   rendered straight into the page. */
function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(String(iso) + "T00:00:00");
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

export function renderWriting() {
  const el = mount(MOUNT.WRITING);
  if (!el) return;

  /* An entry with no destination or no title cannot render as a usable link,
     so it is dropped rather than emitted broken. A missing href previously
     threw on .startsWith and took the entire list down with it. */
  const articles = (SITE.writing || []).filter((a) => a && a.href && a.title);

  if (!articles.length) {
    el.innerHTML =
      '<div class="playground-empty">' +
        "<p>Nothing here yet. First post coming soon.</p>" +
      "</div>";
    return;
  }

  el.innerHTML = renderEditorialIndex(articles.map((a) => {
        const isExternal = /^https?:/i.test(a.href);
        const date = formatDate(a.date);
        return {
          tag: 'a', href: a.href, external: isExternal, className: 'writing-item__link',
          content: (
              '<span class="writing-item__identity">' +
                '<h3 class="writing-item__title editorial-index__title">' + esc(a.title) + "</h3>" +
              "</span>" +
              '<span class="writing-item__trailing editorial-index__meta">' +
                (a.summary ? '<span class="writing-item__summary editorial-index__description">' + esc(a.summary) + "</span>" : "") +
                '<span class="writing-item__meta">' +
                (date ? '<span class="writing-item__date">' + esc(date) + "</span>" : "") +
                (a.readingTime ? '<span class="writing-item__time">' + esc(a.readingTime) + "</span>" : "") +
                "</span>" +
              "</span>"
          )
        };
      }), { variant: 'notes', className: 'writing-list' });
}
