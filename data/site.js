/* ==========================================================================
   Site data — single source of truth.
   Add a project, capability or social link here and the UI updates.
   Plain global (no build step) so the site runs from file:// or any server.
   ========================================================================== */

export const SITE = {
  name: "Miebaka Joshua",
  lastfmUser: "sheikmoujabaa",
  lastfmKey:  "127872bcf2ccc619e4fb52bb4b81805f",
  role: "Brand & visual designer",
  email: "miebakakiki@gmail.com",
  location: "Lagos, Nigeria",
  city: "Lagos",      // reserved — planned nav clock feature
  timezone: "WAT",    // reserved — planned nav clock feature

  /* Standard world-class sections, shown in the primary navigation.
     (Hero, proof strip and footer are intentionally omitted —
     they aren't navigation destinations.) */
  menu: [
    { label: "Work",       href: "work.html",       key: "work" },
    { label: "About",      href: "about.html",      key: "about" },
    { label: "Services",    href: "services.html",   key: "services" },
    { label: "Writing",    href: "playground.html", key: "playground" },
    { label: "Contact",    href: "contact.html",    key: "contact" },
  ],

  socials: [
    { label: "Behance",   href: "https://behance.net/miebaka" },
    { label: "LinkedIn",  href: "https://linkedin.com/in/miebakajoshua" },
    { label: "Instagram", href: "https://www.instagram.com/sheikmoujabaa" },
    { label: "Twitter",   href: "https://www.x.com/sheikmoujabaa" },
  ],

  /* Writing — articles shown on the Writing page.
     Add each article here; the renderer picks it up automatically.
     - title:       Article headline
     - href:        Full URL (external blog) or path (e.g. "writing/slug.html")
     - date:        ISO 8601 date string — "YYYY-MM-DD"
     - summary:     One or two sentences shown on the card
     - readingTime: Optional — e.g. "5 min read" */
  writing: [
    {
      title: "When the Swoosh Lost Its Soul",
      href:  "writing/when-the-swoosh-lost-its-soul.html",
      date:  "2026-06-15",
      summary: "How Nike’s creative and commercial decisions weakened its cultural value.",
      readingTime: "10 min read",
    },
    {
      title: "Making the World More Accessible",
      href:  "writing/designing-for-disability-in-nigeria.html",
      date:  "2023-09-29",
      summary: "What designing for millions of Nigerians with disabilities asks of the people shaping products and places.",
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
      tagline: "A software studio positioned around access, built to feel useful before it feels technical.",
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
      slug: "tedx-rsu",
      title: "TEDx RSU",
      category: "Event",
      tagline: "A global event system given a distinct pause-and-reflect rhythm.",
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
      tagline: "A food identity designed to feel warm, generous and ready to order.",
      tags: ["Brand identity", "Brand strategy", "Packaging"],
      year: "2022",
      tone: "#c2531c",
      cover: "chopbox-platter",
      span: 7, ratio: "16 / 10",
      featured: true,
    },
    {
      slug: "christian-poster-a-week",
      title: "Poster A Week",
      category: "Personal series",
      tagline: "One verse each week, reduced to one visual idea and said with conviction.",
      tags: ["Graphic design", "Art direction", "Typography"],
      year: "2024",
      tone: "#002080",
      cover: "",
      featured: false,
      caseReady: true,
    },
    {
      slug: "designing-for-disability-in-nigeria",
      title: "Designing for Disability",
      category: "Editorial",
      tagline: "An argument for designing Nigerian products and places around more of the people who use them.",
      tags: ["Writing", "Research", "Editorial design"],
      year: "2023",
      tone: "#4b68c8",
      cover: "disability-flying-stars",
      href: "writing/designing-for-disability-in-nigeria.html",
      featured: false,
      caseReady: true,
    },
    {
      slug: "when-the-swoosh-lost-its-soul",
      title: "When the Swoosh Lost Its Soul",
      category: "Brand critique",
      tagline: "A designer’s reading of the creative decisions that weakened Nike’s cultural value.",
      tags: ["Brand strategy", "Writing", "Creative critique"],
      year: "2026",
      tone: "#07112b",
      cover: "swoosh-dream-crazy",
      href: "writing/when-the-swoosh-lost-its-soul.html",
      featured: false,
      caseReady: true,
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
      tone: "#46516c",
      cover: "",
      span: 6, ratio: "4 / 3",
      featured: false,
      caseReady: false,
    },
  ],

  /* Brands shown in the client proof row. Add `logo: "assets/images/clients/<file>.svg"`
     to swap a wordmark for a real logo image (kept ≤48px tall automatically).

     `optical` is a small correction for differences in the marks' ink density.
     The renderer calculates the main scale from aspect ratio and equal area. */
  clients: [
    { name: "Anakle",                  logo: "assets/images/clients/anakle.svg",                    logoW: 217, logoH: 40 },
    { name: "Grey Finance",            logo: "assets/images/clients/grey-finance.svg",              logoW: 136, logoH: 40 },
    { name: "Rise",                    logo: "assets/images/clients/rise.svg",                      logoW: 128, logoH: 40, optical: 1.02 },
    { name: "Riv-TechCreek",           logo: "assets/images/clients/riv-techcreek.svg",            logoW:  40, logoH: 40, optical: 0.96 },
    { name: "WellaHealth Technologies",logo: "assets/images/clients/wellahealth-technologies.svg", logoW: 360, logoH: 40, optical: 1.03 },
    { name: "Celebration Church",      logo: "assets/images/clients/celebration-church.svg",       logoW: 163, logoH: 40 },
  ],

  /* Concise capabilities used on the homepage. */
  capabilities: [
    {
      title: "Brand identity",
      description: "Identity systems teams can understand, use and keep consistent.",
      preview: "rivo-in-use",
    },
    {
      title: "Brand strategy",
      description: "Positioning and messaging that make later decisions clearer.",
      preview: "rivo-in-use",
    },
    {
      title: "Visual & graphic design",
      description: "Campaigns and presentations built around one clear idea.",
      preview: "chopbox-platter",
    },
    {
      title: "Art direction",
      description: "A visual direction that keeps every asset in the same world.",
      preview: "tedx-rsu-campus-banner",
    },
    {
      title: "Print & production design",
      description: "Books, reports and packaging prepared for production and handoff.",
      preview: "chopbox-platter",
    },
  ],

  /* Case studies — one shared narrative template (Overview · Challenge · Process ·
     Solution · Outcome), rendered by js/render/case-study.js. Each case page is a
     thin shell: a static <head> (for SEO) + <article data-mount="case"> filled from
     the entry whose key matches the page's body[data-case]. `media` bands carry only
     placeholder labels until real imagery lands; `variants` map to .case-media--*. */
  caseStudies: {
    "christian-poster-a-week": {
      title: "A Christian Poster A Week",
      tagline: "One verse. One week. One visual argument.",
      rail: { servicesLabel: "What I did", services: "Graphic design, Art direction, Typography", metaLabel: "Type", meta: "Self-directed series" },
      facts: { context: "Self-directed weekly practice", role: "Concept, typography and graphic design", delivered: "A continuing poster series" },
      overview: {
        question: "Can scripture be designed with real craft?",
        body: ["Faith content online often falls back on stock symbolism and predictable type. I wanted to see what happened when scripture received the same conceptual and typographic rigour as a culture brand."],
      },
      challenge: ["Choose one verse, find its emotional centre and finish one poster every week. The deadline forces decisions; repetition builds the practice."],
      process: ["I reduce each verse to one visual argument, then build the typography, image treatment and composition around that single idea."],
      solution: ["One idea per poster. The visual language can change; the weekly constraint supplies the continuity."],
      applications: ["The work lives as a digital series designed to reward both a quick read and a closer look."],
      outcome: { body: ["The series remains an active laboratory for typography, conviction and conceptual speed."] },
      media: [],
      next: { slug: "rivo", title: "Rivo Studio" },
    },
    rivo: {
      title: "Rivo Studio",
      tagline: "A software studio positioned around access, built to feel useful before it feels technical.",
      rail: { servicesLabel: "What I did", services: "Brand identity, Brand strategy, Guidelines", metaLabel: "Industry", meta: "Software studio" },
      facts: { context: "In-house identity work at Rivo Studios", role: "Brand strategy, identity design and guidelines", delivered: "Identity system and rollout" },
      overview: {
        question: "How do you brand a software studio around access?",
        body: ["Rivo Studio builds software for people the category often designs past. The identity had to make access feel native to the brand, rather than a compliance claim added afterwards."],
      },
      challenge: [
        "Software brands often confuse capability with complexity. Rivo needed to signal technical confidence without looking clinical, crowded or difficult to use.",
        "Underneath that is a design problem, not a feature problem. Products get built without inclusivity in mind, which shuts out whole segments of the people they were meant to serve.",
      ],
      process: ["I built the identity around the pronunciation, /\u02c8ra\u026avo\u028a/, and a wordmark with the corners taken off: soft, low-contrast letterforms that read cleanly at small sizes and never feel clinical. Almarai carries the interface voice for the same reason."],
      solution: ["Clar, a full-strength #0000FF, anchors the system against a deep navy, with signal yellow reserved for the moment that matters on any given surface. One accent doing one job keeps a studio brand legible across a pitch deck, a hoodie and a flag."],
      applications: ["I carried the identity from the core guidelines into stationery, merchandise, flags and campaign applications, checking that the wordmark stayed legible at small sizes and against the strongest colour pairings."],
      outcome: {
        body: ["The identity was delivered across guidelines, stationery, merchandise, environmental graphics and campaign applications, giving the team a clear set of parts to keep using."],
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
      next: { slug: "tedx-rsu", title: "TEDx Rivers State University" },
    },

    "tedx-rsu": {
      title: "TEDx RSU",
      tagline: "A global event system given a distinct pause-and-reflect rhythm.",
      rail: { servicesLabel: "What I did", services: "Brand identity, Creative direction, Print", metaLabel: "Industry", meta: "Event" },
      facts: { context: "Identity commission for TEDx Rivers State University", role: "Identity design, creative direction and print", delivered: "Event identity and rollout" },
      overview: {
        question: "How do you honour a global brand while making it your own?",
        body: ["TEDx gives every event a strict global identity and asks each chapter to find its own character within it. The work had to feel unmistakably local without weakening the parent system."],
      },
      challenge: ["The identity needed one idea strong enough to hold across a phone, printed collateral and the event stage."],
      process: ["I worked within the TEDx rules, not around them. The red and wordmark stayed fixed; character came from type, motion and a local visual motif that could move from a phone to a stage backdrop."],
      solution: ["Print was part of the system from the start. The programme, signage and social creative needed to carry the same pause-and-reflect rhythm as the stage."],
      applications: ["The pause motif moved from social promotion into programmes, merchandise, campus banners and the event stage, with each format staying inside the TEDx parent rules."],
      outcome: {
        body: ["The event identity was delivered across social promotion, printed collateral, merchandise, campus signage and the stage environment while remaining recognisably TEDx."],
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
      tagline: "A food identity designed to feel warm, generous and ready to order.",
      rail: { servicesLabel: "What I did", services: "Brand identity, Brand strategy, Packaging", metaLabel: "Industry", meta: "Food brand" },
      facts: { context: "Independent brand identity commission", role: "Brand strategy, identity design and packaging", delivered: "Identity, packaging and rollout" },
      overview: {
        question: "How do you make a brand you’d order from twice?",
        body: ["ChopBox needed to feel warm, generous and immediately appetising: a food brand people could trust with dinner before the first order arrived."],
      },
      challenge: ["The identity had to make the food feel worth ordering, then hold together across packaging, uniforms, campaigns and social."],
      process: ["I built the brand from strategy out, checking every decision against one question: does this make you hungry? Warmth over neon; a friendly, rounded logotype over the loud reds every food app defaults to."],
      solution: ["I built the system for packaging from day one. A toasted, appetising palette steps away from the category’s loud reds, while the simple shapes and lockups survive the box as well as the screen."],
      applications: ["Packaging was the first stress test, followed by uniforms, campaign graphics and out-of-home. The same warm palette and rounded voice had to make food look appetising at every scale."],
      outcome: {
        body: ["The identity was delivered across packaging, uniforms, campaign graphics and out-of-home applications, giving the team a practical visual language for future products."],
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
