function firstHeader(value) {
  return Array.isArray(value) ? value[0] : String(value || "").split(",")[0].trim();
}

export function configuredOrigins(value = process.env.CONTACT_ALLOWED_ORIGINS || "") {
  return String(value).split(",").map((origin) => origin.trim()).filter(Boolean).map((origin) => {
    try {
      const parsed = new URL(origin);
      return parsed.protocol === "https:" && parsed.origin === origin ? origin : "";
    } catch { return ""; }
  }).filter(Boolean);
}

export function isSameOriginRequest(req, allowedOrigins = configuredOrigins()) {
  const supplied = firstHeader(req?.headers?.origin);
  if (!supplied) return false;

  let origin;
  try {
    const parsed = new URL(supplied);
    if (parsed.protocol !== "https:" || parsed.origin !== supplied) return false;
    origin = parsed.origin;
  } catch { return false; }
  // Do not treat caller-controlled Host as an authorization allowlist.
  const trusted = allowedOrigins.length ? allowedOrigins : ["https://miebaka-portfolio.vercel.app"];
  return trusted.includes(origin);
}
