import { readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const directory = join(root, "assets", "experiments");
const supported = new Set([".avif", ".webp", ".jpg", ".jpeg", ".png", ".gif", ".mp4", ".webm"]);
const video = new Set([".mp4", ".webm"]);
const hash = value => [...value].reduce((total, character) => ((total << 5) - total + character.charCodeAt(0)) | 0, 0) >>> 0;
const titleFromFile = file => file.replace(extname(file), "").replace(/[-_]+/g, " ").replace(/\b\w/g, letter => letter.toUpperCase());

let metadata = {};
try { metadata = JSON.parse(await readFile(join(directory, "metadata.json"), "utf8")); } catch {}

const files = (await readdir(directory)).filter(file => supported.has(extname(file).toLowerCase())).sort();
const entries = files.map((file, index) => {
  const seed = hash(file);
  const override = metadata[file] && typeof metadata[file] === "object" ? metadata[file] : {};
  return {
    file,
    type: video.has(extname(file).toLowerCase()) ? "video" : "image",
    title: override.title || titleFromFile(file),
    category: override.category || "Experiment",
    alt: override.alt || "",
    href: override.href || "",
    x: override.x ?? 140 + ((seed * 47 + index * 311) % 2520),
    y: override.y ?? 120 + ((seed * 29 + index * 197) % 1640),
    width: override.width ?? 180 + (seed % 260)
  };
});

await writeFile(join(directory, "manifest.json"), `${JSON.stringify(entries, null, 2)}\n`);
console.log(`Indexed ${entries.length} experiment asset${entries.length === 1 ? "" : "s"}.`);
