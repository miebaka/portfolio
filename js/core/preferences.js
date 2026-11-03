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
  darkQuery = globalThis.matchMedia?.("(prefers-color-scheme: dark)"),
  motionQuery = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)"),
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
    root.dataset.theme = resolvedTheme;
    root.dataset.colorPreference = theme;
    const reducedMotion = motion === "reduce" || (motion === "system" && motionQuery?.matches);
    root.dataset.motionPreference = motion;
    root.dataset.motion = reducedMotion ? "reduced" : "full";
    onChange?.({ theme, resolvedTheme, motion, reducedMotion });
  };
  const onSystemTheme = () => { if (theme === "system") sync(); };
  darkQuery?.addEventListener?.("change", onSystemTheme);
  const onSystemMotion = () => { if (motion === "system") sync(); };
  motionQuery?.addEventListener?.("change", onSystemMotion);
  sync();

  return {
    setTheme(value) { if (!VALID_THEMES.has(value)) return; theme = value; write(resolvedStorage, COLOR_KEY, value); sync(); },
    setMotion(value) { if (!VALID_MOTION.has(value)) return; motion = value; write(resolvedStorage, MOTION_KEY, value); sync(); },
    destroy() {
      if (destroyed) return; destroyed = true;
      darkQuery?.removeEventListener?.("change", onSystemTheme);
      motionQuery?.removeEventListener?.("change", onSystemMotion);
    },
    get colorTheme() { return theme; },
    get motionPreference() { return motion; }
  };
}

export { COLOR_KEY, MOTION_KEY };
