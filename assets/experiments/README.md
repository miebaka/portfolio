# Experiments assets

Drop image or video assets directly in this folder. Supported formats are
`.avif`, `.webp`, `.jpg`, `.jpeg`, `.png`, `.gif`, `.mp4` and `.webm`.

`npm run build:experiments` regenerates `manifest.json` from the folder. File
names become display titles automatically: `kinetic-type-study.mp4` becomes
“Kinetic Type Study”.

Optional overrides can be added to `metadata.json` using the asset filename as
the key:

```json
{
  "kinetic-type-study.mp4": {
    "title": "Kinetic Type Study",
    "category": "Motion",
    "alt": "Animated letterforms moving through a blue field",
    "href": "https://example.com/project",
    "x": 420,
    "y": 260,
    "width": 360
  }
}
```

Positions use pixels inside the 3200 × 2200 spatial field. Invalid JSON or
non-text labels and links stop the build instead of silently publishing an
incorrect archive.
