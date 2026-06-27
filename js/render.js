/* ==========================================================================
   render.js — builds data-driven DOM from window.SITE.
   Mount points are declared in HTML with [data-mount="..."].
   Runs as a plain script (no modules) so it works from file:// too.
   ========================================================================== */
(function () {
  "use strict";

  var SITE = window.SITE;
  if (!SITE) return;

  /* Escape text before inserting into HTML strings. */
  function esc(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function mount(name) {
    return document.querySelector('[data-mount="' + name + '"]');
  }

  /* Pages in subfolders (e.g. /work) set data-base="../" so internal
     links resolve correctly from any depth. */
  var BASE = document.body.dataset.base || "";

  /* --- Navigation: logo (left) · menu (centre) · local time (right) --- */
  function brandHTML() {
    var parts = String(SITE.name).split(" ");
    var first = esc(parts.shift());
    var rest = esc(parts.join(" "));
    return (
      '<a class="site-nav__brand" href="' + BASE + 'index.html">' +
      first + '<span class="dot" aria-hidden="true"> &bull; </span>' + rest +
      "</a>"
    );
  }
  function timeHTML() {
    return (
      '<p class="site-nav__time">( ' + esc(SITE.city || "") +
      ' ) <span data-clock>--:--</span></p>'
    );
  }

  function renderNav() {
    var el = mount("nav");
    if (!el) return;
    el.className = "site-nav";
    el.innerHTML =
      '<div class="container site-nav__inner">' +
      brandHTML() +
      '<button class="site-nav__menu-btn" type="button" data-menu-open aria-haspopup="dialog" aria-expanded="false" aria-controls="site-menu">Menu</button>' +
      timeHTML() +
      "</div>";
  }

  /* --- Fullscreen menu overlay --- */
  function renderMenu() {
    if (document.getElementById("site-menu")) return;
    var page = document.body.dataset.page || "";
    var items = (SITE.menu || [])
      .map(function (m) {
        var current = m.key === page ? ' aria-current="page"' : "";
        return (
          '<a href="' + BASE + esc(m.href) + '"' + current + ">" +
          '<span class="site-menu__marker" aria-hidden="true">&#9673;</span>' +
          '<span class="site-menu__label">' + esc(m.label) + "</span></a>"
        );
      })
      .join("");
    var socials = (SITE.socials || [])
      .map(function (s) {
        return '<a href="' + esc(s.href) + '" rel="noopener">' + esc(s.label) + "</a>";
      })
      .join(" ");

    var menu = document.createElement("div");
    menu.className = "site-menu";
    menu.id = "site-menu";
    menu.setAttribute("role", "dialog");
    menu.setAttribute("aria-modal", "true");
    menu.setAttribute("aria-label", "Site menu");
    menu.innerHTML =
      '<div class="container site-menu__bar">' +
        brandHTML() +
        '<button class="site-menu__close" type="button" data-menu-close aria-label="Close menu"><span>Close</span><span class="site-menu__close-icon" aria-hidden="true">&#10005;</span></button>' +
      "</div>" +
      '<nav class="container site-menu__nav" aria-label="Primary">' +
        '<div class="site-menu__list">' + items + "</div>" +
        '<a class="site-menu__cta" href="' + BASE + 'index.html#contact">Let&rsquo;s work together</a>' +
      "</nav>" +
      '<div class="container site-menu__foot">' +
        "<span>&copy; <span data-year></span> " + esc(SITE.name) + "</span>" +
        '<span class="site-menu__socials">' + socials + "</span>" +
      "</div>";
    document.body.appendChild(menu);
  }

  /* --- Selected work: Saint-Louvent treatment — metadata over a cropped
     image panel, in a 3-column grid (two rows of three). --- */
  function slTile(p) {
    var services = p.tags
      .map(function (t) { return "<li>" + esc(t) + "</li>"; })
      .join("");
    var cat = p.category
      ? ' <span class="sl-card__cat">(' + esc(p.category) + ")</span>"
      : "";
    return (
      '<a class="sl-card" style="--tile:' + esc(p.tone) + '" href="' + BASE + "work/" + esc(p.slug) + '.html">' +
      '<span class="sl-card__bg"></span>' +
      '<span class="sl-card__name">' + esc(p.title) + "</span>" +
      '<span class="sl-card__details">' +
      '<span class="sl-card__head">' + esc(p.title) + cat + "</span>" +
      '<ul class="sl-card__services">' + services + "</ul>" +
      "</span></a>"
    );
  }

  function renderWork() {
    var el = mount("work-grid");
    if (!el) return;
    el.classList.add("sl-grid");
    el.innerHTML = SITE.projects.map(slTile).join(""); // all six projects
  }

  /* --- Client logo marquee (seamless infinite scroll) --- */
  function clientItem(c) {
    var inner = c.logo
      ? '<img src="' + esc(c.logo) + '" alt="' + esc(c.name) + '">'
      : '<span class="marquee__wordmark">' + esc(c.name) + "</span>";
    return '<li class="marquee__item">' + inner + "</li>";
  }
  function renderClients() {
    var el = mount("clients");
    if (!el || !SITE.clients || !SITE.clients.length) return;
    var setHTML = SITE.clients.map(clientItem).join("");

    // Render one set first, then measure it (once logos load) and repeat the
    // set enough times that a single group exceeds the viewport — so the
    // two-group / -50% loop stays seamless with no gap, at any width.
    el.innerHTML =
      '<div class="marquee__track"><ul class="marquee__group">' + setHTML + "</ul></div>";
    var track = el.querySelector(".marquee__track");
    var measureGroup = el.querySelector(".marquee__group");

    function build() {
      var setW = measureGroup.scrollWidth;
      var viewport = el.clientWidth || window.innerWidth || 1440;
      var reps = setW > 0 ? Math.max(1, Math.ceil((viewport * 1.5) / setW)) : 2;
      var groupHTML = "";
      for (var i = 0; i < reps; i++) groupHTML += setHTML;
      track.innerHTML =
        '<ul class="marquee__group">' + groupHTML + "</ul>" +
        '<ul class="marquee__group" aria-hidden="true">' + groupHTML + "</ul>";
    }

    var imgs = measureGroup.querySelectorAll("img");
    var pending = imgs.length;
    if (!pending) { build(); return; }
    var done = function () { if (--pending <= 0) build(); };
    imgs.forEach(function (im) {
      if (im.complete) done();
      else { im.addEventListener("load", done); im.addEventListener("error", done); }
    });
  }

  /* --- Capabilities --- */
  function renderCapabilities() {
    var el = mount("capabilities");
    if (!el) return;
    el.className = "capabilities";
    el.innerHTML = SITE.capabilities
      .map(function (c, i) {
        var num = String(i + 1).padStart(2, "0");
        return (
          '<div class="capability">' +
          '<span class="capability__num">' + num + "</span>" +
          "<h3>" + esc(c.title) + "</h3>" +
          "<p>" + esc(c.note) + "</p>" +
          "</div>"
        );
      })
      .join("");
  }

  /* --- Testimonial --- */
  function renderTestimonial() {
    var el = mount("testimonial");
    if (!el || !SITE.testimonials.length) return;
    var t = SITE.testimonials[0];
    el.className = "quote";
    el.innerHTML =
      '<blockquote class="quote__text">' + esc(t.text) + "</blockquote>" +
      '<p class="quote__author">' + esc(t.author) +
      (t.detail ? " — " + esc(t.detail) : "") + "</p>";
  }

  /* --- Footer --- */
  function renderFooter() {
    var el = mount("footer");
    if (!el) return;
    var socials = SITE.socials
      .map(function (s) {
        return '<a href="' + esc(s.href) + '" rel="noopener">' + esc(s.label) + "</a>";
      })
      .join("");
    el.className = "site-footer";
    el.innerHTML =
      '<div class="container site-footer__grid">' +
      '<p class="site-footer__cta">Let&rsquo;s <a href="mailto:' + esc(SITE.email) + '">work together</a>.</p>' +
      '<div class="site-footer__meta">' +
      '<a href="mailto:' + esc(SITE.email) + '">' + esc(SITE.email) + "</a>" +
      '<div class="site-footer__socials">' + socials + "</div>" +
      "</div></div>" +
      '<div class="container site-footer__bottom">' +
      "<span>" + esc(SITE.location) + ' &middot; <span data-clock>--:--</span> WAT</span>' +
      "<span>&copy; <span data-year></span> " + esc(SITE.name) + "</span>" +
      "</div>";
  }

  /* Fill simple text slots like [data-fill="email"]. */
  function fillSlots() {
    document.querySelectorAll("[data-fill]").forEach(function (node) {
      var key = node.dataset.fill;
      if (SITE[key] != null) node.textContent = SITE[key];
    });
    document.querySelectorAll('[data-href="email"]').forEach(function (node) {
      node.setAttribute("href", "mailto:" + SITE.email);
    });
    var pmount = document.querySelector("[data-portrait-mount]");
    if (pmount && SITE.portrait) {
      var img = document.createElement("img");
      img.src = SITE.portrait;
      img.alt = "Portrait of " + SITE.name;
      pmount.appendChild(img); // sits on top of (and hides) the placeholder
      var label = pmount.querySelector(".hero-noir__media-label");
      if (label) label.remove();
    }
  }

  renderNav();
  renderMenu();
  renderClients();
  renderWork();
  renderCapabilities();
  renderTestimonial();
  renderFooter();
  fillSlots();
})();
