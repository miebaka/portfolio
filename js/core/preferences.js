const COLOR_KEY = "color-theme";
const MOTION_KEY = "motion-preference";
const VALID_THEMES = new Set(["system", "light", "dark"]);
const VALID_MOTION = new Set(["system", "reduce", "full"]);

function read(storage, key, allowed, fallback) {
  try { const value = storage?.getItem(key); return allowed.has(value) ? value : fallback; }
  catch { return fallback; }
}

function write(storage, key, value) { try { storage?.setItem(key, value); } catch {} }

export function createPreferencesController({
  root = document.documentElement,
  storage,
  reducedQuery = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)"),
  darkQuery = globalThis.matchMedia?.("(prefers-color-scheme: dark)"),
  onChange
} = {}) {
  let resolvedStorage = storage;
  if (resolvedStorage === undefined) {
    try { resolvedStorage = globalThis.localStorage; } catch { resolvedStorage = null; }
  }
  let theme = read(resolvedStorage, COLOR_KEY, VALID_THEMES, "system");
  let motion = read(resolvedStorage, MOTION_KEY, VALID_MOTION, "system");
  let destroyed = false;

  const sync = () => {
    const resolvedTheme = theme === "system" ? (darkQuery?.matches ? "dark" : "light") : theme;
    const reduced = motion === "reduce" || (motion === "system" && reducedQuery?.matches);
    root.dataset.theme = resolvedTheme;
    root.dataset.colorPreference = theme;
    root.dataset.motion = reduced ? "reduced" : "full";
    root.dataset.motionPreference = motion;
    onChange?.({ theme, resolvedTheme, motion, reduced });
    root.ownerDocument?.dispatchEvent?.(new Event("motionpreferencechange"));
  };
  const onSystemTheme = () => { if (theme === "system") sync(); };
  const onSystemMotion = () => { if (motion === "system") sync(); };
  darkQuery?.addEventListener?.("change", onSystemTheme);
  reducedQuery?.addEventListener?.("change", onSystemMotion);
  sync();

  return {
    setTheme(value) { if (!VALID_THEMES.has(value)) return; theme = value; write(resolvedStorage, COLOR_KEY, value); sync(); },
    setMotion(value) { if (!VALID_MOTION.has(value)) return; motion = value; write(resolvedStorage, MOTION_KEY, value); sync(); },
    destroy() {
      if (destroyed) return; destroyed = true;
      darkQuery?.removeEventListener?.("change", onSystemTheme);
      reducedQuery?.removeEventListener?.("change", onSystemMotion);
    },
    get colorTheme() { return theme; },
    get motionPreference() { return motion; }
  };
}

export { COLOR_KEY, MOTION_KEY };
