const ALLOWED_KEYS = new Set(["event", "requestId", "status", "latencyMs", "providerClass"]);

export function safeEntry(entry) {
  return Object.fromEntries(Object.entries(entry || {}).filter(([key, value]) => ALLOWED_KEYS.has(key) && value !== undefined));
}

export const safeLogger = Object.freeze({
  info(entry) { console.info(JSON.stringify(safeEntry(entry))); },
  error(entry) { console.error(JSON.stringify(safeEntry(entry))); }
});
