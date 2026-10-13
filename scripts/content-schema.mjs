import { PROJECT_STATUS } from "../data/projects.js";

const isRecord = value => value !== null && typeof value === "object" && !Array.isArray(value);
const hasText = value => typeof value === "string" && value.trim().length > 0;
const isSlug = value => typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
const routePath = value => typeof value === "string" ? value.replace(/^\.\//, "").split(/[?#]/)[0] : "";
const validRoute = value => hasText(value) && /^(?:\.\/)?[a-z0-9_-]+(?:\/[a-z0-9_-]+)*\.html(?:[?#][^\s]*)?$/.test(value);

/** Pure validation: report every error without normalizing or mutating content. */
export function validateContent(content) {
  const errors = [];
  const add = (path, code, message) => errors.push({ path, code, message });
  if (!isRecord(content)) return { ok: false, errors: [{ path: "content", code: "CONTENT_INVALID", message: "Content must be an object." }] };

  if (!isRecord(content.navigation)) add("navigation", "NAVIGATION_INVALID", "Navigation must contain route groups.");
  else for (const [group, routes] of Object.entries(content.navigation)) {
    if (!Array.isArray(routes)) { add(`navigation.${group}`, "ROUTES_INVALID", "A navigation group must be an array."); continue; }
    const seen = new Set();
    routes.forEach((route, index) => {
      const path = `navigation.${group}[${index}].href`;
      if (!validRoute(route?.href)) { add(path, "ROUTE_INVALID", "Routes must be local HTML paths without traversal."); return; }
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
