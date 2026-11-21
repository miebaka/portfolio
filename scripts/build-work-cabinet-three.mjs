import { build } from "esbuild";
import { mkdir, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outfile = resolve(root, "assets/runtime/work-cabinet-three.js");
await mkdir(dirname(outfile), { recursive: true });
await build({
  entryPoints: [resolve(root, "js/work-cabinet-three.js")],
  outfile,
  bundle: true,
  format: "esm",
  platform: "browser",
  target: ["es2022"],
  minify: true,
  legalComments: "none",
  sourcemap: false,
  define: { "process.env.NODE_ENV": '"production"' },
});
const source = await readFile(outfile);
console.log("Built optional physical work cabinet (" + (source.byteLength / 1024).toFixed(1) + " KiB).");
