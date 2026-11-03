# Images

Source rasters live here, in `writing/`, or in `work/<slug>/`. Register each
source in `scripts/optimize-images.mjs`, run `npm run optimize:images`, and
reference the generated stem from the relevant data module. Production pages
serve only the responsive files in `optimized/`; source masters are retained
for regeneration.

Keep logos as SVG where possible. Every meaningful image needs accurate alt
text in its content record; decorative preview images use an empty alt value.
