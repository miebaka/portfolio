import { gsap } from "../../node_modules/gsap/index.js";
import { ScrollTrigger } from "../../node_modules/gsap/ScrollTrigger.js";

const REDUCE = "(prefers-reduced-motion: reduce)";
const DESKTOP = "(min-width: 900px)";

export function initMotionDirector() {
  if (matchMedia(REDUCE).matches) return;
  gsap.registerPlugin(ScrollTrigger);

  const context = gsap.context(() => {
    const heroCopy = document.querySelectorAll(".hero-noir__statement, .hero-noir__identity, .hero-noir__cta");
    if (heroCopy.length) {
      const opening = gsap.timeline({ defaults: { ease: "power3.out" } });
      opening.fromTo(heroCopy, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: .62, stagger: .065, clearProps: "transform,opacity" });
    }

    gsap.utils.toArray(".section-head, .swiss-section-head, .disciplines-heading").forEach((heading) => {
      gsap.fromTo(heading, { "--rule-scale": 0 }, {
        "--rule-scale": 1,
        duration: .7,
        ease: "power3.out",
        scrollTrigger: { trigger: heading, start: "top 90%", once: true },
      });
    });

    if (matchMedia(DESKTOP).matches) {
      const preview = document.querySelector(".home-work-preview");
      const index = document.querySelector(".home-work-index");
      if (preview && index) {
        ScrollTrigger.create({
          trigger: index,
          start: "top 18%",
          end: "bottom 78%",
          pin: preview,
          pinSpacing: false,
          invalidateOnRefresh: true,
        });
      }
    }

    gsap.utils.toArray(".case-shot img").forEach((image) => {
      gsap.fromTo(image, { y: 24, scale: 1.015 }, {
        y: 0,
        scale: 1,
        duration: .72,
        ease: "power3.out",
        scrollTrigger: { trigger: image, start: "top 94%", once: true },
      });
    });
  });

  window.addEventListener("pagehide", () => context.revert(), { once: true });
}
