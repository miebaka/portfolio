#!/usr/bin/env node
/* ==========================================================================
   optimize-images.mjs — generate responsive AVIF / WebP / JPG variants.

   The site itself is zero-build; this is optional tooling. Run it whenever you
   add or change a raster image:

       npm install        # once, to get sharp
       npm run optimize:images

   Outputs <base>-<width>.{avif,webp,jpg} into assets/images/optimized/, then
   uncomment `portraitResponsive` in data/site.js so the portrait is served as
   <picture> with srcset. SVGs (logos) need no processing.
   ========================================================================== */
import sharp from "sharp";
import { mkdir, access } from "node:fs/promises";
import { join } from "node:path";

const OUT = "assets/images/optimized";
const WIDTHS = [540, 810, 1080];
/* Case-study media bands are full-bleed (100vw), so they need steps past the
   1080 the in-column imagery tops out at, or they soften on wide displays. */
const WIDTHS_BLEED = [540, 810, 1080, 1440, 1920];

/* Work imagery. One master per module lives in assets/images/work/<slug>/ and
   is never served directly — pages reference the optimized variants only.
   Masters are the highest resolution the source gallery offered. */
const work = (slug, names) =>
  names.map((n) => ({
    src: `assets/images/work/${slug}/${n}.jpg`,
    base: `${slug}-${n}`,
    widths: WIDTHS_BLEED,
  }));

/* Raster sources to optimize. Add project covers here as you create them. */
const SOURCES = [
  { src: "assets/images/miebaka-joshua-portrait.jpg", base: "miebaka-joshua-portrait" },
  /* Article imagery. Originals live in assets/images/writing/ and are not
     served directly; the pages reference the optimized variants only. */
  { src: "assets/images/writing/swoosh-dream-crazy.jpg",  base: "swoosh-dream-crazy" },
  { src: "assets/images/writing/swoosh-nike-2021.jpg",    base: "swoosh-nike-2021" },
  { src: "assets/images/writing/swoosh-outlet-racks.png", base: "swoosh-outlet-racks" },
  { src: "assets/images/writing/disability-flying-stars.jpg", base: "disability-flying-stars" },
  { src: "assets/images/writing/disability-types.png",       base: "disability-types" },

  ...work("rivo", ["wordmark", "palette", "stationery", "guidelines",
                   "in-use", "tote", "stage", "flag"]),
  ...work("chopbox", ["platter", "logo-lockups", "palette", "typeface",
                      "packaging", "apron", "campaign", "billboard"]),
  ...work("tedx-rsu", ["logomark", "palette", "pattern", "typeface",
                       "merch", "street-banner", "campus-banner", "event"]),
];

async function exists(p) {
  try { await access(p); return true; } catch { return false; }
}

async function run() {
  await mkdir(OUT, { recursive: true });
  let count = 0;
  for (const { src, base, widths } of SOURCES) {
    if (!(await exists(src))) { console.warn("• skip (missing): " + src); continue; }
    const meta = await sharp(src).metadata();
    for (const w of (widths || WIDTHS)) {
      if (meta.width && w > meta.width) continue; // never upscale
      const pipe = sharp(src).resize({ width: w });
      await pipe.clone().avif({ quality: 48, effort: 6 }).toFile(join(OUT, `${base}-${w}.avif`));
      await pipe.clone().webp({ quality: 66, effort: 6 }).toFile(join(OUT, `${base}-${w}.webp`));
      await pipe.clone().jpeg({ quality: 80, mozjpeg: true }).toFile(join(OUT, `${base}-${w}.jpg`));
      console.log(`✓ ${base}-${w}  (avif · webp · jpg)`);
      count++;
    }
  }
  console.log(`\nDone — ${count} size(s) per source written to ${OUT}/.`);
  console.log("Next: uncomment `portraitResponsive` in data/site.js to serve them.");
}

run().catch((e) => { console.error(e); process.exit(1); });
