/* Chapter navigation follows the reading position, including reverse scroll. */
export function initCaseRail() {
  const rail = document.querySelector('.case-rail');
  if (!rail) return;
  const links = [...rail.querySelectorAll('a[href^="#"]')];
  const chapters = links.map(link => document.getElementById(link.hash.slice(1))).filter(Boolean);
  if (!chapters.length) return;
  let frame = 0;
  const update = () => {
    frame = 0;
    const readingLine = Math.max(120, window.innerHeight * .35);
    const firstCopy = chapters[0].querySelector('.case-chapter__copy') || chapters[0];
    rail.hidden = firstCopy.getBoundingClientRect().top > readingLine;
    let current = chapters[0].id;
    for (const chapter of chapters) {
      const copy = chapter.querySelector('.case-chapter__copy') || chapter;
      if (copy.getBoundingClientRect().top <= readingLine) current = chapter.id;
    }
    for (const link of links) {
      if (link.hash === '#' + current) link.setAttribute('aria-current', 'step');
      else link.removeAttribute('aria-current');
    }
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  addEventListener('pageshow', schedule);
  update();
}
