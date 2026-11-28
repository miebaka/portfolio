import { escapeHTML as esc } from "../utilities/dom.js";
import { renderNextEssayMarkup } from "../render/next-content.js";
import { initSectionLinks, replaceSectionHash } from "./section-links.js";
import { clearReadingPosition, initReadingResume, rememberReadingPosition } from "./reading-memory.js";

/* Progressive article navigation: the authored article remains complete without JS. */
const slugify = value => String(value || "section")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");

export function initArticleNavigation() {
  const article = document.querySelector(".article-body");
  const hero = document.querySelector(".article-hero");
  if (!article || !hero) return;

  const headings = [...article.querySelectorAll(".article-block > h2")];
  if (headings.length > 1) {
    headings.forEach((heading, index) => {
      if (!heading.id) heading.id = slugify(heading.textContent) || `section-${index + 1}`;
    });
    const wrapper = document.createElement("div");
    wrapper.className = "article-reading container";
    article.before(wrapper);
    const nav = document.createElement("nav");
    nav.className = "article-toc";
    nav.setAttribute("aria-label", "On this page");
    nav.innerHTML = '<p>On this page</p><ol>' + headings.map((heading, index) => '<li><a href="#' + esc(heading.id) + '"><span class="article-toc__index" aria-hidden="true">' + String(index + 1).padStart(2, "0") + '</span><strong class="article-toc__title">' + esc(heading.textContent) + '</strong></a></li>').join("") + "</ol>";
    wrapper.append(nav, article);
    initReadingResume({ root: wrapper });
    const links = [...nav.querySelectorAll("a")];
    let queued = false;
    const updateActive = () => {
      queued = false;
      // The current section is the last heading crossed near the top of the reading area.
      const line = Math.max(120, innerHeight * .28 + 24);
      let activeIndex = -1;
      headings.forEach((heading, index) => {
        if (heading.getBoundingClientRect().top <= line) activeIndex = index;
      });
      links.forEach((link, index) => {
        if (index === activeIndex) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
      if (activeIndex >= 0) {
        const heading = headings[activeIndex];
        replaceSectionHash(heading?.id);
        rememberReadingPosition(heading?.id, heading?.textContent.trim());
        if (activeIndex === headings.length - 1 && scrollY + innerHeight >= document.documentElement.scrollHeight - 120) clearReadingPosition();
      }
    };
    const scheduleActive = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(updateActive);
    };
    addEventListener("scroll", scheduleActive, { passive: true });
    addEventListener("resize", scheduleActive, { passive: true });
    updateActive();
    initSectionLinks({ root: article, headingSelector: ".article-block > h2" });
  }

  // The authored/build-time continuation works without JavaScript.
  if (!document.querySelector(".next-content")) {
    const markup = renderNextEssayMarkup(location.pathname);
    if (markup) (document.querySelector(".article-reading") || article).insertAdjacentHTML("afterend", markup);
  }

  const progress = document.createElement("div");
  progress.className = "article-progress";
  progress.setAttribute("aria-hidden", "true");
  document.body.append(progress);
  if (CSS.supports("animation-timeline: scroll()")) {
    progress.classList.add("article-progress--native");
    return;
  }
  let frame = 0;
  const update = () => {
    frame = 0;
    const start = hero.offsetTop + hero.offsetHeight;
    const end = article.offsetTop + article.offsetHeight - innerHeight;
    const ratio = Math.max(0, Math.min(1, (scrollY - start) / Math.max(1, end - start)));
    progress.style.transform = `scaleX(${ratio})`;
  };
  addEventListener("scroll", () => { if (!frame) frame = requestAnimationFrame(update); }, { passive: true });
  addEventListener("resize", update, { passive: true });
  update();
}
