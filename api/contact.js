import { randomUUID } from "node:crypto";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX = { name: 120, email: 254, interest: 120, message: 6000 };
const INTERESTS = new Set(["Senior design role", "Brand or visual design project", "Creative collaboration", "Something else"]);

const clean = value => String(value || "").trim();
const singleLine = value => clean(value).replace(/[\u0000-\u001f\u007f]+/g, " ");
const reply = (res, status, payload) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.end(JSON.stringify(payload));
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return reply(res, 405, { error: "Use the contact form to send a message." });
  }

  const fetchSite = String(req.headers?.["sec-fetch-site"] || "").toLowerCase();
  if (fetchSite === "cross-site") {
    return reply(res, 403, { error: "This form can only be submitted from the portfolio." });
  }
  const contentType = String(req.headers?.["content-type"] || "").toLowerCase();
  if (contentType && !contentType.startsWith("application/json") && !contentType.startsWith("application/x-www-form-urlencoded")) {
    return reply(res, 415, { error: "Use the portfolio form to send a message." });
  }

  let body = req.body || {};
  try { if (typeof body === "string") body = JSON.parse(body || "{}"); }
  catch { return reply(res, 400, { error: "The form data could not be read." }); }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return reply(res, 400, { error: "The form data could not be read." });
  }
  if (clean(body.companySite)) return reply(res, 200, { ok: true });

  const raw = { name: String(body.name || ""), email: String(body.email || ""), interest: String(body.interest || ""), message: String(body.message || "") };
  if (Object.entries(MAX).some(([field, limit]) => raw[field].length > limit)) {
    return reply(res, 413, { error: "One or more fields are longer than the form allows." });
  }
  const name = singleLine(raw.name);
  const email = singleLine(raw.email);
  const interest = singleLine(raw.interest);
  const message = clean(raw.message);
  if (!name || !EMAIL_RE.test(email) || !INTERESTS.has(interest) || !message) {
    return reply(res, 400, { error: "Complete every required field with a valid email address." });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return reply(res, 503, { error: "Message delivery is not configured yet." });

  let delivery;
  try {
    delivery = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      signal: AbortSignal.timeout(8000),
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL || "Portfolio <onboarding@resend.dev>",
        to: [process.env.CONTACT_TO_EMAIL || "miebakakiki@gmail.com"],
        reply_to: email,
        subject: `${interest}: ${name}`,
        text: `Name: ${name}\nEmail: ${email}\nInterest: ${interest}\n\n${message}`,
      }),
    });
  } catch (error) {
    const timedOut = error?.name === "TimeoutError" || error?.name === "AbortError";
    return reply(res, timedOut ? 504 : 502, { error: timedOut ? "Message delivery timed out. Try again." : "The email service could not be reached." });
  }

  if (!delivery.ok) {
    const correlationId = randomUUID();
    const requestId = delivery.headers?.get?.("x-request-id") || "unavailable";
    console.error("Contact delivery rejected", { correlationId, providerStatus: delivery.status, requestId });
    res.setHeader("X-Correlation-ID", correlationId);
    return reply(res, delivery.status === 429 ? 429 : 502, { error: delivery.status === 429 ? "Message delivery is busy. Try again shortly." : "The email service did not accept the message." });
  }
  return reply(res, 200, { ok: true });
}
