import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { safeURL } from "../js/utilities/dom.js";
import { configuredOrigins, isSameOriginRequest } from "../api/lib/origin.js";
import { createUpstashRateLimiter } from "../api/lib/rate-limit.js";

test("rejects executable and ambiguous URL schemes while preserving legitimate links", () => {
  for (const url of ["javascript:alert(1)", "java\tscript:alert(1)", "java\nscript:alert(1)", "data:text/html,x", "//example.org", "\\\\example.org"]) assert.equal(safeURL(url), "#", url);
  for (const url of ["https://example.org", "mailto:a@example.org", "work.html", "#section", "assets/my image.webp"]) assert.equal(safeURL(url), url);
});

test("origin allowlist is exact and cannot be replaced by request Host", () => {
  const req = (origin, host = "attacker.example") => ({ headers: { origin, host } });
  assert.equal(isSameOriginRequest(req("https://attacker.example"), []), false);
  assert.equal(isSameOriginRequest(req("https://miebaka-portfolio.vercel.app"), []), true);
  assert.equal(isSameOriginRequest(req("https://preview.example/path"), ["https://preview.example"]), false);
  assert.equal(isSameOriginRequest(req("https://preview.example"), ["https://preview.example"]), true);
  assert.deepEqual(configuredOrigins("https://preview.example,http://insecure.example,https://bad.example/path"), ["https://preview.example"]);
});

test("rate limiter rejects insecure transport and malformed responses", async () => {
  const args = { req: {}, now: 100, requestId: "req_test" };
  const create = (url, result) => createUpstashRateLimiter({url, token:"test", secret:"test", fetchImpl: async (_url, options) => {
    assert.equal(options.redirect, "error"); assert.ok(options.signal);
    return {ok:true, json: async () => ({result})};
  }});
  await assert.rejects(create("http://redis.example", [1,1,0])(args));
  await assert.rejects(create("https://redis.example", [1,1])(args));
  assert.deepEqual(await create("https://redis.example", [0,5,1500])(args), {allowed:false,retryAfter:2});
});

test("deployment retains restrictive response headers", () => {
  const config = JSON.parse(readFileSync(new URL("../vercel.json", import.meta.url), "utf8"));
  const headers = Object.fromEntries(config.headers[0].headers.map(({key,value}) => [key,value]));
  assert.match(headers["Content-Security-Policy"], /script-src-attr 'none'/);
  assert.match(headers["Content-Security-Policy"], /frame-ancestors 'none'/);
  assert.match(headers["Content-Security-Policy"], /object-src 'none'/);
  assert.match(headers["Strict-Transport-Security"], /max-age=31536000/);
  assert.equal(headers["X-Content-Type-Options"], "nosniff");
});
