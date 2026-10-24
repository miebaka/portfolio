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
try {
  metadata = JSON.parse(await readFile(join(directory, "metadata.json"), "utf8"));
} catch (error) {
  if (error.code !== "ENOENT") throw new Error(`Invalid experiments metadata: ${error.message}`);
}
if (!metadata || Array.isArray(metadata) || typeof metadata !== "object") throw new Error("Experiments metadata must be an object keyed by filename.");

const optionalText = ["title", "category", "alt", "href"];
const optionalNumber = ["x", "y", "width"];
const validateOverride = (file, override) => {
  for (const key of optionalText) {
    if (override[key] != null && typeof override[key] !== "string") throw new Error(`${file}: ${key} must be text.`);
  }
  for (const key of optionalNumber) {
    if (override[key] != null && (!Number.isFinite(override[key]) || override[key] < 0)) throw new Error(`${file}: ${key} must be a non-negative number.`);
  }
  if (override.width === 0) throw new Error(`${file}: width must be greater than zero.`);
};

const files = (await readdir(directory)).filter(file => supported.has(extname(file).toLowerCase())).sort();
const entries = files.map((file, index) => {
  const seed = hash(file);
  const authored = metadata[file];
  if (authored != null && (Array.isArray(authored) || typeof authored !== "object")) throw new Error(`${file}: metadata must be an object.`);
  const override = authored || {};
  validateOverride(file, override);
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
