/* Source-only project drafts. This file is intentionally excluded from the
   production build until each project has real imagery and a finished case. */
export const DRAFTS = {
  projects: [
    {
      slug: "christian-poster-a-week",
      title: "Poster A Week",
      category: "Personal series",
      tagline: "One verse each week, reduced to one visual idea and said with conviction.",
      tags: ["Graphic design", "Art direction", "Typography"],
      year: "2024",
    },
  ],
  caseStudies: {
    "christian-poster-a-week": {
      title: "A Christian Poster A Week",
      tagline: "One verse. One week. One visual argument.",
      rail: { servicesLabel: "What I did", services: "Graphic design, Art direction, Typography", metaLabel: "Type", meta: "Self-directed series" },
      overview: {
        question: "Can scripture be designed with real craft?",
        body: ["Faith content online often falls back on soft gradients, stock symbolism and predictable type. I wanted to see what happened when scripture received the same conceptual and typographic rigour as a culture brand."],
      },
      challenge: ["Choose one verse, find its emotional centre and finish one poster every week. The deadline forced decisions; the repetition built a recognisable practice."],
      process: ["Choose a verse, find its single emotional idea, then build the concept, typography, image treatment and finish around it."],
      solution: ["One idea per poster. Typography, image treatment and composition can change; the weekly constraint supplies the continuity."],
      outcome: { body: ["Hold this draft until the finished posters can demonstrate the claim."] },
      next: { slug: "tedx-rsu", title: "TEDx Rivers State University" },
    },
  },
};
