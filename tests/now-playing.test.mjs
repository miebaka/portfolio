import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

test("retired listening feature has no server endpoint or client renderer", async () => {
  for (const path of ["../api/now-playing.js", "../js/render/now-playing.js"]) await assert.rejects(access(new URL(path, import.meta.url)));
  const config = JSON.parse(await readFile(new URL("../vercel.json", import.meta.url), "utf8"));
  assert.equal(Object.hasOwn(config.functions || {}, "api/now-playing.js"), false);
});
