/* ==========================================================================
   Site data — single source of truth.
   Add a project, skill, testimonial or social here and the UI updates.
   Plain global (no build step) so the site runs from file:// or any server.
   ========================================================================== */

export const SITE = {
  name: "Miebaka Joshua",
  lastfmUser: "sheikmoujabaa",
  lastfmKey:  "127872bcf2ccc619e4fb52bb4b81805f",
  role: "Brand & visual designer",
  email: "hello@miebaka.design",
  location: "Lagos, Nigeria",
  city: "Lagos",      // reserved — planned nav clock feature
  timezone: "WAT",    // reserved — planned nav clock feature
  availability: "Open to remote roles worldwide",

  /* Standard world-class sections, shown in the fullscreen menu.
     (Hero, proof strip, testimonials and footer are intentionally omitted —
     they aren't navigation destinations.) */
  menu: [
    { label: "Work",       href: "work.html",       key: "work" },
    { label: "About",      href: "about.html",      key: "about" },
    { label: "Services",   href: "services.html",   key: "services" },
    { label: "Playground", href: "playground.html", key: "playground" },
    { label: "Contact",    href: "contact.html",    key: "contact" },
  ],

  socials: [
    { label: "Behance",   href: "https://behance.net/miebaka" },
    { label: "LinkedIn",  href: "https://linkedin.com/in/miebakajoshua" },
    { label: "Instagram", href: "https://www.instagram.com/sheikmoujabaa" },
    { label: "Twitter",   href: "https://www.x.com/sheikmoujabaa" },
  ],

  /* Writing — articles shown on the Playground page.
     Add each article here; the renderer picks it up automatically.
     - title:       Article headline
     - href:        Full URL (external blog) or path (e.g. "writing/slug.html")
     - date:        ISO 8601 date string — "YYYY-MM-DD"
     - summary:     One or two sentences shown on the card
     - tag:         Category label (e.g. "Brand Strategy", "Process", "Design Thinking")
     - readingTime: Optional — e.g. "5 min read" */
  writing: [
    {
      title: "When The Swoosh Lost Its Soul",
      href:  "writing/when-the-swoosh-lost-its-soul.html",
      date:  "2026-06-15",
      summary: "Nike has spent four consecutive years destroying shareholder value. A close read of how creative decisions became a $180 billion financial problem.",
      tag:  "Brand Strategy",
      readingTime: "10 min read",
    },
    {
      title: "Making the World More Accessible",
      href:  "writing/designing-for-disability-in-nigeria.html",
      date:  "2023-09-29",
      summary: "At least 20 million Nigerians live with a disability. What that means for designers, and why building inclusively makes better products for everyone.",
      tag:  "Inclusive Design",
      readingTime: "8 min read",
    },
  ],

  /* Projects power the work grid and link to case studies.
     `slug` matches a file in /work (e.g. work/rivo.html).
     `tone` is the tile colour shown until a `cover` image is added —
     this is intentional: the work supplies the colour. */
  projects: [
    {
      slug: "rivo",
      title: "Rivo Studio",
      category: "Software studio",
      tagline: "Software that simply works for all.",
      tags: ["Brand identity", "Brand strategy", "Guidelines"],
      year: "2025",
      /* Sampled from the vision and mission cards in the brand deck, which is
         where the identity uses its largest flat field. */
      tone: "#000041",
      cover: "rivo-in-use",
      span: 7, ratio: "4 / 3", // masonry layout
      featured: true,
    },
    {
      slug: "christian-poster-a-week",
      title: "Poster A Week",
      category: "Personal series",
      tagline: "Scripture, reimagined as bold weekly graphic design.",
      tags: ["Graphic design", "Art direction", "Typography"],
      year: "2024",
      tone: "#1d4ed8",
      cover: "",
      span: 5, ratio: "3 / 4",
      featured: true,
    },
    {
      slug: "tedx-rsu",
      title: "TEDx RSU",
      category: "Event",
      tagline: "A global stage, made unmistakably local.",
      tags: ["Brand identity", "Creative direction", "Print"],
      year: "2023",
      /* Porphyra, the dominant of the three theme colours. */
      tone: "#6e2962",
      cover: "tedx-rsu-campus-banner",
      span: 5, ratio: "4 / 3",
      featured: true,
    },
    {
      slug: "chopbox",
      title: "ChopBox",
      category: "Food brand",
      tagline: "An identity as warm and crave-able as the food.",
      tags: ["Brand identity", "Brand strategy", "Packaging"],
      year: "2022",
      tone: "#c2531c",
      cover: "chopbox-platter",
      span: 7, ratio: "16 / 10",
      featured: true,
    },
    {
      slug: "kiki-joshua-notepad",
      title: "Kiki-Joshua",
      category: "Print",
      tagline: "Considered print for a notable physician.",
      tags: ["Creative direction", "Print design"],
      year: "2022",
      tone: "#3f3f46",
      cover: "",
      span: 6, ratio: "1 / 1",
      featured: false,
      caseReady: false,
    },
    {
      slug: "kigoma-hotels",
      title: "Kigoma Hotels",
      category: "Hospitality",
      tagline: "A hospitality interface with quiet confidence.",
      tags: ["UI design", "Product design"],
      year: "2021",
      tone: "#0f766e",
      cover: "",
      span: 6, ratio: "4 / 3",
      featured: false,
      caseReady: false,
    },
  ],

  /* Brands shown in the scrolling logo bar. Add `logo: "assets/images/clients/<file>.svg"`
     to swap a wordmark for a real logo image (kept ≤48px tall automatically).

     `scale` optically balances the row. The bar sizes every mark to the same
     HEIGHT, which is the wrong yardstick for a logo wall: a 9:1 wordmark and a
     1:1 monogram set to equal height do not carry equal visual weight — the
     wide one dominates and the compact one vanishes. `scale` corrects toward
     equal weight, not equal box: wide marks come down, the square monogram
     comes up. Roughly indexed to aspect ratio (wider → smaller). Default 1. */
  clients: [
    { name: "Anakle",                  logo: "assets/images/clients/anakle.svg",                    logoW: 217, logoH: 40, scale: 0.76 },
    { name: "Grey Finance",            logo: "assets/images/clients/grey-finance.svg",              logoW: 136, logoH: 40, scale: 0.95 },
    { name: "Rise",                    logo: "assets/images/clients/rise.svg",                      logoW: 128, logoH: 40, scale: 1.05 },
    { name: "Riv-TechCreek",           logo: "assets/images/clients/riv-techcreek.svg",            logoW:  40, logoH: 40, scale: 1.15 },
    { name: "WellaHealth Technologies",logo: "assets/images/clients/wellahealth-technologies.svg", logoW: 360, logoH: 40, scale: 0.72 },
    { name: "Celebration Church",      logo: "assets/images/clients/celebration-church.svg",       logoW: 163, logoH: 40, scale: 0.88 },
  ],

  capabilities: [
    { title: "Brand identity",        meta: "A system your team can grow into." },
    { title: "Brand strategy",        meta: "The thinking that makes the design inevitable." },
    { title: "Visual & graphic design", meta: "Creative that earns attention before it asks for anything." },
    { title: "Art direction",         meta: "Standards that survive the brief." },
    { title: "Editorial design",      meta: "Print that earns its weight." },
  ],

  testimonials: [
    {
      text: "",
      author: "",
      detail: "",
    },
  ],

  /* Case studies — one shared narrative template (Overview · Challenge · Process ·
     Solution · Outcome), rendered by js/render/case-study.js. Each case page is a
     thin shell: a static <head> (for SEO) + <article data-mount="case"> filled from
     the entry whose key matches the page's body[data-case]. `media` bands carry only
     placeholder labels until real imagery lands; `variants` map to .case-media--*. */
  caseStudies: {
    rivo: {
      title: "Rivo Studio",
      tagline: "Software that simply works for all.",
      rail: { servicesLabel: "What I did", services: "Brand identity, Brand strategy, Guidelines", metaLabel: "Industry", meta: "Software studio" },
      overview: {
        question: "How do you brand a software studio around access?",
        body: ["Rivo Studio builds software for people the category tends to design past. The brand had to carry that position without turning accessibility into a compliance badge."],
      },
      challenge: [
        "The software market is oversaturated with clunky, uninspired products that feel more like obstacles than tools. Most of them prioritise feature density over usability, which leaves people frustrated and drained.",
        "Underneath that is a design problem, not a feature problem. Products get built without inclusivity in mind, which shuts out whole segments of the people they were meant to serve.",
      ],
      process: ["I built the identity around the pronunciation, /\u02c8ra\u026avo\u028a/, and a wordmark with the corners taken off: soft, low-contrast letterforms that read cleanly at small sizes and never feel clinical. Almarai carries the interface voice for the same reason."],
      solution: ["Clar, a full-strength #0000FF, anchors the system against a deep navy, with signal yellow reserved for the moment that matters on any given surface. One accent doing one job keeps a studio brand legible across a pitch deck, a hoodie and a flag."],
      outcome: {
        body: ["The system runs from stationery to out-of-home without a redraw, and the accessibility argument stayed in the work rather than in a footnote."],
        metrics: [
          { value: "1", label: "System, deck to signage" },
          { value: "#0000FF", label: "Clar, the single accent" },
          { value: "1 in 10", label: "Nigerians the work speaks to" },
        ],
      },
      media: [
        { label: "The wordmark", src: "rivo-wordmark", w: 3840, h: 3080,
          alt: "The Rivo wordmark in black, centred on a full field of signal yellow." },
        { label: "Colour", src: "rivo-palette", w: 2800, h: 2240,
          alt: "The Clar swatch at hex 0000FF beside four progressively lighter tints." },
        { label: "Stationery", src: "rivo-stationery", w: 2800, h: 2240,
          alt: "Business cards with a blue-to-yellow gradient face, fanned across dark cloth." },
        { label: "Guidelines", src: "rivo-guidelines", w: 1240, h: 995,
          alt: "The printed Rivo brand guidelines, cover facing up." },
        { label: "Identity in use", src: "rivo-in-use", w: 3840, h: 3080,
          alt: "A commuter in headphones using a phone, the yellow Rivo wordmark set over the scene." },
        { label: "Merchandise", src: "rivo-tote", w: 1240, h: 995,
          alt: "A black tote bag reading Software that simply works for all, in yellow." },
        { label: "On stage", src: "rivo-stage", w: 1240, h: 995,
          alt: "A conference screen reading From village squares to virtual spaces." },
        { label: "Environmental", src: "rivo-flag", w: 1240, h: 995,
          alt: "A blue Rivo flag against open sky, reading Software that simply works for all." },
      ],
      next: { slug: "christian-poster-a-week", title: "A Christian Poster A Week" },
    },

    "christian-poster-a-week": {
      title: "A Christian Poster A Week",
      tagline: "One poster a week. Scripture as bold graphic design.",
      rail: { servicesLabel: "What I did", services: "Graphic design, Art direction, Typography", metaLabel: "Type", meta: "Self-directed series" },
      overview: {
        question: "Can scripture be designed with real craft?",
        body: ["Faith content online is visually tired: soft gradients, stock doves, predictable type. I wanted to prove a verse could be designed with the same edge as a culture brand."],
      },
      challenge: ["So I set a rule: one poster, every week. A fixed format and a hard deadline that would force decisions and build a recognisable body of work."],
      process: ["Every week I chose a verse, found its single emotional idea, and built a poster around it: concept, typography, image treatment and finish. The constraint was the point."],
      solution: ["One idea per poster, said loudly. Expressive, varied typography (condensed, serif, display) held together by a consistent grid, with real craft on every finish."],
      outcome: {
        body: ["A growing, recognisable body of work that doubles as my most reliable proof of range, and a habit that keeps my craft sharp."],
        metrics: [
          { value: "52", label: "Posters a year, by design" },
          { value: "1/wk", label: "Self-imposed cadence" },
          { value: "∞", label: "Range, on display" },
        ],
      },
      media: [
        { label: "Poster series, hero", variants: [] },
        { label: "Type & image treatments", variants: ["light"] },
        { label: "The series", variants: ["tall", "dark"] },
      ],
      next: { slug: "tedx-rsu", title: "TEDx Rivers State University" },
    },

    "tedx-rsu": {
      title: "TEDx RSU",
      tagline: "A global stage, made unmistakably local.",
      rail: { servicesLabel: "What I did", services: "Brand identity, Creative direction, Print", metaLabel: "Industry", meta: "Event" },
      overview: {
        question: "How do you honour a global brand while making it your own?",
        body: ["TEDx carries a strict global identity, yet every event needs its own character. The brief was to build something that honoured the TEDx system while capturing the spirit of Rivers State University."],
      },
      challenge: ["And it had to hold up everywhere: on stage, in print, and on a phone screen, without falling apart."],
      process: ["Work within the TEDx rules, not around them. The red and wordmark stay sacred; character comes from type, motion and a local visual motif: one system that scaled from a phone to a stage backdrop."],
      solution: ["Print was treated as a first-class citizen: tactile, considered collateral that matched the on-stage experience across programme, signage and social."],
      outcome: {
        body: ["A cohesive event brand that felt premium and on-system, applied consistently across every touchpoint on the day."],
        metrics: [
          { value: "1", label: "System, every surface" },
          { value: "On-brand", label: "TEDx guidelines met" },
          { value: "Stage to print", label: "Full collateral suite" },
        ],
      },
      media: [
        { label: "Logomark", src: "tedx-rsu-logomark", w: 1240, h: 496,
          alt: "The primary pause logomark, set above the line Reflect, Reconsider, Reward." },
        { label: "Colour", src: "tedx-rsu-palette", w: 3840, h: 2194,
          alt: "The three theme colours, Porphyra, Kakhol and Red ochre, each shown as a tint ramp." },
        { label: "Pattern", src: "tedx-rsu-pattern", w: 1240, h: 1550,
          alt: "The ripple pattern: concentric rings radiating outward across a magenta field." },
        { label: "Typeface", src: "tedx-rsu-typeface", w: 1240, h: 1550,
          alt: "A poster reading Remember to stay pause-itive, set in Neue Haas Grotesk." },
        { label: "Merchandise", src: "tedx-rsu-merch", w: 2800, h: 4200,
          alt: "A white hoodie printed with the pause logomark, worn with headphones." },
        { label: "Street banners", src: "tedx-rsu-street-banner", w: 1240, h: 1860,
          alt: "A street pole banner asking what lessons you would tell your ten-year-old self." },
        { label: "On campus", src: "tedx-rsu-campus-banner", w: 1240, h: 744,
          alt: "A campus banner reading Would you like to pause for a minute?" },
        { label: "Event day", src: "tedx-rsu-event", w: 3840, h: 3072,
          alt: "Two attendees standing either side of the red TEDx X on the day of the conference." },
      ],
      next: { slug: "chopbox", title: "ChopBox" },
    },

    chopbox: {
      title: "ChopBox",
      tagline: "An identity as warm and crave-able as the food.",
      rail: { servicesLabel: "What I did", services: "Brand identity, Brand strategy, Packaging", metaLabel: "Industry", meta: "Food brand" },
      overview: {
        question: "How do you make a brand you’d order from twice?",
        body: ["Food brands live or die on appetite appeal. ChopBox needed to feel warm, generous and instantly crave-able: the kind of brand you trust with dinner."],
      },
      challenge: ["And it had to stay flexible enough to run across packaging, app and social without ever losing its flavour."],
      process: ["I built the brand from strategy out, checking every decision against one question: does this make you hungry? Warmth over neon; a friendly, rounded logotype over the loud reds every food app defaults to."],
      solution: ["Built for packaging from day one: a system designed to survive the box, not just the screen, with a toasted, appetising palette that owns its category."],
      outcome: {
        body: ["An appetising, ownable identity with a system the team could extend across products and packaging."],
        metrics: [
          { value: "1", label: "System, app to packaging" },
          { value: "Ownable", label: "Distinct in a loud category" },
          { value: "Ready", label: "Built to scale" },
        ],
      },
      media: [
        { label: "The Chop Platter", src: "chopbox-platter", w: 1080, h: 1080,
          alt: "A hand holding a foil tray of samosas and puff-puff, framed by the yellow dotted Chop Platter device." },
        { label: "Logo system", src: "chopbox-logo-lockups", w: 3840, h: 2160,
          alt: "Three ChopBox lockups in yellow and red on black: full logo, wordmark, and the CB monogram." },
        { label: "Colour", src: "chopbox-palette", w: 3840, h: 2160,
          alt: "The ChopBox palette: Deepfry Yellow, Fireside Red, black and white, each with usage notes." },
        { label: "Typeface", src: "chopbox-typeface", w: 853, h: 480,
          alt: "DM Sans shown as a full character set in black on Deepfry Yellow." },
        { label: "Packaging", src: "chopbox-packaging", w: 3500, h: 3000,
          alt: "A red lid for The Chop Dip pepper sauce, shown against black." },
        { label: "Uniform", src: "chopbox-apron", w: 3840, h: 3840,
          alt: "A red ChopBox apron printed with the line Hello, I am the chef." },
        { label: "Campaign", src: "chopbox-campaign", w: 2248, h: 3200,
          alt: "A campaign poster reading Abobi, chop life, make life no chop you, surrounded by flying small chops." },
        { label: "Out of home", src: "chopbox-billboard", w: 2800, h: 4000,
          alt: "A ChopBox advert wrapped around a water tower against a blue sky." },
      ],
      next: { slug: "rivo", title: "Rivo" },
    },
  },
};
