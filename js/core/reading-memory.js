import { replaceSectionHash } from "./section-links.js";

const PREFIX = "portfolio-reading-v1:";
const MAX_AGE = 6 * 60 * 60 * 1000;
const storage = () => {
  try {
    return globalThis.sessionStorage;
  } catch {
    return null;
  }
};
const key = (path = globalThis.location?.pathname || "") => PREFIX + path;

export function readReadingPosition(path) {
  try {
    const record = JSON.parse(storage()?.getItem(key(path)) || "null");
    if (!record?.id || Date.now() - record.savedAt > MAX_AGE) return null;
    return record;
  } catch {
    return null;
  }
}

export function rememberReadingPosition(id, label, path) {
  if (!id) return;
  try {
    storage()?.setItem(key(path), JSON.stringify({ id, label, savedAt: Date.now() }));
  } catch {
    /* storage is optional */
  }
}

export function clearReadingPosition(path) {
  try {
    storage()?.removeItem(key(path));
  } catch {
    /* storage is optional */
  }
}

export function initReadingResume({ root, path = globalThis.location?.pathname } = {}) {
  if (!root || globalThis.location?.hash) return;
  const record = readReadingPosition(path);
  const target = record && document.getElementById(record.id);
  if (!target || record.id === "context") return;
  const prompt = document.createElement("aside");
  prompt.className = "reading-resume";
  prompt.setAttribute("aria-label", "Resume reading");
  prompt.innerHTML =
    '<p>Continue from <strong></strong>?</p><div><button type="button" data-reading-continue>Continue</button><button type="button" data-reading-restart>Start from beginning</button></div>';
  prompt.querySelector("strong").textContent = record.label || "where you stopped";
  root.prepend(prompt);
  const dismiss = () => prompt.remove();
  prompt.querySelector("[data-reading-continue]").addEventListener("click", () => {
    replaceSectionHash(record.id);
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    dismiss();
  });
  prompt.querySelector("[data-reading-restart]").addEventListener("click", () => {
    clearReadingPosition(path);
    dismiss();
  });
}
