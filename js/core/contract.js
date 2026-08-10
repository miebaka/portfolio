/* ==========================================================================
   contract.js — the HTML/JS interface, in one place.

   Every dynamic region of this site is joined to its renderer by a string that
   appears twice and is checked nowhere: `data-mount="work-grid"` in the markup,
   `mount("work-grid")` in the module. Nothing links the two. Rename one and the
   section simply stops rendering: mount() returns null, the renderer's
   `if (!el) return` fires, and the page ships with a hole in it and no error.

   This module is the single source of truth for those names. Renderers import
   from here instead of retyping a literal, and validateContract() compares what
   the markup declares against what the code knows, so a mismatch is reported
   the moment it happens instead of being discovered visually much later.

   Adding a dynamic region means adding it here first. That is the point: the
   registry is what makes the coupling reviewable.
   ========================================================================== */

/* Mount points: [data-mount="<value>"] filled by a render function. */
export const MOUNT = {
  NAV:         "nav",
  FOOTER:      "footer",
  WORK_GRID:   "work-grid",
  CLIENTS:     "clients",
  CAPABILITIES:"capabilities",
  TESTIMONIAL: "testimonial",
  WRITING:     "writing",
  CASE:        "case",
  NOW_PLAYING: "now-playing",
};

/* Behavioural hooks: attributes JS reads or binds to, which carry no value of
   their own but must match the markup exactly. */
export const HOOK = {
  /* filled from SITE by fillSlots() */
  FILL:        "data-fill",
  EMAIL_HREF:  "data-href",
  /* page identity, read by renderers to decide what to draw */
  PAGE:        "data-page",
  BASE:        "data-base",
  CASE_SLUG:   "data-case",
  NAV_THEME:   "data-nav-theme",
  /* motion */
  SPLIT:       "data-split",
  WIPE:        "data-wipe",
  /* misc */
  YEAR:        "data-year",
  PORTRAIT:    "data-hero-portrait",
};

/* Mounts that are page-specific rather than sitewide. A page missing one of
   these is normal; a page missing NAV or FOOTER is not. */
const OPTIONAL = new Set([
  MOUNT.WORK_GRID, MOUNT.CLIENTS, MOUNT.CAPABILITIES, MOUNT.TESTIMONIAL,
  MOUNT.WRITING, MOUNT.CASE, MOUNT.NOW_PLAYING,
]);

const KNOWN = new Set(Object.values(MOUNT));

/* Reports mount points that exist in one half of the contract but not the
   other. Returns the findings rather than logging them, so callers decide
   whether to warn; initContract() below is the normal entry point.

   Runs against the live DOM, so it catches a typo in any page, not just the
   ones a developer happens to open. */
export function validateContract() {
  const declared = new Set(
    [...document.querySelectorAll("[data-mount]")]
      .map((el) => el.dataset.mount)
      .filter(Boolean)
  );

  /* In the markup but unknown to the code: almost always a typo, and the
     symptom is a region that silently never fills. */
  const unknown = [...declared].filter((name) => !KNOWN.has(name));

  /* Known to the code and required everywhere, but absent from this page. */
  const missing = [...KNOWN].filter(
    (name) => !OPTIONAL.has(name) && !declared.has(name)
  );

  return { declared: [...declared], unknown, missing };
}

/* Validate, and report anything wrong to the console.

   Warn rather than throw: a mismatched mount degrades one region, and taking
   the whole page down over it would turn a cosmetic fault into an outage. The
   message names the file to fix so the fix is obvious. */
export function initContract() {
  const { unknown, missing } = validateContract();

  unknown.forEach((name) =>
    console.warn(
      `[contract] data-mount="${name}" is in the markup but not in js/core/contract.js. ` +
      `This region will never render. Add it to MOUNT, or correct the spelling in the HTML.`
    )
  );

  missing.forEach((name) =>
    console.warn(
      `[contract] MOUNT "${name}" is required on every page but is absent from ` +
      `${document.body.dataset.page || "this page"}. Its renderer will no-op.`
    )
  );

  return unknown.length === 0 && missing.length === 0;
}
