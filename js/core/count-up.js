/* count-up.js — case-study outcome metrics count from zero into view.

   Each .case-metric value ("800,000", "76%", "$281B", "3.2x") is parsed into an
   optional prefix, a number, and an optional suffix; only the number animates,
   and the original formatting (thousands separators, decimals) is preserved.
   Fires once per metric via IntersectionObserver. Reduced motion shows the
   final value immediately. */

const DURATION = 900;
const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

/* "800,000" -> {prefix:"", num:800000, suffix:"", commas:true, decimals:0}
   Only genuine numeric metrics count: a short currency/comparator prefix and a
   short unit suffix are allowed, so values like a hex colour ("#0FF") or a ratio
   ("1 in 10") are left untouched. */
function parse(raw) {
  const m = String(raw).match(/^(\D*?)([\d][\d.,]*)(\D*)$/);
  if (!m) return null;
  if (!/^[$€£~<>+-]?$/.test(m[1])) return null;          /* prefix: currency / comparator only */
  if (!/^\+?[%xKMB]?\+?$/i.test(m[3])) return null;       /* suffix: %, x, K, M, B, + only */
  const numStr = m[2];
  const commas = numStr.includes(",");
  const decimals = numStr.includes(".") ? numStr.split(".")[1].length : 0;
  const num = parseFloat(numStr.replace(/,/g, ""));
  if (Number.isNaN(num)) return null;
  return { prefix: m[1], suffix: m[3], num, commas, decimals };
}

function format(value, p) {
  const fixed = value.toFixed(p.decimals);
  const body = p.commas ? Number(fixed).toLocaleString("en-US", {
    minimumFractionDigits: p.decimals,
    maximumFractionDigits: p.decimals,
  }) : fixed;
  return p.prefix + body + p.suffix;
}

function run(el, p) {
  const start = performance.now();
  function tick(now) {
    const t = Math.min((now - start) / DURATION, 1);
    el.textContent = format(p.num * easeOutExpo(t), p);
    if (t < 1) requestAnimationFrame(tick);
    else el.textContent = format(p.num, p); /* land exactly on the real value */
  }
  requestAnimationFrame(tick);
}

export function initCountUp() {
  const els = [...document.querySelectorAll(".case-metric strong")];
  if (!els.length) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      obs.unobserve(entry.target);
      const p = entry.target._countup;
      if (p) run(entry.target, p);
    });
  }, { threshold: 0.6 });

  els.forEach((el) => {
    const p = parse(el.textContent);
    if (!p) return;                 /* leave non-numeric values ("Ongoing") alone */
    if (reduce) return;             /* keep the real value, no animation */
    el._countup = p;
    el.textContent = format(0, p);  /* start at zero without a layout jump */
    io.observe(el);
  });
}
