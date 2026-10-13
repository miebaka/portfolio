import { PROJECT_STATUS } from "../data/projects.js";

const isRecord = value => value !== null && typeof value === "object" && !Array.isArray(value);
const hasText = value => typeof value === "string" && value.trim().length > 0;
const isSlug = value => typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
const routePath = value => typeof value === "string" ? value.replace(/^\.\//, "").split(/[?#]/)[0] : "";
const validRoute = value => hasText(value) && /^(?:\.\/)?[a-z0-9_-]+(?:\/[a-z0-9_-]+)*\.html(?:[?#][^\s]*)?$/.test(value);
const positiveInteger = value => Number.isInteger(value) && value > 0;
const validHttpsUrl = value => {
  if (!hasText(value) || !/^https:\/\//i.test(value) || /[\s\\\u0000-\u001f]/.test(value)) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && Boolean(url.hostname) && !url.username && !url.password;
  } catch { return false; }
};
const validDate = value => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

/** Pure validation: report every error without normalizing or mutating content. */
export function validateContent(content) {
  const errors = [];
  const add = (path, code, message) => errors.push({ path, code, message });
  if (!isRecord(content)) return { ok: false, errors: [{ path: "content", code: "CONTENT_INVALID", message: "Content must be an object." }] };

  if (!isRecord(content.siteConfig)) add("siteConfig", "SITE_CONFIG_INVALID", "Site configuration must be an object.");
  else {
    for (const field of ["name", "role", "location"]) if (!hasText(content.siteConfig[field])) add(`siteConfig.${field}`, "SITE_FIELD_REQUIRED", `Site ${field} is required.`);
    const canonical = content.siteConfig.canonicalUrl;
    if (!validHttpsUrl(canonical) || new URL(canonical).href !== new URL(canonical).origin + "/") add("siteConfig.canonicalUrl", "SITE_CANONICAL_INVALID", "A canonical HTTPS origin ending in a slash is required.");
    if (typeof content.siteConfig.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(content.siteConfig.email)) add("siteConfig.email", "SITE_EMAIL_INVALID", "A valid contact email is required.");
    if (!Array.isArray(content.siteConfig.socials)) add("siteConfig.socials", "SOCIALS_INVALID", "Social links must be an array.");
    else content.siteConfig.socials.forEach((social, index) => {
      const path = `siteConfig.socials[${index}]`;
      if (!isRecord(social)) { add(path, "SOCIAL_INVALID", "A social link must be an object."); return; }
      if (!hasText(social.label)) add(`${path}.label`, "SITE_FIELD_REQUIRED", "Social links need a label.");
      if (!validHttpsUrl(social.href)) add(`${path}.href`, "SOCIAL_URL_INVALID", "Social links need a valid HTTPS URL without credentials.");
    });
  }

  if (!Array.isArray(content.services)) add("services", "SERVICES_INVALID", "Services must be an array.");
  else content.services.forEach((service, index) => {
    const path = `services[${index}]`;
    if (!isRecord(service)) { add(path, "SERVICE_INVALID", "A service must be an object."); return; }
    for (const field of ["title", "description", "preview"]) if (!hasText(service[field])) add(`${path}.${field}`, "SERVICE_FIELD_REQUIRED", `Service ${field} is required.`);
  });

  if (!Array.isArray(content.writing)) add("writing", "WRITING_INVALID", "Writing must be an array.");
  else content.writing.forEach((entry, index) => {
    const path = `writing[${index}]`;
    if (!isRecord(entry)) { add(path, "WRITING_ENTRY_INVALID", "A writing entry must be an object."); return; }
    for (const field of ["title", "summary"]) if (!hasText(entry[field])) add(`${path}.${field}`, "WRITING_FIELD_REQUIRED", `Writing ${field} is required.`);
    if (!validRoute(entry.href) && !validHttpsUrl(entry.href)) add(`${path}.href`, "WRITING_URL_INVALID", "Writing needs a local HTML route or a valid HTTPS URL without credentials.");
    if (!validDate(entry.date)) add(`${path}.date`, "WRITING_DATE_INVALID", "Writing needs a real calendar date in YYYY-MM-DD format.");
    if (entry.readingTime !== undefined && !hasText(entry.readingTime)) add(`${path}.readingTime`, "WRITING_FIELD_REQUIRED", "Reading time must contain text when provided.");
  });

  if (!Array.isArray(content.clients)) add("clients", "CLIENTS_INVALID", "Client proof must be an array.");
  else content.clients.forEach((client, index) => {
    const path = `clients[${index}]`;
    if (!isRecord(client)) { add(path, "CLIENT_INVALID", "A client must be an object."); return; }
    if (!hasText(client.name)) add(`${path}.name`, "CLIENT_NAME_REQUIRED", "Client proof needs a name.");
    if (client.logo !== undefined) {
      if (typeof client.logo !== "string" || !/^assets\/images\/(?:[a-z0-9_-]+\/)*[a-z0-9_-]+\.(?:svg|png|jpe?g|webp|avif)$/i.test(client.logo)) add(`${path}.logo`, "CLIENT_LOGO_INVALID", "Client logos must use a local image asset path without traversal.");
      for (const field of ["logoW", "logoH"]) if (!positiveInteger(client[field])) add(`${path}.${field}`, "CLIENT_DIMENSIONS_INVALID", "Client logo dimensions must be positive integers.");
    }
    if (client.optical !== undefined && (!Number.isFinite(client.optical) || client.optical <= 0)) add(`${path}.optical`, "CLIENT_OPTICAL_INVALID", "Optical correction must be a positive number.");
  });

  if (!isRecord(content.navigation)) add("navigation", "NAVIGATION_INVALID", "Navigation must contain route groups.");
  else if (content.navigation.routes === undefined) add("navigation.routes", "ROUTES_INVALID", "A canonical route registry array is required.");
  if (isRecord(content.navigation)) for (const [group, routes] of Object.entries(content.navigation)) {
    if (!Array.isArray(routes)) { add(`navigation.${group}`, "ROUTES_INVALID", "A navigation group must be an array."); continue; }
    const seen = new Set();
    const keys = new Set();
    routes.forEach((route, index) => {
      const path = `navigation.${group}[${index}].href`;
      if (!validRoute(route?.href)) { add(path, "ROUTE_INVALID", "Routes must be local HTML paths without traversal."); return; }
      if (group === "routes") {
        const recordPath = `navigation.routes[${index}]`;
        if (!isSlug(route.key)) add(`${recordPath}.key`, "ROUTE_KEY_INVALID", "A registry route needs a lowercase, hyphenated key.");
        else if (keys.has(route.key)) add(`${recordPath}.key`, "ROUTE_KEY_DUPLICATE", `Duplicate route key: ${route.key}.`);
        keys.add(route.key);
        if (!hasText(route.label)) add(`${recordPath}.label`, "ROUTE_FIELD_REQUIRED", "A registry route needs a label.");
        const placements = ["primary", "index", "footer", "build", "sitemap"];
        if (!Array.isArray(route.includeIn) || !route.includeIn.length || route.includeIn.some(placement => !placements.includes(placement)) || new Set(route.includeIn).size !== route.includeIn.length) add(`${recordPath}.includeIn`, "ROUTE_PLACEMENT_INVALID", "Route placements must be unique known placements.");
        else if (route.includeIn.some(placement => placement !== "build") && !route.includeIn.includes("build")) add(`${recordPath}.includeIn`, "ROUTE_BUILD_REQUIRED", "Public route placements need a build destination.");
        if (route.href !== routePath(route.href)) add(path, "ROUTE_CANONICAL_INVALID", "Registry routes need one canonical HTML path without fragments or queries.");
      }
      const destination = routePath(route.href);
      if (seen.has(destination)) add(path, "ROUTE_DUPLICATE", `Duplicate route: ${destination}.`);
      seen.add(destination);
    });
  }

  const projects = Array.isArray(content.projects) ? content.projects : [];
  const studies = isRecord(content.caseStudies) ? content.caseStudies : {};
  if (!Array.isArray(content.projects)) add("projects", "PROJECTS_INVALID", "Projects must be an array.");
  if (!isRecord(content.caseStudies)) add("caseStudies", "CASE_STUDIES_INVALID", "Case studies must be keyed by project slug.");
  const seenSlugs = new Set();
  projects.forEach((project, index) => {
    const path = `projects[${index}]`;
    if (!isRecord(project)) { add(path, "PROJECT_INVALID", "A project must be an object."); return; }
    if (!isSlug(project.slug)) add(`${path}.slug`, "PROJECT_SLUG_INVALID", "A project needs a lowercase, hyphenated slug.");
    else if (seenSlugs.has(project.slug)) add(`${path}.slug`, "PROJECT_SLUG_DUPLICATE", `Duplicate project slug: ${project.slug}.`);
    seenSlugs.add(project.slug);
    if (!Object.values(PROJECT_STATUS).includes(project.status)) add(`${path}.status`, "PROJECT_STATUS_INVALID", "Use published, coming-soon or private.");
    for (const field of ["title", "category", "tagline", "year", "tone"]) {
      if (!hasText(project[field])) add(`${path}.${field}`, "PROJECT_FIELD_REQUIRED", `Project ${field} is required.`);
    }
    if (!Array.isArray(project.tags) || !project.tags.length || project.tags.some(tag => !hasText(tag))) add(`${path}.tags`, "PROJECT_TAGS_INVALID", "Project tags must contain text.");
    if (typeof project.featured !== "boolean") add(`${path}.featured`, "PROJECT_FEATURED_INVALID", "Featured must be a boolean.");
    if (typeof project.cover !== "string") add(`${path}.cover`, "PROJECT_FIELD_REQUIRED", "Cover must be a media stem or an empty string.");
    if (project.href !== undefined && !validRoute(project.href)) add(`${path}.href`, "ROUTE_INVALID", "Project links must use local HTML routes.");
    const isArticle = validRoute(project.href) && routePath(project.href).startsWith("writing/");
    if (project.status === PROJECT_STATUS.PUBLISHED && !isArticle && !isRecord(studies[project.slug])) add(`${path}.slug`, "PUBLISHED_CASE_MISSING", "A published project must have a case study or a direct writing route.");
  });

  for (const [slug, study] of Object.entries(studies)) {
    const path = `caseStudies.${slug}`;
    if (!isRecord(study)) { add(path, "CASE_STUDY_INVALID", "A case study must be an object."); continue; }
    const project = projects.find(item => item?.slug === slug);
    if (!project) add(path, "CASE_PROJECT_MISSING", "The case study must belong to a project.");
    if (!["draft", "published"].includes(study.status)) add(`${path}.status`, "CASE_STATUS_INVALID", "Use draft or published for narrative readiness.");
    if (study.status === "published" && project?.status !== PROJECT_STATUS.PUBLISHED) add(`${path}.status`, "CASE_PROJECT_NOT_PUBLISHED", "A published narrative needs a published project listing.");
    for (const field of ["title", "tagline"]) if (!hasText(study[field])) add(`${path}.${field}`, "CASE_FIELD_REQUIRED", `Case study ${field} is required.`);
    if (study.next !== undefined) {
      const nextProject = projects.find(item => item?.slug === study.next?.slug);
      if (!nextProject) add(`${path}.next.slug`, "NEXT_PROJECT_MISSING", "Next must reference an existing project.");
      else if (nextProject.status === PROJECT_STATUS.PRIVATE) add(`${path}.next.slug`, "NEXT_PROJECT_PRIVATE", "Next cannot expose a private project.");
      else if (!isRecord(studies[nextProject.slug]) || routePath(nextProject.href).startsWith("writing/")) add(`${path}.next.slug`, "NEXT_CASE_MISSING", "Next must reference a project with a usable case-study destination.");
    }
    if (!Array.isArray(study.media)) { add(`${path}.media`, "MEDIA_INVALID", "Case media must be an array."); continue; }
    study.media.forEach((media, index) => {
      const mediaPath = `${path}.media[${index}]`;
      if (!isRecord(media)) { add(mediaPath, "MEDIA_INVALID", "A media item must be an object."); return; }
      for (const field of ["label", "src"]) if (!hasText(media[field])) add(`${mediaPath}.${field}`, "MEDIA_FIELD_REQUIRED", `Media ${field} is required.`);
      for (const field of ["w", "h"]) if (!Number.isInteger(media[field]) || media[field] <= 0) add(`${mediaPath}.${field}`, "MEDIA_DIMENSIONS_INVALID", "Media dimensions must be positive integers.");
      if (!hasText(media.alt)) add(`${mediaPath}.alt`, "MEDIA_ALT_REQUIRED", "Media needs a meaningful alternative.");
      if (media.loading !== undefined && !["lazy", "eager"].includes(media.loading)) add(`${mediaPath}.loading`, "MEDIA_LOADING_INVALID", "Use lazy or eager loading.");
    });
  }
  return errors.length ? { ok: false, errors } : { ok: true, value: content };
}
