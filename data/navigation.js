/* One registry; placements are views of the same route records. */
const routes = [
  { key: "home", label: "Home", href: "index.html", includeIn: ["build", "sitemap"] },
  { key: "work", label: "Work", href: "work.html", includeIn: ["primary", "index", "footer", "build", "sitemap"] },
  { key: "about", label: "About", href: "about.html", includeIn: ["primary", "index", "footer", "build", "sitemap"] },
  { key: "explorations", label: "Experiments", href: "explorations.html", includeIn: ["primary", "index", "footer", "build", "sitemap"] },
  { key: "writing", label: "Notes", href: "playground.html", includeIn: ["primary", "index", "footer", "build", "sitemap"] },
  { key: "contact", label: "Contact", href: "contact.html", includeIn: ["primary", "index", "footer", "build", "sitemap"] },
  { key: "experiments-legacy", label: "Experiments", href: "community.html", includeIn: ["build"] },
  { key: "services", label: "Services", href: "services.html", includeIn: ["build", "sitemap"] },
  { key: "privacy", label: "Privacy", href: "privacy.html", includeIn: ["footer", "build", "sitemap"] },
  { key: "not-found", label: "Page not found", href: "404.html", includeIn: ["build"] }
];

export const navigation = {
  routes,
  primary: routes.filter(route => route.includeIn.includes("primary")),
  index: routes.filter(route => route.includeIn.includes("index")),
  footer: routes.filter(route => route.includeIn.includes("footer"))
};
