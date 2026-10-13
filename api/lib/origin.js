function firstHeader(value) {
  return Array.isArray(value) ? value[0] : String(value || "").split(",")[0].trim();
}

export function configuredOrigins(value = process.env.CONTACT_ALLOWED_ORIGINS || "") {
  return String(value).split(",").map((origin) => origin.trim()).filter(Boolean).map((origin) => {
    try { return new URL(origin).origin; } catch { return ""; }
  }).filter(Boolean);
}

export function isSameOriginRequest(req, allowedOrigins = configuredOrigins()) {
  const supplied = firstHeader(req?.headers?.origin);
  if (!supplied) return false;

  let origin;
  try { origin = new URL(supplied).origin; } catch { return false; }
  if (allowedOrigins.length) return allowedOrigins.includes(origin);

  const host = firstHeader(req?.headers?.host);
  const protocol = "https";
  if (!host || !["http", "https"].includes(protocol)) return false;
  try { return origin === new URL(`${protocol}://${host}`).origin; } catch { return false; }
}
