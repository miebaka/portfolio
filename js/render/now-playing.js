/* ==========================================================================
   now-playing.js — Last.fm "currently listening" chip for the home hero.
   Shows the active track or clearly labels the most recently played track.
   ========================================================================== */
import { SITE } from "../../data/site.js";
import { MOUNT } from "../core/contract.js";

const ENDPOINT =
  "https://ws.audioscrobbler.com/2.0/?method=user.getRecentTracks" +
  "&user=" + SITE.lastfmUser +
  "&api_key=" + SITE.lastfmKey +
  "&format=json&limit=1";

const POLL_MS = 60_000;

let chip = null;

async function fetchNowPlaying() {
  try {
    const res = await fetch(ENDPOINT, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    const track = data?.recenttracks?.track?.[0];
    if (!track) return null;
    return { name: track.name, artist: track.artist["#text"], live: track["@attr"]?.nowplaying === "true" };
  } catch {
    return null;
  }
}

function buildChip(container) {
  chip = document.createElement("a");
  chip.className = "now-playing-pill";
  chip.href = "https://www.last.fm/user/" + encodeURIComponent(SITE.lastfmUser);
  chip.target = "_blank";
  chip.rel = "noopener noreferrer";
  chip.setAttribute("aria-live", "polite");
  chip.setAttribute("aria-label", "Open Miebaka's listening history on Last.fm");
  chip.innerHTML =
    '<span class="now-playing-pill__mark" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6Z"/></svg><i></i></span>' +
    '<span class="now-playing-pill__copy"><span class="now-playing-pill__label">CHECKING LAST.FM</span><b class="now-playing-pill__track">LISTENING HISTORY</b></span>' +
    '<span class="now-playing-pill__arrow" aria-hidden="true">↗</span>';
  chip.dataset.live = "false";
  container.appendChild(chip);
}

function updateChip(track) {
  if (!chip) return;
  if (track) {
    chip.querySelector(".now-playing-pill__track").textContent =
      track.name + " · " + track.artist;
    chip.querySelector(".now-playing-pill__label").textContent = track.live ? "NOW PLAYING" : "LAST PLAYED";
    chip.setAttribute("aria-label", (track.live ? "Now listening to " : "Last listened to ") + track.name + " by " + track.artist + ". Open Last.fm history");
    chip.dataset.live = String(track.live);
    chip.hidden = false;
  } else {
    chip.querySelector(".now-playing-pill__label").textContent = "LISTENING HISTORY";
    chip.querySelector(".now-playing-pill__track").textContent = "OPEN LAST.FM";
    chip.setAttribute("aria-label", "Open Miebaka's listening history on Last.fm");
    chip.dataset.live = "false";
  }
}

/* Backoff. The original loop hit Last.fm every 60s forever, including while
   the tab was in the background and including while the service was down.
   Failures now back off up to eight minutes, and a success resets it. */
const MAX_BACKOFF_MS = 8 * 60_000;

let timer = 0;
let backoff = POLL_MS;

function schedule(ms) {
  clearTimeout(timer);
  timer = setTimeout(poll, ms);
}

async function poll() {
  /* Nothing to show and nobody looking: skip the request entirely and wait
     for visibilitychange to restart the loop. */
  if (document.hidden) {
    timer = 0;
    return;
  }
  const track = await fetchNowPlaying();
  updateChip(track);
  backoff = track ? POLL_MS : Math.min(backoff * 2, MAX_BACKOFF_MS);
  schedule(track ? POLL_MS : backoff);
}

export function initNowPlaying() {
  if (!SITE.lastfmUser || !SITE.lastfmKey) return;
  const container = document.querySelector(`[data-mount="${MOUNT.NOW_PLAYING}"]`);
  if (!container) return;
  buildChip(container);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      clearTimeout(timer);
      timer = 0;
    } else if (!timer) {
      /* Returning to the tab is a good moment to be current again, so reset
         the backoff rather than resuming a long one. */
      backoff = POLL_MS;
      schedule(0);
    }
  });

  if (document.readyState === "complete") schedule(0);
  else window.addEventListener("load", () => schedule(0), { once: true });
}
