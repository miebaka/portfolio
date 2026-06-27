/* ==========================================================================
   main.js — behaviour: js-flag, scroll reveals, mobile nav, sticky nav state,
   live WAT clock, current year, and a graceful contact-form handler.
   Runs after render.js so the data-driven DOM already exists.
   ========================================================================== */
(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.remove("no-js");
  root.classList.add("has-js");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --- Scroll reveal --- */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
    );
    items.forEach(function (el) { io.observe(el); });
  }

  /* --- Sticky nav state: solid after the (dark) hero, hairline elsewhere --- */
  function initNav() {
    var nav = document.querySelector(".site-nav");
    if (!nav) return;
    var darkTop = document.body.dataset.navTheme === "dark";
    var onScroll = function () {
      var threshold = darkTop ? window.innerHeight * 0.85 : 8;
      nav.classList.toggle("is-scrolled", window.scrollY > threshold);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
  }

  /* --- Fullscreen menu: open/close, Escape, focus return, scroll lock --- */
  function initMenu() {
    var openBtn = document.querySelector("[data-menu-open]");
    var menu = document.getElementById("site-menu");
    if (!openBtn || !menu) return;
    var lastFocus = null;

    function onKey(e) { if (e.key === "Escape") close(); }
    function open() {
      lastFocus = document.activeElement;
      menu.classList.add("is-open");
      document.body.classList.add("menu-open");
      openBtn.setAttribute("aria-expanded", "true");
      var closeBtn = menu.querySelector("[data-menu-close]");
      if (closeBtn) closeBtn.focus();
      document.addEventListener("keydown", onKey);
    }
    function close() {
      menu.classList.remove("is-open");
      document.body.classList.remove("menu-open");
      openBtn.setAttribute("aria-expanded", "false");
      document.removeEventListener("keydown", onKey);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    openBtn.addEventListener("click", open);
    menu.querySelectorAll("[data-menu-close]").forEach(function (el) {
      el.addEventListener("click", close);
    });
    menu.querySelectorAll(".site-menu__list a, .site-menu__cta").forEach(function (a) {
      a.addEventListener("click", close);
    });
  }

  /* --- Live clock (WAT) + current year --- */
  function initClock() {
    var clockEls = document.querySelectorAll("[data-clock]");
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
    if (!clockEls.length) return;

    var tz = (window.SITE && window.SITE.timezone) || "Africa/Lagos";
    var fmt;
    try {
      fmt = new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit", minute: "2-digit", hour12: false, timeZone: tz,
      });
    } catch (e) {
      fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
    }
    var tick = function () {
      var time = fmt.format(new Date());
      clockEls.forEach(function (el) { el.textContent = time; });
    };
    tick();
    setInterval(tick, 30000);
  }

  /* --- Contact form: progressive, no backend required ---
     Defaults to a mailto: handoff so the form works on a static host.
     Swap in a real endpoint (Formspree, Netlify Forms, etc.) when ready. */
  function initForm() {
    var form = document.querySelector(".contact__form");
    if (!form) return;
    var status = form.querySelector(".form-status");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var name = (data.get("name") || "").toString().trim();
      var email = (data.get("email") || "").toString().trim();
      var message = (data.get("message") || "").toString().trim();
      if (!name || !email) {
        if (status) status.textContent = "Add your name and email so I can reply.";
        return;
      }
      var to = (window.SITE && window.SITE.email) || "hello@miebaka.design";
      var subject = encodeURIComponent("Project enquiry from " + name);
      var body = encodeURIComponent(message + "\n\n— " + name + " (" + email + ")");
      window.location.href = "mailto:" + to + "?subject=" + subject + "&body=" + body;
      if (status) status.textContent = "Opening your email app…";
    });
  }

  initReveal();
  initNav();
  initMenu();
  initClock();
  initForm();
})();
