/* ==========================================================================
   Site data — single source of truth.
   Add a project, skill, testimonial or social here and the UI updates.
   Plain global (no build step) so the site runs from file:// or any server.
   ========================================================================== */

window.SITE = {
  name: "Miebaka Joshua",
  role: "Brand & visual designer",
  email: "hello@miebaka.design",
  location: "Lagos, Nigeria",
  city: "Lagos", // shown in the nav clock
  timezone: "Africa/Lagos", // WAT (UTC+1)
  availability: "Open to remote roles worldwide",
  portrait: "assets/images/miebaka-joshua-portrait.jpg", // fills the hero's right third

  /* Standard world-class sections, shown in the fullscreen menu.
     (Hero, proof strip, testimonials and footer are intentionally omitted —
     they aren't navigation destinations.) */
  menu: [
    { label: "Work", href: "work.html", key: "work" },
    { label: "About", href: "about.html", key: "about" },
    { label: "Services", href: "index.html#capabilities", key: "services" },
    { label: "Contact", href: "index.html#contact", key: "contact" },
  ],

  socials: [
    { label: "Behance", href: "https://behance.net/miebaka" },
    { label: "LinkedIn", href: "https://linkedin.com/in/miebakajoshua" },
    { label: "Instagram", href: "https://instagram.com/" },
    { label: "Twitter", href: "https://twitter.com/" },
  ],

  /* Projects power the work grid and link to case studies.
     `slug` matches a file in /work (e.g. work/rivo.html).
     `tone` is the tile colour shown until a `cover` image is added —
     this is intentional: the work supplies the colour. */
  projects: [
    {
      slug: "rivo",
      title: "Rivo",
      category: "Fintech",
      tagline: "A financial brand built on warmth, not cold blue.",
      tags: ["Brand identity", "Brand strategy", "Guidelines"],
      year: "2023",
      tone: "#1f4d3a",
      cover: "", // e.g. "assets/images/rivo-cover.jpg"
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
      tone: "#b91c1c",
      cover: "",
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
      cover: "",
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
    },
  ],

  /* Brands shown in the scrolling logo bar. Add `logo: "assets/images/clients/<file>.svg"`
     to swap a wordmark for a real logo image (kept ≤48px tall automatically). */
  clients: [
    { name: "Anakle", logo: "assets/images/clients/anakle.svg" },
    { name: "Grey Finance", logo: "assets/images/clients/grey-finance.svg" },
    { name: "Rise", logo: "assets/images/clients/rise.svg" },
    { name: "Riv-TechCreek", logo: "assets/images/clients/riv-techcreek.svg" },
    { name: "WellaHealth Technologies", logo: "assets/images/clients/wellahealth-technologies.svg" },
  ],

  capabilities: [
    { title: "Brand identity", note: "Logotypes, systems and the rules that hold them together." },
    { title: "Brand strategy", note: "Positioning and the why beneath every visual decision." },
    { title: "Visual & graphic design", note: "Posters, campaigns and expressive typographic work." },
    { title: "Art direction", note: "Setting and protecting the creative standard across a project." },
    { title: "Editorial design", note: "Long-form layout, print and considered type." },
  ],

  testimonials: [
    {
      text: "He questions every decision until the idea underneath is sound — then makes it beautiful.",
      author: "A collaborator",
      detail: "Add a real client quote here",
    },
  ],
};
