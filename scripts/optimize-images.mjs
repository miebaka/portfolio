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

/* Raster sources to optimize. Add project covers here as you create them. */
const SOURCES = [
  { src: "assets/images/miebaka-joshua-portrait.jpg", base: "miebaka-joshua-portrait" },
  /* Article imagery. Originals live in assets/images/writing/ and are not
     served directly; the pages reference the optimized variants only. */
  { src: "assets/images/writing/swoosh-dream-crazy.jpg",  base: "swoosh-dream-crazy" },
  { src: "assets/images/writing/swoosh-nike-2021.jpg",    base: "swoosh-nike-2021" },
  { src: "assets/images/writing/swoosh-outlet-racks.png", base: "swoosh-outlet-racks" },
];

async function exists(p) {
  try { await access(p); return true; } catch { return false; }
}

async function run() {
  await mkdir(OUT, { recursive: true });
  let count = 0;
  for (const { src, base } of SOURCES) {
    if (!(await exists(src))) { console.warn("• skip (missing): " + src); continue; }
    const meta = await sharp(src).metadata();
    for (const w of WIDTHS) {
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
