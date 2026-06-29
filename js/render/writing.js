/* Render — writing list for the Playground page. */
import { SITE } from "../../data/site.js";
import { escapeHTML as esc, mount } from "../utilities/dom.js";

function formatDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

export function renderWriting() {
  const el = mount("writing");
  if (!el) return;

  const articles = SITE.writing || [];

  if (!articles.length) {
    el.innerHTML =
      '<div class="playground-empty reveal">' +
        "<p>Nothing here yet &mdash; first post coming soon.</p>" +
      "</div>";
    return;
  }

  el.innerHTML =
    '<ul class="writing-list">' +
    articles
      .map(
        (a) =>
          '<li class="writing-item reveal">' +
            '<a class="writing-item__link" href="' + esc(a.href) + '" target="_blank" rel="noopener">' +
              '<div class="writing-item__meta">' +
                (a.tag ? '<span class="writing-item__tag">' + esc(a.tag) + "</span>" : "") +
                '<span class="writing-item__date">' + formatDate(a.date) + "</span>" +
                (a.readingTime ? '<span class="writing-item__time">' + esc(a.readingTime) + "</span>" : "") +
              "</div>" +
              '<h3 class="writing-item__title">' + esc(a.title) + "</h3>" +
              '<p class="writing-item__summary">' + esc(a.summary) + "</p>" +
              '<span class="writing-item__arrow" aria-hidden="true">&nearr;</span>' +
            "</a>" +
          "</li>"
      )
      .join("") +
    "</ul>";
}
