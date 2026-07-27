/* ==========================================================================
   split-text.js — line-masked type reveal.

   Wraps every word of a [data-split] element in a clipping span so the word
   can rise from behind its own baseline. Words that share a visual line share
   an animation delay, so the effect reads as whole lines unmasking in
   sequence — the editorial reveal — while the DOM stays word-based and
   therefore survives rewrapping at any viewport width.

   Why words and not lines: rebuilding real line wrappers destroys inline
   markup (<em>, <a>) that spans a line break. Wrapping words preserves the
   original element tree exactly; line grouping is derived afterwards from
   measured offsetTop.

   Progressive enhancement: if this never runs, the text is plain and visible.
   The reveal is opt-in via CSS that only applies once .is-split is present.
   ========================================================================== */

const WORD_CLASS  = "word";
const INNER_CLASS = "word__i";

/* Text nodes that are pure whitespace carry the inter-word gaps — they must
   stay as text nodes so inline-block words space naturally. */
function splitTextNode(node) {
  const parts = node.textContent.split(/(\s+)/);
  if (parts.length === 1 && !parts[0].trim()) return [];

  const frag  = document.createDocumentFragment();
  const words = [];

  for (const part of parts) {
    if (!part) continue;
    if (!part.trim()) {
      frag.appendChild(document.createTextNode(part));
      continue;
    }
    const outer = document.createElement("span");
    outer.className = WORD_CLASS;
    const inner = document.createElement("span");
    inner.className = INNER_CLASS;
    inner.textContent = part;
    outer.appendChild(inner);
    frag.appendChild(outer);
    words.push(outer);
  }

  node.parentNode.replaceChild(frag, node);
  return words;
}

/* Punctuation that follows a closing inline tag — the full stop in
   "look <em>decided</em>." — arrives as its own text node and would become a
   standalone inline-block word, free to wrap onto a line by itself. Fold any
   punctuation-only word back into the word before it. */
const PUNCT_ONLY = /^[.,;:!?…)\]}"'’”»]+$/;

function mergeOrphanPunctuation(words) {
  const kept = [];
  for (const w of words) {
    const prev = kept[kept.length - 1];
    if (prev && PUNCT_ONLY.test(w.textContent)) {
      prev.querySelector("." + INNER_CLASS).textContent += w.textContent;
      /* Drop the trailing whitespace node the orphan left behind, so the
         merged punctuation doesn't gain a space in front of it. */
      const gap = w.previousSibling;
      if (gap && gap.nodeType === Node.TEXT_NODE && !gap.textContent.trim()) gap.remove();
      w.remove();
      continue;
    }
    kept.push(w);
  }
  return kept;
}

/* Depth-first walk, collecting text nodes first so the tree isn't mutated
   while it's being traversed. */
function collectTextNodes(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes  = [];
  let n;
  while ((n = walker.nextNode())) {
    if (n.textContent.trim()) nodes.push(n);
  }
  return nodes;
}

function split(el) {
  /* Keep the pristine markup so a resize can re-split from source rather
     than re-splitting already-split output. */
  if (el.dataset.splitSource == null) el.dataset.splitSource = el.innerHTML;
  else el.innerHTML = el.dataset.splitSource;

  try {
    let words = [];
    for (const node of collectTextNodes(el)) words.push(...splitTextNode(node));
    words = mergeOrphanPunctuation(words);

    /* Group by measured vertical position — words on the same line share a
       delay, so the reveal reads by line without line wrappers existing. */
    let line = -1;
    let lastTop = null;
    for (const w of words) {
      const top = w.offsetTop;
      if (lastTop === null || Math.abs(top - lastTop) > 2) {
        line += 1;
        lastTop = top;
      }
      w.style.setProperty("--line-i", String(line));
    }
  } finally {
    /* Always mark split, even if measuring threw. CSS hides an unsplit
       [data-split] to prevent a flash of unmasked type, so failing to set
       this would leave the heading permanently invisible. */
    el.classList.add("is-split");
  }
}

export function initSplitText() {
  const els = document.querySelectorAll("[data-split]");
  if (!els.length) return;

  /* Reduced motion: leave the markup untouched. Without .is-split the CSS
     reveal never engages, so the text simply renders as normal type. */
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  /* Fonts change metrics, which changes where lines break. Splitting before
     the webfont lands would group words into the wrong lines. */
  const ready = document.fonts ? document.fonts.ready : Promise.resolve();
  ready.then(() => {
    els.forEach(split);

    /* Re-measure line grouping when the element rewraps. Only the delays
       change; re-splitting from source keeps this idempotent.

       Guarded by width because the callback mutates the very elements it
       observes: re-splitting can nudge the element's box, which fires the
       observer again, which re-splits. Line breaks only change when the
       width changes, so anything else is noise and is dropped. Without this
       the pair can trade frames indefinitely. */
    const widths = new WeakMap();
    els.forEach((el) => widths.set(el, el.getBoundingClientRect().width));

    let frame = 0;
    const ro = new ResizeObserver((entries) => {
      const changed = entries.filter((e) => {
        const w = e.contentRect.width;
        if (Math.abs((widths.get(e.target) || 0) - w) < 1) return false;
        widths.set(e.target, w);
        return true;
      });
      if (!changed.length) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        changed.forEach(({ target }) => {
          split(target);
          widths.set(target, target.getBoundingClientRect().width);
        });
      });
    });
    els.forEach((el) => ro.observe(el));
  });
}
