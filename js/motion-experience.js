/* Native-scroll enhancement: Lenis and GSAP share a single animation clock.
   Loaded only on desktop with motion enabled, never in the initial JS graph.
   The page remains entirely navigable if this bundle fails to load. */
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function mountMotionExperience({ doc = document, win = window } = {}) {
  const root = doc.documentElement;
  const nav = doc.querySelector(".site-index");
  const lenis = new Lenis({
    autoRaf: false,
    anchors: true,
    autoToggle: true,
    smoothWheel: true,
    syncTouch: false,
    duration: 1.0,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    wheelMultiplier: 0.9,
    respectReducedMotion: true,
    prevent: node => Boolean(node.closest?.(
      "[data-lenis-prevent], [role='dialog'], [contenteditable='true']"
    )),
  });

  const onScroll = () => ScrollTrigger.update();
  const ticker = seconds => lenis.raf(seconds * 1000);
  lenis.on("scroll", onScroll);
  gsap.ticker.add(ticker);
  gsap.ticker.lagSmoothing(0);

  const animations = [];
  // Content remains legible even before JS: no blanket opacity-zero reveals.
  const targets = [
    ".swiss-selected .swiss-section-head",
    ".home-profile__introduction",
    ".home-close > :first-child",
    ".project-archive__head",
    ".project-archive__collections",
    ".project-archive__progress-head",
  ];
  for (const selector of targets) {
    for (const element of doc.querySelectorAll(selector)) {
      const trigger = ScrollTrigger.create({
        trigger: element,
        start: "top 90%",
        once: true,
        onEnter: () => {
          const tween = gsap.fromTo(element,
            { y: 18, opacity: .88 },
            { y: 0, opacity: 1, duration: .78, ease: "power3.out",
              overwrite: "auto", clearProps: "transform,opacity" });
          animations.push(tween);
        },
      });
      animations.push(trigger);
    }
  }

  let stopped = false;
  const onVisibility = () => {
    if (doc.hidden) { lenis.stop(); stopped = true; }
    else if (stopped) { lenis.start(); stopped = false; ScrollTrigger.refresh(); }
  };
  doc.addEventListener("visibilitychange", onVisibility);
  if (nav) nav.setAttribute("data-lenis-prevent", "");
  ScrollTrigger.refresh();
  root.dataset.scrollEngine = "lenis-gsap";

  return {
    lenis,
    destroy() {
      doc.removeEventListener("visibilitychange", onVisibility);
      animations.forEach(animation => animation.kill());
      gsap.ticker.remove(ticker);
      lenis.off("scroll", onScroll);
      lenis.destroy();
      nav?.removeAttribute("data-lenis-prevent");
      delete root.dataset.scrollEngine;
    },
  };
}
