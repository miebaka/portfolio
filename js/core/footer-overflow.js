export function initFooterOverflow() {
  const row = document.querySelector(".site-footer__groups");
  if (!row) return;
  const update = () => {
    row.dataset.overflowStart = String(row.scrollLeft > 8);
    row.dataset.overflowEnd = String(row.scrollLeft + row.clientWidth < row.scrollWidth - 8);
  };
  const current = row.querySelector('[aria-current="page"]');
  if (current && row.scrollWidth > row.clientWidth)
    row.scrollLeft = Math.max(0, current.offsetLeft - (row.clientWidth - current.offsetWidth) / 2);
  row.addEventListener("scroll", update, { passive: true });
  addEventListener("resize", update, { passive: true });
  update();
}
