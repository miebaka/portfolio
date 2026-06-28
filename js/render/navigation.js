/* Render — navigation bar (logo · menu) and the fullscreen overlay menu. */
import { SITE } from "../../data/site.js";
import { escapeHTML as esc, mount, basePath } from "../utilities/dom.js";

function brandHTML() {
  const base = basePath();
  return (
    '<a class="site-nav__brand" href="' + base + 'index.html" aria-label="' + esc(SITE.name) + ' — home">' +
    '<span class="site-nav__logo" role="img" aria-label="' + esc(SITE.name) + '"></span>' +
    "</a>"
  );
}

export function renderNavigation() {
  const el = mount("nav");
  if (!el) return;
  el.className = "site-nav";
  /* Logo sits on the left, menu trigger on the right. */
  el.innerHTML =
    '<div class="container site-nav__inner">' +
    brandHTML() +
    '<button class="site-nav__menu-btn" type="button" data-menu-open aria-haspopup="dialog" aria-expanded="false" aria-controls="site-menu">Menu</button>' +
    "</div>";
}

/* Floating pill — always links home on every page except home. */
export function renderBackButton() {
  const page = document.body.dataset.page || "";
  if (page === "home") return;
  const base = basePath();
  const btn = document.createElement("a");
  btn.className = "back-btn";
  btn.href = base + "index.html";
  btn.innerHTML = "&larr;&ensp;Home";
  document.body.appendChild(btn);
}

export function renderMenu() {
  if (document.getElementById("site-menu")) return;
  const base = basePath();
  const page = document.body.dataset.page || "";

  const items = (SITE.menu || [])
    .map((m) => {
      const current = m.key === page ? ' aria-current="page"' : "";
      return '<a href="' + base + esc(m.href) + '"' + current + ">" + esc(m.label) + "</a>";
    })
    .join("");

  const socials = (SITE.socials || [])
    .map((s) => '<a href="' + esc(s.href) + '" rel="noopener">' + esc(s.label) + "</a>")
    .join(" ");

  /* Single static signature — anchored bottom-right of the overlay. */
  const sigSrc = base + "assets/images/miebaka-joshua-script-name.svg";
  const sigImg = '<img src="' + sigSrc + '" alt="" decoding="async">';

  const menu = document.createElement("div");
  menu.className = "site-menu";
  menu.id = "site-menu";
  menu.setAttribute("role", "dialog");
  menu.setAttribute("aria-modal", "true");
  menu.setAttribute("aria-label", "Site menu");
  menu.innerHTML =
    '<div class="site-menu__sig" aria-hidden="true">' + sigImg + "</div>" +
    '<div class="container site-menu__bar">' +
      brandHTML() +
      '<button class="site-menu__close btn" type="button" data-menu-close aria-label="Close menu">' +
        "<span>Close</span>" +
        '<span class="site-menu__close-icon" aria-hidden="true">&#10005;</span>' +
      "</button>" +
    "</div>" +
    '<nav class="container site-menu__nav" aria-label="Primary">' +
      '<div class="site-menu__list">' + items + "</div>" +
    "</nav>" +
    '<div class="container site-menu__foot">' +
      "<span>&copy; <span data-year></span> " + esc(SITE.name) + "</span>" +
      '<span class="site-menu__socials">' + socials + "</span>" +
    "</div>";
  document.body.appendChild(menu);
}
