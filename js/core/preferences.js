const COLOR_KEY = "color-theme";
const VALID_THEMES = new Set(["system", "light", "dark"]);

function read(storage, key, allowed, fallback) {
  try { const value = storage?.getItem(key); return allowed.has(value) ? value : fallback; }
  catch { return fallback; }
}

function write(storage, key, value) { try { storage?.setItem(key, value); } catch {} }

export function createPreferencesController({
  root = document.documentElement,
  storage,
  darkQuery = globalThis.matchMedia?.("(prefers-color-scheme: dark)"),
  onChange
} = {}) {
  let resolvedStorage = storage;
  if (resolvedStorage === undefined) {
    try { resolvedStorage = globalThis.localStorage; } catch { resolvedStorage = null; }
  }
  let theme = read(resolvedStorage, COLOR_KEY, VALID_THEMES, "system");
  let destroyed = false;

  const sync = () => {
    const resolvedTheme = theme === "system" ? (darkQuery?.matches ? "dark" : "light") : theme;
    root.dataset.theme = resolvedTheme;
    root.dataset.colorPreference = theme;
    onChange?.({ theme, resolvedTheme });
  };
  const onSystemTheme = () => { if (theme === "system") sync(); };
  darkQuery?.addEventListener?.("change", onSystemTheme);
  sync();

  return {
    setTheme(value) { if (!VALID_THEMES.has(value)) return; theme = value; write(resolvedStorage, COLOR_KEY, value); sync(); },
    destroy() {
      if (destroyed) return; destroyed = true;
      darkQuery?.removeEventListener?.("change", onSystemTheme);
    },
    get colorTheme() { return theme; }
  };
}

export { COLOR_KEY };
