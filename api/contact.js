import { randomUUID } from "node:crypto";

import { createAbuseGuard } from "./lib/abuse-guard.js";
import { validateContact } from "./lib/contact-schema.js";
import { createResendMailService } from "./lib/resend-mail-service.js";
import { isSameOriginRequest } from "./lib/origin.js";
import { createUpstashRateLimiter } from "./lib/rate-limit.js";
import { safeLogger } from "./lib/safe-log.js";

const MAX_BODY_BYTES = 16 * 1024;

function setStatus(res, status) {
  if (typeof res.status === "function") return res.status(status);
  res.statusCode = status;
  return res;
}

function sendJson(res, status, payload) {
  res.setHeader?.("Cache-Control", "no-store");
  res.setHeader?.("Content-Type", "application/json; charset=utf-8");
  const target = setStatus(res, status);
  if (typeof target.json === "function") return target.json(payload);
  return target.end(JSON.stringify(payload));
}

function invalid(res, status, requestId, fieldErrors) {
  return sendJson(res, status, {
    ok: false,
    code: "INVALID_REQUEST",
    requestId,
    ...(fieldErrors ? { fieldErrors } : {})
  });
}

function header(req, name) {
  const value = req?.headers?.[name];
  return Array.isArray(value) ? value[0] : String(value || "");
}

function parseBody(req) {
  if (req?.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) {
    let encoded;
    try { encoded = JSON.stringify(req.body); } catch { throw Object.assign(new Error("Malformed JSON"), { status: 400 }); }
    if (Buffer.byteLength(encoded, "utf8") > MAX_BODY_BYTES) throw Object.assign(new Error("Body too large"), { status: 413 });
    return req.body;
  }
  const raw = Buffer.isBuffer(req?.body) ? req.body.toString("utf8") : req?.body;
  if (typeof raw !== "string") return raw;
  if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) throw Object.assign(new Error("Body too large"), { status: 413 });
  try { return JSON.parse(raw); } catch { throw Object.assign(new Error("Malformed JSON"), { status: 400 }); }
}

function requestIdFactory() {
  return `req_${randomUUID()}`;
}

export function createContactHandler({ now = Date.now, createRequestId = requestIdFactory, checkOrigin = isSameOriginRequest, guard, mailer, logger = safeLogger } = {}) {
  if (typeof guard !== "function") throw new TypeError("guard must be a function");
  if (!mailer || typeof mailer.sendContact !== "function") throw new TypeError("mailer.sendContact must be a function");

  return async function contactHandler(req, res) {
    const started = now();
    const requestId = createRequestId();
    const log = (level, status, providerClass) => logger?.[level]?.({
      event: "contact_request",
      requestId,
      status,
      latencyMs: Math.max(0, now() - started),
      ...(providerClass ? { providerClass } : {})
    });

    try {
      if (req?.method !== "POST") {
        res.setHeader?.("Allow", "POST");
        log("info", 405);
        return invalid(res, 405, requestId);
      }
      if (!/^application\/json(?:\s*;|$)/iu.test(header(req, "content-type"))) {
        log("info", 415);
        return invalid(res, 415, requestId);
      }
      if (!checkOrigin(req)) {
        log("info", 403);
        return invalid(res, 403, requestId);
      }
      const declaredLength = Number(header(req, "content-length"));
      if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
        log("info", 413);
        return invalid(res, 413, requestId);
      }

      let body;
      try { body = parseBody(req); }
      catch (error) {
        const status = error.status || 400;
        log("info", status);
        return invalid(res, status, requestId);
      }
      const validation = validateContact(body);
      if (!validation.ok) {
        log("info", 422);
        return invalid(res, 422, requestId, validation.fieldErrors);
      }

      const guarded = await guard({ req, contact: validation.value, now: started, requestId, signal: req?.signal });
      if (!guarded.ok) {
        if (guarded.silent) {
          log("info", 202, "honeypot");
          return sendJson(res, 202, { ok: true, requestId });
        }
        if (guarded.rateLimited) {
          const retryAfter = Math.max(1, Math.ceil(Number(guarded.retryAfter) || 1));
          res.setHeader?.("Retry-After", String(retryAfter));
          log("info", 429, "rate_limited");
          return sendJson(res, 429, { ok: false, code: "RATE_LIMITED", requestId, retryAfter });
        }
        log("info", 422, "minimum_fill_time");
        return invalid(res, 422, requestId, { form: "Please wait a moment and try again." });
      }

      try {
        await mailer.sendContact(validation.value, { signal: req?.signal, requestId });
      } catch (error) {
        log("error", 503, error?.providerClass || (error?.name === "TimeoutError" ? "timeout" : "provider_error"));
        return sendJson(res, 503, { ok: false, code: "PROVIDER_UNAVAILABLE", requestId });
      }

      log("info", 202, "success");
      return sendJson(res, 202, { ok: true, requestId });
    } catch {
      log("error", 500, "internal_error");
      return sendJson(res, 500, { ok: false, code: "INTERNAL_ERROR", requestId });
    }
  };
}

const productionHandler = createContactHandler({
  checkOrigin: isSameOriginRequest,
  guard: createAbuseGuard({ rateLimiter: createUpstashRateLimiter() }),
  mailer: createResendMailService(),
  logger: safeLogger
});

export default productionHandler;

export { MAX_BODY_BYTES };
