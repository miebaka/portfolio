/* Genuine server-backed Last.fm listening status, never a hard-coded song.
   The pill always links to the owner's public Last.fm profile when the API
   is unavailable, and only animates while actually listening. */
import { SITE } from "../../data/site.js";
import { MOUNT } from "../core/contract.js";

const POLL_MS = 60_000;
const MAX_BACKOFF_MS = 8 * POLL_MS;

export function initNowPlaying({
  document: doc = globalThis.document,
  window: win = globalThis.window,
  fetchStatus = () => fetch("/api/now-playing", { cache: "no-store", headers: { accept: "application/json" } }),
} = {}) {
  const mount = doc?.querySelector('[data-mount="' + MOUNT.NOW_PLAYING + '"]');
  if (!mount || !SITE.lastfmUser) return null;
  mount.replaceChildren();

  const pill = doc.createElement("a");
  const profile = "https://www.last.fm/user/" + encodeURIComponent(SITE.lastfmUser);
  pill.className = "now-playing";
  pill.href = profile;
  pill.target = "_blank";
  pill.rel = "noopener noreferrer";
  pill.dataset.live = "false";
  pill.setAttribute("aria-label", "Open listening history on Last.fm");
  pill.innerHTML = '<span class="now-playing__vinyl" aria-hidden="true"></span>' +
    '<span class="now-playing__copy"><span class="now-playing__label">On Last.fm</span>' +
    '<span class="now-playing__track">Listening history</span></span>';
  mount.append(pill);

  const label = pill.querySelector(".now-playing__label");
  const track = pill.querySelector(".now-playing__track");
  let timer = 0;
  let backoff = POLL_MS;
  let destroyed = false;
  const schedule = delay => {
    win.clearTimeout(timer);
    if (!destroyed && !doc.hidden) timer = win.setTimeout(poll, delay);
  };
  async function poll() {
    timer = 0;
    if (destroyed || doc.hidden) return;
    let data = null;
    try {
      const response = await fetchStatus();
      if (response.ok) {
        const value = await response.json();
        if (typeof value.track === "string" && typeof value.artist === "string")
          data = value;
      }
    } catch { /* Keep the honest profile link during upstream outages. */ }
    if (destroyed) return;
    if (data) {
      const isLive = data.nowPlaying === true;
      const status = isLive ? "Now playing" : "Recently played";
      const title = data.track + " — " + data.artist;
      label.textContent = status;
      track.textContent = title;
      pill.dataset.live = String(isLive);
      pill.href = typeof data.url === "string" && data.url.startsWith("https://www.last.fm/") ? data.url : profile;
      pill.setAttribute("aria-label", status + ": " + title + ". Open on Last.fm.");
    }
    backoff = data ? POLL_MS : Math.min(backoff * 2, MAX_BACKOFF_MS);
    schedule(backoff);
  }
  const onVisibility = () => {
    if (doc.hidden) {
      win.clearTimeout(timer);
      timer = 0;
    } else if (!timer) {
      backoff = POLL_MS;
      schedule(0);
    }
  };
  const destroy = () => {
    destroyed = true;
    win.clearTimeout(timer);
    doc.removeEventListener("visibilitychange", onVisibility);
    win.removeEventListener("pagehide", destroy);
  };
  doc.addEventListener("visibilitychange", onVisibility);
  win.addEventListener("pagehide", destroy, { once: true });
  // Poll on every host, including local development and browser-test servers.
  // A missing endpoint safely leaves the original profile link in place.
  schedule(0);
  return { destroy };
}
