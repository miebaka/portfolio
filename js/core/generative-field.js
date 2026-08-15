/* generative-field.js — sets up the home-page point-field and hands the drawing
   to a worker.

   The heavy loop lives in generative-field.worker.js on its own thread via an
   OffscreenCanvas, so it never costs the main thread a frame. This module owns
   only the DOM-side concerns a worker can't see: the accessibility gates, the
   theme, the viewport size, tab visibility, and — crucially — deferring the
   whole thing until after load so it never competes with the hero LCP.

   Progressive enhancement: where OffscreenCanvas or module workers are missing,
   the field simply never appears. It is decoration; the page is complete without it. */

const RES = 0.6;                 /* buffer resolution vs the viewport; scaled up by CSS */
const CLAY = [212, 90, 20];      /* a touch warmer than --clay (#C2531C), for the core tint */

function dims() {
  return [
    Math.max(1, Math.floor(window.innerWidth * RES)),
    Math.max(1, Math.floor(window.innerHeight * RES)),
  ];
}

function inkColour() {
  return document.documentElement.dataset.theme === "dark"
    ? [237, 233, 225]   /* paper — light points on the dark ground */
    : [22, 20, 15];     /* ink  — dark points on paper */
}

export function initGenerativeField() {
  if (document.body.dataset.page !== "home") return;

  /* Capability gate: needs an OffscreenCanvas that can be transferred to a worker. */
  if (!("OffscreenCanvas" in window) ||
      typeof HTMLCanvasElement.prototype.transferControlToOffscreen !== "function") return;

  /* Accessibility gate: honour reduced motion, reduced transparency, and a
     request for more contrast — any of them means "calm the page down". */
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.matchMedia("(prefers-reduced-transparency: reduce)").matches ||
      window.matchMedia("(prefers-contrast: more)").matches) return;

  const canvas = document.createElement("canvas");
  canvas.className = "generative-field";
  canvas.setAttribute("aria-hidden", "true");
  document.body.prepend(canvas);

  let worker = null;

  function boot() {
    try {
      const off = canvas.transferControlToOffscreen();
      const [w, h] = dims();
      worker = new Worker(new URL("./generative-field.worker.js", import.meta.url), { type: "module" });
      worker.postMessage(
        { type: "init", canvas: off, width: w, height: h, ink: inkColour(), clay: CLAY },
        [off]
      );

      window.addEventListener("resize", () => {
        const [rw, rh] = dims();
        worker.postMessage({ type: "resize", width: rw, height: rh });
      }, { passive: true });

      document.addEventListener("visibilitychange", () => {
        worker.postMessage({ type: "run", on: !document.hidden });
      });

      new MutationObserver(() => {
        worker.postMessage({ type: "theme", ink: inkColour() });
      }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    } catch (e) {
      /* Anything from the transfer or worker load failing: drop the layer and
         leave the page exactly as it would be without the field. */
      canvas.remove();
    }
  }

  /* Defer until the page has loaded and the main thread is idle, so building the
     worker never steals time from the hero image (the LCP) or first input. */
  const defer = (cb) => ("requestIdleCallback" in window)
    ? requestIdleCallback(cb, { timeout: 2000 })
    : setTimeout(cb, 400);

  if (document.readyState === "complete") defer(boot);
  else window.addEventListener("load", () => defer(boot), { once: true });
}
