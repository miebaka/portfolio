const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX = { name: 120, email: 254, interest: 120, message: 6000 };

const clean = (value, limit) => String(value || "").trim().slice(0, limit);
const singleLine = (value, limit) => clean(value, limit).replace(/[\r\n\t]+/g, " ");
const reply = (res, status, payload) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return reply(res, 405, { error: "Use the contact form to send a message." });
  }

  let body = req.body || {};
  try { if (typeof body === "string") body = JSON.parse(body || "{}"); }
  catch { return reply(res, 400, { error: "The form data could not be read." }); }
  if (clean(body.companySite, 200)) return reply(res, 200, { ok: true });

  const name = singleLine(body.name, MAX.name);
  const email = clean(body.email, MAX.email);
  const interest = singleLine(body.interest, MAX.interest);
  const message = clean(body.message, MAX.message);
  if (!name || !EMAIL_RE.test(email) || !interest || !message) {
    return reply(res, 400, { error: "Complete every required field with a valid email address." });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return reply(res, 503, { error: "Message delivery is not configured yet." });

  let delivery;
  try {
    delivery = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL || "Portfolio <onboarding@resend.dev>",
        to: [process.env.CONTACT_TO_EMAIL || "miebakakiki@gmail.com"],
        reply_to: email,
        subject: `${interest}: ${name}`,
        text: `Name: ${name}\nEmail: ${email}\nInterest: ${interest}\n\n${message}`,
      }),
    });
  } catch {
    return reply(res, 502, { error: "The email service could not be reached." });
  }

  if (!delivery.ok) return reply(res, 502, { error: "The email service did not accept the message." });
  return reply(res, 200, { ok: true });
}
