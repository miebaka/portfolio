import assert from "node:assert/strict";
import test from "node:test";

import { createContactHandler } from "../api/contact.js";
import { createAbuseGuard } from "../api/lib/abuse-guard.js";
import { validateContact } from "../api/lib/contact-schema.js";
import { isSameOriginRequest } from "../api/lib/origin.js";
import { createUpstashRateLimiter, privacyKey } from "../api/lib/rate-limit.js";
import { createResendMailService, escapeHtml } from "../api/lib/resend-mail-service.js";
import { safeEntry } from "../api/lib/safe-log.js";

const validContact = (overrides = {}) => ({
  name: "Ada Okafor",
  email: "ada@example.com",
  message: "I would like to discuss a brand system.\nCould we speak next week?",
  startedAt: 1_000,
  ...overrides
});

function request(overrides = {}) {
  return {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://miebaka.design",
      host: "miebaka.design"
    },
    body: validContact(),
    socket: { remoteAddress: "203.0.113.8" },
    ...overrides
  };
}

function response() {
  return {
    headers: {},
    statusCode: 200,
    payload: undefined,
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(value) { this.payload = value; return this; },
    end(value) { this.payload = value ? JSON.parse(value) : undefined; return this; }
  };
}

function dependencies(overrides = {}) {
  return {
    now: () => 5_000,
    createRequestId: () => "req_test_123",
    checkOrigin: () => true,
    guard: async () => ({ ok: true }),
    mailer: { sendContact: async () => ({ providerId: "mail_123" }) },
    logger: { info() {}, error() {} },
    ...overrides
  };
}

async function invoke(req = request(), deps = dependencies()) {
  const res = response();
  await createContactHandler(deps)(req, res);
  return res;
}

test("validates and normalises contact fields without flattening message lines", () => {
  const result = validateContact(validContact({
    name: "  Ada Okafor  ",
    email: "  ADA@Example.COM ",
    message: "  First line  \nSecond line  ",
    interest: "brand-identity"
  }));
  assert.deepEqual(result, {
    ok: true,
    value: {
      name: "Ada Okafor",
      email: "ada@example.com",
      message: "First line\nSecond line",
      interest: "brand-identity",
      website: "",
      startedAt: 1_000
    }
  });
});

test("rejects blank and oversized fields without echoing submitted values", () => {
  const secret = "DO_NOT_ECHO";
  const result = validateContact(validContact({ name: " ", message: secret.repeat(600) }));
  assert.equal(result.ok, false);
  assert.deepEqual(result.fieldErrors, {
    name: "Add your name.",
    message: "Keep your message under 5,000 characters."
  });
  assert.equal(JSON.stringify(result).includes(secret), false);
});

test("rejects malformed email, unknown interest, control characters and invalid timing", () => {
  const result = validateContact(validContact({
    email: "not-an-email",
    interest: "secret-option",
    name: "Ada\u0000",
    startedAt: "yesterday"
  }));
  assert.equal(result.ok, false);
  assert.deepEqual(Object.keys(result.fieldErrors).sort(), ["email", "interest", "name", "startedAt"]);
});

test("rejects a non-object body", () => {
  assert.deepEqual(validateContact(["not", "an", "object"]), {
    ok: false,
    fieldErrors: { form: "Send a valid contact request." }
  });
});

test("rejects method, content type, origin and oversized bodies", async (t) => {
  const cases = [
    [request({ method: "GET" }), 405],
    [request({ headers: { ...request().headers, "content-type": "text/plain" } }), 415],
    [request(), 403, dependencies({ checkOrigin: () => false })],
    [request({ headers: { ...request().headers, "content-length": "16385" } }), 413]
  ];
  for (const [req, status, deps] of cases) {
    await t.test(String(status), async () => {
      const res = await invoke(req, deps || dependencies());
      assert.equal(res.statusCode, status);
      assert.equal(res.payload.ok, false);
      assert.equal(res.payload.code, "INVALID_REQUEST");
      assert.equal(res.headers["Cache-Control"], "no-store");
    });
  }
});

test("rejects malformed JSON and validation errors with 422", async () => {
  const malformed = await invoke(request({ body: "{broken" }));
  assert.equal(malformed.statusCode, 400);
  assert.equal(malformed.payload.code, "INVALID_REQUEST");

  const invalid = await invoke(request({ body: validContact({ message: " " }) }));
  assert.equal(invalid.statusCode, 422);
  assert.deepEqual(invalid.payload.fieldErrors, { message: "Add a message." });
});

test("rejects an oversized pre-parsed body without trusting Content-Length", async () => {
  const res = await invoke(request({ body: { ...validContact(), padding: "x".repeat(20_000) } }));
  assert.equal(res.statusCode, 413);
  assert.equal(res.payload.code, "INVALID_REQUEST");
});

test("silently accepts a honeypot submission without sending", async () => {
  let sent = false;
  const res = await invoke(request({ body: validContact({ website: "spam.example" }) }), dependencies({
    guard: async () => ({ ok: false, silent: true }),
    mailer: { sendContact: async () => { sent = true; } }
  }));
  assert.equal(res.statusCode, 202);
  assert.deepEqual(res.payload, { ok: true, requestId: "req_test_123" });
  assert.equal(sent, false);
});

test("rejects submissions completed faster than three seconds", async () => {
  const res = await invoke(request(), dependencies({ guard: async () => ({ ok: false, silent: false }) }));
  assert.equal(res.statusCode, 422);
  assert.equal(res.payload.code, "INVALID_REQUEST");
  assert.deepEqual(res.payload.fieldErrors, { form: "Please wait a moment and try again." });
});

test("returns 429 and Retry-After when the shared limiter rejects", async () => {
  const res = await invoke(request(), dependencies({
    guard: async () => ({ ok: false, rateLimited: true, retryAfter: 73 })
  }));
  assert.equal(res.statusCode, 429);
  assert.equal(res.headers["Retry-After"], "73");
  assert.deepEqual(res.payload, {
    ok: false,
    code: "RATE_LIMITED",
    requestId: "req_test_123",
    retryAfter: 73
  });
});

test("accepts a valid request and never exposes the provider id", async () => {
  const res = await invoke();
  assert.equal(res.statusCode, 202);
  assert.deepEqual(res.payload, { ok: true, requestId: "req_test_123" });
});

test("maps provider failures and timeouts to a stable 503 envelope", async (t) => {
  for (const error of [new Error("provider rejected"), new DOMException("timed out", "TimeoutError")]) {
    await t.test(error.name, async () => {
      const res = await invoke(request(), dependencies({
        mailer: { sendContact: async () => { throw error; } }
      }));
      assert.equal(res.statusCode, 503);
      assert.deepEqual(res.payload, {
        ok: false,
        code: "PROVIDER_UNAVAILABLE",
        requestId: "req_test_123"
      });
    });
  }
});

test("maps unexpected boundary failures to 500", async () => {
  const res = await invoke(request(), dependencies({ guard: async () => { throw new Error("unexpected"); } }));
  assert.equal(res.statusCode, 500);
  assert.deepEqual(res.payload, { ok: false, code: "INTERNAL_ERROR", requestId: "req_test_123" });
});

test("safe logs contain operational metadata but no submitted content", async () => {
  const entries = [];
  await invoke(request(), dependencies({ logger: { info: (entry) => entries.push(entry), error: (entry) => entries.push(entry) } }));
  const serialised = JSON.stringify(entries);
  assert.equal(serialised.includes("ada@example.com"), false);
  assert.equal(serialised.includes("brand system"), false);
  assert.match(serialised, /req_test_123/);
  assert.match(serialised, /202/);
});

test("the production origin check accepts configured or true same-origin requests only", () => {
  const req = request();
  assert.equal(isSameOriginRequest(req, ["https://miebaka.design"]), true);
  assert.equal(isSameOriginRequest({ ...req, headers: { ...req.headers, origin: "https://attacker.example" } }, ["https://miebaka.design"]), false);
  assert.equal(isSameOriginRequest({ ...req, headers: { ...req.headers, origin: "https://attacker.example", "x-forwarded-host": "attacker.example", "x-forwarded-proto": "https" } }, ["https://miebaka.design"]), false);
  assert.equal(isSameOriginRequest({ ...req, headers: { ...req.headers, origin: "not a URL" } }, []), false);
});

test("the abuse guard short-circuits traps and minimum-fill time before rate limiting", async () => {
  let limiterCalls = 0;
  const guard = createAbuseGuard({ rateLimiter: async () => { limiterCalls += 1; return { allowed: true }; } });
  assert.deepEqual(await guard({ contact: validContact({ website: "bot" }), now: 5_000 }), { ok: false, silent: true });
  assert.deepEqual(await guard({ contact: validContact({ startedAt: 4_000 }), now: 5_000 }), { ok: false, silent: false });
  assert.equal(limiterCalls, 0);
});

test("the Upstash request uses only a keyed address hash", async () => {
  let sentBody = "";
  const limiter = createUpstashRateLimiter({
    url: "https://redis.example",
    token: "token",
    secret: "secret",
    fetchImpl: async (_url, options) => { sentBody = options.body; return { ok: true, json: async () => ({ result: [1, 1, 0] }) }; }
  });
  assert.deepEqual(await limiter({ req: request(), now: 5_000, requestId: "req_1" }), { allowed: true, retryAfter: 0 });
  assert.equal(sentBody.includes("203.0.113.8"), false);
  assert.match(sentBody, new RegExp(privacyKey("203.0.113.8", "secret")));
});

test("the Resend adapter escapes HTML and keeps reply-to at the provider boundary", async () => {
  let payload;
  const mailer = createResendMailService({
    apiKey: "key", from: "Portfolio <hello@example.com>", to: "owner@example.com",
    fetchImpl: async (_url, options) => { payload = JSON.parse(options.body); return { ok: true, json: async () => ({ id: "mail_1" }) }; }
  });
  const contact = validContact({ name: "<Ada>", message: "Hello <script>" });
  assert.deepEqual(await mailer.sendContact(contact, { requestId: "req_1" }), { providerId: "mail_1" });
  assert.equal(payload.reply_to, contact.email);
  assert.equal(payload.html.includes("<script>"), false);
  assert.match(payload.html, /&lt;script&gt;/);
  assert.equal(escapeHtml("<&"), "&lt;&amp;");
});

test("safeEntry drops every field outside the operational allowlist", () => {
  assert.deepEqual(safeEntry({ event: "contact", requestId: "req_1", status: 202, latencyMs: 4, providerClass: "success", email: "secret@example.com" }), {
    event: "contact", requestId: "req_1", status: 202, latencyMs: 4, providerClass: "success"
  });
});
