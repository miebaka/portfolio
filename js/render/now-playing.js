/* ==========================================================================
   now-playing.js — Last.fm "currently listening" chip for the home hero.
   Polls every 60 s; renders only when a track is actively playing.
   ========================================================================== */
import { SITE } from "../../data/site.js";

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
      track.name + " — " + track.artist;
    chip.hidden = false;
  } else {
    chip.hidden = true;
  }
}

async function poll() {
  updateChip(await fetchNowPlaying());
  setTimeout(poll, POLL_MS);
}

export function initNowPlaying() {
  if (!SITE.lastfmUser || !SITE.lastfmKey) return;
  const container = document.querySelector("[data-mount='now-playing']");
  if (!container) return;
  buildChip(container);
  poll();
}
