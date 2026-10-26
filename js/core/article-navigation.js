/* Progressive article navigation: the authored article remains complete without JS. */
const slugify = value => String(value || "section")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");

const ARTICLES = {
  "designing-for-disability-in-nigeria.html": {
    title: "When the Swoosh Lost Its Soul",
    href: "when-the-swoosh-lost-its-soul.html",
    context: "Next note · Brand critique"
  },
  "when-the-swoosh-lost-its-soul.html": {
    title: "Making the World More Accessible",
    href: "designing-for-disability-in-nigeria.html",
    context: "Next note · Design and access"
  }
};

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
    nav.innerHTML = '<p>On this page</p><ol>' + headings.map((heading, index) => '<li><a href="#' + heading.id + '"><span>' + String(index + 1).padStart(2, "0") + '</span>' + heading.textContent + '</a></li>').join("") + "</ol>";
    wrapper.append(nav, article);
  }

  const current = location.pathname.split("/").pop();
  const next = ARTICLES[current];
  if (next) {
    const section = document.createElement("aside");
    section.className = "article-next container";
    section.setAttribute("aria-label", "Next article");
    section.innerHTML = '<p>' + next.context + '</p><a href="' + next.href + '">' + next.title + '<span aria-hidden="true">↗</span></a>';
    (document.querySelector(".article-reading") || article).after(section);
  }

  const progress = document.createElement("div");
  progress.className = "article-progress";
  progress.setAttribute("aria-hidden", "true");
  document.body.append(progress);
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
