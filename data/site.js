/* Compatibility facade while renderers migrate to the content domains. */
import { siteConfig } from "./site-config.js";
import { navigation } from "./navigation.js";
import { projects } from "./projects.js";
import { caseStudies } from "./case-studies.js";
import { services } from "./services.js";
import { writing } from "./writing.js";
import { clients } from "./clients.js";

export const CONTENT = { siteConfig, navigation, projects, caseStudies, services, writing, clients };

export const SITE = {
  ...siteConfig,
  menu: navigation.primary,
  projects,
  caseStudies,
  capabilities: services,
  writing,
  clients
};
