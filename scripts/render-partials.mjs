import { navigation } from "../data/navigation.js";
import { siteConfig } from "../data/site-config.js";

const escapeHTML = value => String(value ?? "").replace(/[&<>"]/g, character => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;"
})[character]);

const routesFor = placement => navigation.routes.filter(route => route.includeIn.includes(placement));

export function renderHeader({ base = "", page = "" } = {}) {
  const links = routesFor("primary").filter(route => route.key !== "contact").map(route =>
    `<a class="site-nav__link" href="${base}${escapeHTML(route.href)}"${route.key === page ? ' aria-current="page"' : ""}>${escapeHTML(route.label)}</a>`
  ).join("");
  return `<header class="site-nav" data-mount="nav"><div class="site-nav__inner"><div class="site-nav__leading"><a class="site-nav__brand" href="${base}index.html" aria-label="${escapeHTML(siteConfig.name)}, home"><img class="nav-logo" src="${base}assets/images/miebaka-joshua-logo.svg" alt="" width="40" height="40"></a></div><nav class="reference-nav-links" aria-label="Primary">${links}</nav><a class="reference-nav-contact" href="${base}contact.html">Let’s talk</a></div></header>`;
}

export function renderFooter({ base = "" } = {}) {
  const explore = routesFor("footer").map(route => `<a href="${base}${escapeHTML(route.href)}">${escapeHTML(route.label)}</a>`).join("");
  const socials = siteConfig.socials.filter(item => ["Behance", "LinkedIn", "Instagram", "X"].includes(item.label)).map(item =>
    `<a href="${escapeHTML(item.href)}" target="_blank" rel="noopener noreferrer">${escapeHTML(item.label)}</a>`
  ).join("");
  const subject = "mailto:" + siteConfig.email + "?subject=Let%27s%20work%20together";
  return `<footer class="site-footer" data-mount="footer">
    <div class="site-footer__top"><p class="site-footer__eyebrow">Have something worth making?</p><h2>Let’s find the idea.</h2><a class="site-footer__start" href="${escapeHTML(subject)}">Start a conversation</a></div>
    <div class="site-footer__panel">
      <p class="site-footer__statement">Ideas made unmistakable.<span>Design made to last.</span></p>
      <nav class="site-footer__groups" aria-label="Footer">
        <div class="site-footer__group site-footer__explore"><div class="site-footer__links" aria-label="Explore">${explore}</div></div>
        <div class="site-footer__group site-footer__socials"><div class="site-footer__links" aria-label="Social">${socials}</div></div>
      </nav>
    </div>
    <div class="site-footer__signature" aria-hidden="true"></div>
  </footer>`;
}

export function normalizeHead(source, { canonicalUrl, base = "" } = {}) {
  return source
    .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${escapeHTML(canonicalUrl)}">`)
    .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${escapeHTML(canonicalUrl)}">`)
    .replaceAll("https://miebaka-portfolio.vercel.app/", siteConfig.canonicalUrl)
    .replace(/<meta name="theme-color" media="\(prefers-color-scheme: dark\)" content="[^"]*">/, '<meta name="theme-color" media="(prefers-color-scheme: dark)" content="oklch(35.7% 0.159 264.8)">')
    .replace(/(<link rel="icon"[^>]*>)/, `$1\n  <link rel="manifest" href="${base}manifest.webmanifest">`)
    .replace(/<link rel="preload" as="font"[^>]*>/, `<link rel="preload" as="font" type="font/woff2" href="https://cdn.jsdelivr.net/npm/geist@1.9.2/dist/fonts/geist-sans/Geist-Regular.woff2" crossorigin>`);
}
