import { publishListening } from '../core/listening-tempo.js';
/* Live listening status. Last.fm credentials stay on the server boundary. */
import { SITE } from "../../data/site.js";
import { MOUNT } from "../core/contract.js";

function buildChip(container) {
  const chip = document.createElement("a");
  chip.className = "now-playing";
  chip.href = "https://www.last.fm/user/" + encodeURIComponent(SITE.lastfmUser);
  chip.target = "_blank";
  chip.rel = "noopener noreferrer";
  chip.setAttribute("aria-live", "polite");
  chip.setAttribute("aria-label", "Open Miebaka's listening history on Last.fm");
  chip.innerHTML =
    '<span class="now-playing__vinyl" aria-hidden="true"><i></i></span>' +
    '<span class="now-playing__copy"><span class="now-playing__label">Currently listening to:</span>' +
    '<span class="now-playing__track">Que Linda — DJ Habias</span></span>' +
    '<span class="now-playing__arrow" aria-hidden="true"><span class="now-playing__arrow-track"><i>↗</i><i>↗</i></span></span>';
  chip.dataset.live = "false";
  container.appendChild(chip);
  return chip;
}

const POLL_MS = 60_000;
const MAX_BACKOFF_MS = 8 * POLL_MS;

async function fetchNowPlaying() {
  try {
    const response = await fetch("/api/now-playing", { cache: "no-store", headers: { accept: "application/json" } });
    if (!response.ok) return null;
    const value = await response.json();
    return value && typeof value.track === "string" && typeof value.artist === "string" ? value : null;
  } catch { return null; }
}

export function initNowPlaying() {
  if (!SITE.lastfmUser) return;
  const container = document.querySelector(`[data-mount="${MOUNT.NOW_PLAYING}"]`);
  if (!container) return;
  const chip = buildChip(container);
  const track = chip.querySelector(".now-playing__track");
  const label = chip.querySelector(".now-playing__label");
  let timer = 0;
  let backoff = POLL_MS;
  const schedule = delay => { clearTimeout(timer); timer = setTimeout(poll, delay); };
  const update = value => {
    if (!value) return;
    track.textContent = `${value.track} — ${value.artist}`;
    label.textContent = value.nowPlaying ? "Currently listening to:" : "Recently listened to:";
    chip.dataset.live = String(Boolean(value.nowPlaying));
    chip.href = value.url || chip.href;
    chip.setAttribute("aria-label", `${label.textContent} ${track.textContent}. Open on Last.fm`);
  };
  async function poll() {
    if (document.hidden) { timer = 0; return; }
    const value = await fetchNowPlaying();
    publishListening(value ? { name: value.track, artist: value.artist, live: value.nowPlaying } : null);
    update(value);
    backoff = value ? POLL_MS : Math.min(backoff * 2, MAX_BACKOFF_MS);
    schedule(backoff);
  }
  const visibility = () => {
    if (document.hidden) { clearTimeout(timer); timer = 0; }
    else if (!timer) { backoff = POLL_MS; schedule(0); }
  };
  document.addEventListener("visibilitychange", visibility);
  if (!['localhost', '127.0.0.1'].includes(location.hostname)) schedule(0);
  addEventListener("pagehide", () => {
    clearTimeout(timer);
    document.removeEventListener("visibilitychange", visibility);
  }, { once: true });
}
