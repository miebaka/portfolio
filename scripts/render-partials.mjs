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
  const links = routesFor("primary").map(route =>
    `<a class="site-nav__link" href="${base}${escapeHTML(route.href)}"${route.key === page ? ' aria-current="page"' : ""}>${escapeHTML(route.label)}</a>`
  ).join("");
  return `<header class="site-nav" data-mount="nav"><div class="site-nav__inner"><a class="site-nav__brand" href="${base}index.html" aria-label="${escapeHTML(siteConfig.name)}, home"><img class="nav-logo" src="${base}assets/images/miebaka-joshua-logo.svg" alt="" width="40" height="40"></a><button class="site-nav__menu-btn" type="button" aria-expanded="false" aria-controls="site-index">Index</button><nav class="site-nav__links" id="site-nav-links" aria-label="Primary">${links}</nav><div class="site-nav__themes"><span class="theme-cord__prompt" aria-hidden="true">Pull</span><button class="theme-cord" type="button" role="switch" aria-checked="false" aria-label="Switch to Screen mode"><svg viewBox="0 0 68 58" width="68" height="58" aria-hidden="true"><path class="theme-cord__line" data-cord-line fill="none"></path><path data-cord-hit fill="none" stroke="transparent" stroke-width="18"></path><g class="theme-cord__bead" data-cord-bead><circle r="10" fill="transparent"></circle><rect x="-4" y="-1" width="8" height="13" rx="4"></rect></g></svg><span class="theme-cord__mode" data-cord-mode>Print</span></button></div></div></header>`;
}

export function renderFooter({ base = "" } = {}) {
  const explore = routesFor("footer").map(route => `<a href="${base}${escapeHTML(route.href)}">${escapeHTML(route.label)}</a>`).join("");
  const socials = siteConfig.socials.filter(item => ["LinkedIn", "Instagram", "X"].includes(item.label)).map(item =>
    `<a href="${escapeHTML(item.href)}" target="_blank" rel="noopener noreferrer">${escapeHTML(item.label)}</a>`
  ).join("");
  return `<footer class="site-footer" data-mount="footer"><div class="site-footer__panel"><nav class="site-footer__groups" aria-label="Footer"><div class="site-footer__group site-footer__explore"><div class="site-footer__links" aria-label="Explore">${explore}</div></div><div class="site-footer__group site-footer__socials"><div class="site-footer__links" aria-label="Social">${socials}</div></div></nav></div><div class="site-footer__signature" aria-hidden="true"></div></footer>`;
}

export function normalizeHead(source, { canonicalUrl, base = "" } = {}) {
  return source
    .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${escapeHTML(canonicalUrl)}">`)
    .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${escapeHTML(canonicalUrl)}">`)
    .replaceAll("https://miebaka-portfolio.vercel.app/", siteConfig.canonicalUrl)
    .replace(/<meta name="theme-color" media="\(prefers-color-scheme: dark\)" content="[^"]*">/, '<meta name="theme-color" media="(prefers-color-scheme: dark)" content="oklch(35.7% 0.159 264.8)">')
    .replace(/(<link rel="icon"[^>]*>)/, `$1\n  <link rel="manifest" href="${base}manifest.webmanifest">`)
    .replace(/<link rel="preload" as="font"[^>]*>/, `<link rel="preload" as="font" type="font/ttf" href="${base}assets/fonts/AtkinsonHyperlegibleNext-Variable.ttf" crossorigin>`);
}
