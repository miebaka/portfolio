const LIMITS = Object.freeze({ name: 120, email: 254, message: 5_000, interest: 80 });
const ALLOWED_INTERESTS = new Set(["brand-identity", "campaign", "design-role", "consulting", "other"]);
const FORBIDDEN_CONTROLS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/u;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;

function cleanSingleLine(value) {
  return typeof value === "string" ? value.trim().replace(/\s+/gu, " ") : "";
}

function cleanMessage(value) {
  if (typeof value !== "string") return "";
  return value.replace(/\r\n?/gu, "\n").split("\n").map((line) => line.trim()).join("\n").trim();
}

export function validateContact(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, fieldErrors: { form: "Send a valid contact request." } };
  }

  const name = cleanSingleLine(input.name);
  const email = cleanSingleLine(input.email).toLowerCase();
  const message = cleanMessage(input.message);
  const interest = cleanSingleLine(input.interest);
  const website = cleanSingleLine(input.website);
  const startedAt = input.startedAt;
  const fieldErrors = {};

  if (!name) fieldErrors.name = "Add your name.";
  else if (name.length > LIMITS.name) fieldErrors.name = "Keep your name under 120 characters.";
  else if (FORBIDDEN_CONTROLS.test(name)) fieldErrors.name = "Use standard text for your name.";

  if (!email) fieldErrors.email = "Add your email address.";
  else if (email.length > LIMITS.email || !EMAIL.test(email) || FORBIDDEN_CONTROLS.test(email)) {
    fieldErrors.email = "Enter a valid email address.";
  }

  if (!message) fieldErrors.message = "Add a message.";
  else if (message.length > LIMITS.message) fieldErrors.message = "Keep your message under 5,000 characters.";
  else if (FORBIDDEN_CONTROLS.test(message)) fieldErrors.message = "Use standard text in your message.";

  if (interest && (interest.length > LIMITS.interest || !ALLOWED_INTERESTS.has(interest))) {
    fieldErrors.interest = "Choose a listed area of interest.";
  }
  if (typeof startedAt !== "number" || !Number.isFinite(startedAt) || startedAt <= 0) {
    fieldErrors.startedAt = "Refresh the page and try again.";
  }

  if (Object.keys(fieldErrors).length) return { ok: false, fieldErrors };
  return { ok: true, value: { name, email, message, interest, website, startedAt } };
}

export { ALLOWED_INTERESTS, LIMITS };
