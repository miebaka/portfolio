/* ==========================================================================
   now-playing.js — Last.fm "currently listening" chip for the home hero.
   Polls every 60 s; renders only when a track is actively playing.
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
    if (!track || track["@attr"]?.nowplaying !== "true") return null;
    return { name: track.name, artist: track.artist["#text"] };
  } catch {
    return null;
  }
}

function buildChip(container) {
  chip = document.createElement("span");
  chip.className = "now-playing";
  chip.setAttribute("aria-live", "polite");
  chip.setAttribute("aria-label", "Currently listening");
  chip.innerHTML =
    '<span class="now-playing__dot" aria-hidden="true"></span>' +
    '<span class="now-playing__label" aria-hidden="true">Listening</span>' +
    '<span class="now-playing__track"></span>';
  chip.hidden = true;
  container.appendChild(chip);
}

function updateChip(track) {
  if (!chip) return;
  if (track) {
    chip.querySelector(".now-playing__track").textContent =
      track.name + ", " + track.artist;
    chip.hidden = false;
  } else {
    chip.hidden = true;
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

  window.addEventListener("load", () => schedule(0), { once: true });
}
