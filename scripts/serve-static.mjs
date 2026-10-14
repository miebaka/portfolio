import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";

const root = resolve(process.argv[2] || ".");
const port = Number(process.argv[3] || 4173);
const types = { ".avif": "image/avif", ".css": "text/css; charset=utf-8", ".html": "text/html; charset=utf-8", ".jpg": "image/jpeg", ".js": "text/javascript; charset=utf-8", ".json": "application/json", ".png": "image/png", ".svg": "image/svg+xml", ".ttf": "font/ttf", ".webp": "image/webp", ".woff2": "font/woff2" };

createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  const requested = normalize(pathname).replace(/^[/\\]+/u, "");
  let file = join(root, requested || "index.html");
  if (!file.startsWith(root + sep) && file !== root) { response.writeHead(403).end(); return; }
  if (!existsSync(file) && !extname(file) && existsSync(`${file}.html`)) file = `${file}.html`;
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
  if (!existsSync(file) || !statSync(file).isFile()) { response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("Not found"); return; }
  response.writeHead(200, { "Content-Type": types[extname(file).toLowerCase()] || "application/octet-stream", "Cache-Control": "no-store" });
  if (request.method === "HEAD") { response.end(); return; }
  createReadStream(file).pipe(response);
}).listen(port, "127.0.0.1", () => console.log(`Serving ${root} at http://127.0.0.1:${port}`));
