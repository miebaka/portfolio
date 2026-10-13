import { PROJECT_STATUS } from "../data/projects.js";

const isRecord = value => value !== null && typeof value === "object" && !Array.isArray(value);
const hasText = value => typeof value === "string" && value.trim().length > 0;
const isSlug = value => typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
const routePath = value => typeof value === "string" ? value.replace(/^\.\//, "").split(/[?#]/)[0] : "";
const validRoute = value => hasText(value) && /^(?:\.\/)?[a-z0-9_-]+(?:\/[a-z0-9_-]+)*\.html(?:[?#][^\s]*)?$/.test(value);
const positiveInteger = value => Number.isInteger(value) && value > 0;
const REQUIRED_CHAPTERS = ["context", "problem", "process", "decision", "system", "applications", "production", "reflection"];
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
    const cv = content.siteConfig.cv;
    if (!("cv" in content.siteConfig) || cv === undefined) add("siteConfig.cv", "CV_STATE_REQUIRED", "CV must be approved metadata or explicitly null.");
    if (cv !== null && cv !== undefined) {
      if (!isRecord(cv)) add("siteConfig.cv", "CV_INVALID", "CV must be approved metadata or null.");
      else {
        for (const field of ["href", "label", "mimeType", "sizeLabel"]) if (!hasText(cv[field])) add(`siteConfig.cv.${field}`, "CV_FIELD_REQUIRED", `CV ${field} is required.`);
        if (hasText(cv.href) && !/^assets\/documents\/[a-z0-9_-]+\.pdf$/i.test(cv.href)) add("siteConfig.cv.href", "CV_PATH_INVALID", "CV must use a local PDF path.");
        if (hasText(cv.mimeType) && cv.mimeType !== "application/pdf") add("siteConfig.cv.mimeType", "CV_MIME_INVALID", "CV must declare application/pdf.");
      }
    }
    if (content.siteConfig.experience !== undefined && !Array.isArray(content.siteConfig.experience)) add("siteConfig.experience", "EXPERIENCE_INVALID", "Experience must be an array when supplied.");
    else (content.siteConfig.experience || []).forEach((entry, index) => {
      const path = `siteConfig.experience[${index}]`;
      if (!isRecord(entry)) { add(path, "EXPERIENCE_ENTRY_INVALID", "An experience entry must be an object."); return; }
      for (const field of ["organisation", "role", "period", "contribution"]) if (!hasText(entry[field])) add(`${path}.${field}`, "EXPERIENCE_FIELD_REQUIRED", `Experience ${field} is required.`);
    });
  }

  if (!Array.isArray(content.services)) add("services", "SERVICES_INVALID", "Services must be an array.");
  else {
    if (content.services.length !== 5) add("services", "SERVICES_COUNT_INVALID", "Exactly five service records are required.");
    const serviceIds = new Set();
    content.services.forEach((service, index) => {
    const path = `services[${index}]`;
    if (!isRecord(service)) { add(path, "SERVICE_INVALID", "A service must be an object."); return; }
    for (const field of ["id", "title", "description", "outputs", "fit"]) if (!hasText(service[field])) add(`${path}.${field}`, "SERVICE_FIELD_REQUIRED", `Service ${field} is required.`);
    if (hasText(service.id) && !isSlug(service.id)) add(`${path}.id`, "SERVICE_ID_INVALID", "Service id must be lowercase and hyphenated.");
    else if (serviceIds.has(service.id)) add(`${path}.id`, "SERVICE_ID_DUPLICATE", `Duplicate service id: ${service.id}.`);
    serviceIds.add(service.id);
    });
  }

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
    if (study.status === "published") {
      const mediaIds = new Set((Array.isArray(study.media) ? study.media : []).filter(isRecord).map(media => media.src));
      if (!hasText(study.hero) || !mediaIds.has(study.hero)) add(`${path}.hero`, "CASE_HERO_INVALID", "A published case needs a hero referencing its media.");
      if (!isRecord(study.facts)) add(`${path}.facts`, "CASE_FACTS_REQUIRED", "A published case needs supported role and deliverable facts.");
      else for (const field of ["role", "delivered"]) if (!hasText(study.facts[field])) add(`${path}.facts.${field}`, "CASE_FACT_REQUIRED", `Published case ${field} is required.`);
      if (!isRecord(study.next)) add(`${path}.next`, "CASE_NEXT_REQUIRED", "A published case needs a next-project destination.");
      else {
        if (!hasText(study.next.title)) add(`${path}.next.title`, "CASE_NEXT_TITLE_REQUIRED", "The next project needs a usable link title.");
        if (study.next.slug === slug) add(`${path}.next.slug`, "CASE_NEXT_SELF", "Next must lead to another project.");
        if (study.next.interactive !== undefined && typeof study.next.interactive !== "boolean") add(`${path}.next.interactive`, "CASE_NEXT_INTERACTIVE_INVALID", "Next interactivity must be a boolean when specified.");
      }
      if (!Array.isArray(study.chapters)) add(`${path}.chapters`, "CASE_CHAPTERS_INVALID", "A published case needs its complete chapter sequence.");
      else {
        const ids = study.chapters.map(chapter => chapter?.id);
        const wanted = ids.includes("outcomes") ? [...REQUIRED_CHAPTERS.slice(0, -1), "outcomes", "reflection"] : REQUIRED_CHAPTERS;
        if (ids.length !== wanted.length || ids.some((id, index) => id !== wanted[index])) add(`${path}.chapters`, "CASE_CHAPTER_ORDER_INVALID", "Use context, problem, process, decision, system, applications, production, optional verified outcomes, then reflection.");
        const usedMedia = new Set([study.hero]);
        study.chapters.forEach((chapter, index) => {
          const chapterPath = `${path}.chapters[${index}]`;
          if (!isRecord(chapter)) { add(chapterPath, "CASE_CHAPTER_INVALID", "A chapter must be an object."); return; }
          if (!hasText(chapter.label)) add(`${chapterPath}.label`, "CASE_CHAPTER_LABEL_REQUIRED", "A chapter needs a usable orientation label.");
          if (chapter.title !== undefined && !hasText(chapter.title)) add(`${chapterPath}.title`, "CASE_CHAPTER_TITLE_INVALID", "An optional chapter title must contain text.");
          if (!Array.isArray(chapter.body) || !chapter.body.length || chapter.body.some(paragraph => !hasText(paragraph))) add(`${chapterPath}.body`, "CASE_CHAPTER_BODY_INVALID", "Every chapter needs nonempty authored paragraphs.");
          if (chapter.media !== undefined) {
            if (!Array.isArray(chapter.media) || chapter.media.some(id => !hasText(id) || !mediaIds.has(id))) add(`${chapterPath}.media`, "CASE_CHAPTER_MEDIA_INVALID", "Chapter media must reference declared media IDs.");
            else for (const id of chapter.media) {
              if (usedMedia.has(id)) add(`${chapterPath}.media`, "CASE_MEDIA_REUSED", "Each plate appears once in the narrative.");
              usedMedia.add(id);
            }
          }
        });
      }
    }
    if (study.next !== undefined) {
      const nextProject = projects.find(item => item?.slug === study.next?.slug);
      if (!nextProject) add(`${path}.next.slug`, "NEXT_PROJECT_MISSING", "Next must reference an existing project.");
      else if (nextProject.status === PROJECT_STATUS.PRIVATE) add(`${path}.next.slug`, "NEXT_PROJECT_PRIVATE", "Next cannot expose a private project.");
      else if (!isRecord(studies[nextProject.slug]) || routePath(nextProject.href).startsWith("writing/")) add(`${path}.next.slug`, "NEXT_CASE_MISSING", "Next must reference a project with a usable case-study destination.");
      else if (study.status === "published" && study.next.interactive !== false) {
        if (nextProject.status !== PROJECT_STATUS.PUBLISHED) add(`${path}.next.slug`, "NEXT_PROJECT_UNPUBLISHED", "An active next destination must be a published project; forthcoming entries must be noninteractive.");
        else if (studies[nextProject.slug].status !== "published") add(`${path}.next.slug`, "NEXT_CASE_UNPUBLISHED", "An active next destination must have a published case narrative.");
      }
    }
    if (!Array.isArray(study.media)) { add(`${path}.media`, "MEDIA_INVALID", "Case media must be an array."); continue; }
    const seenMedia = new Set();
    study.media.forEach((media, index) => {
      const mediaPath = `${path}.media[${index}]`;
      if (!isRecord(media)) { add(mediaPath, "MEDIA_INVALID", "A media item must be an object."); return; }
      for (const field of ["label", "src"]) if (!hasText(media[field])) add(`${mediaPath}.${field}`, "MEDIA_FIELD_REQUIRED", `Media ${field} is required.`);
      if (hasText(media.src) && seenMedia.has(media.src)) add(`${mediaPath}.src`, "MEDIA_SOURCE_DUPLICATE", "Media IDs must be unique within a case study.");
      seenMedia.add(media.src);
      for (const field of ["w", "h"]) if (!Number.isInteger(media[field]) || media[field] <= 0) add(`${mediaPath}.${field}`, "MEDIA_DIMENSIONS_INVALID", "Media dimensions must be positive integers.");
      if (!hasText(media.alt)) add(`${mediaPath}.alt`, "MEDIA_ALT_REQUIRED", "Media needs a meaningful alternative.");
      if (media.loading !== undefined && !["lazy", "eager"].includes(media.loading)) add(`${mediaPath}.loading`, "MEDIA_LOADING_INVALID", "Use lazy or eager loading.");
      if (study.status === "published") {
        if (!hasText(media.caption)) add(`${mediaPath}.caption`, "MEDIA_CAPTION_REQUIRED", "Published media needs a factual caption.");
        if (media.loading === undefined) add(`${mediaPath}.loading`, "MEDIA_LOADING_REQUIRED", "Published media needs intentional loading priority.");
      }
    });
  }
  return errors.length ? { ok: false, errors } : { ok: true, value: content };
}
