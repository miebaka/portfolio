import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = path => readFile(join(root, path), "utf8");

test("engineered complexity palette is exact and centrally owned", async () => {
  const foundations = (await read("styles/foundations.css")).replace(/\s+/g, "").toLowerCase();
  const expected = {
    "--ec-burgundy-900": "#3a0d1c",
    "--ec-burgundy-800": "#561226",
    "--ec-burgundy-700": "#6e1932",
    "--ec-burgundy-100": "#f2dde3",
    "--ec-sandalwood-700": "#765642",
    "--ec-sandalwood-300": "#c6a98f",
    "--ec-paper": "#f4f0e8",
    "--ec-paper-deep": "#e7ded1",
    "--ec-ink": "#171311",
    "--ec-charcoal": "#292320",
    "--ec-mist": "#d8d5ce",
    "--ec-forest": "#28382d",
    "--ec-storm": "#111827",
    "--ec-electric": "#e06046"
  };

  for (const [token, value] of Object.entries(expected)) {
    assert.ok(foundations.includes(`${token}:${value}`), `missing exact token ${token}: ${value}`);
  }
});

test("engineered complexity stylesheet is the final authored layer", async () => {
  const main = await read("styles/main.css");
  assert.match(main, /@layer[^;]*engineered;/);
  assert.match(
    main,
    /@import url\("engineered-complexity\.css"\) layer\(engineered\);\s*$/,
    "the personality layer must load last and remain isolated"
  );
});

test("route motion has explicit reduced-motion fallbacks", async () => {
  const css = await read("styles/engineered-complexity.css");
  assert.match(css, /\.ec-route-line/);
  assert.match(css, /\.ec-route-node/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /html\[data-motion="reduced"\]/);
  assert.doesNotMatch(css, /transition\s*:\s*all/i);
});

test("engineered complexity source contains no raw colours outside foundations", async () => {
  const css = await read("styles/engineered-complexity.css");
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(|oklch\(|lab\(/i);
});
