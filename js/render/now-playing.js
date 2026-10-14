/* ==========================================================================
   now-playing.js — static Last.fm listening-history link for the home hero.
   The browser does not send a third-party API request or expose a public key.
   ========================================================================== */
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
    '<span class="now-playing__dot" aria-hidden="true"></span>' +
    '<span class="now-playing__label">What I listen to</span>' +
    '<span class="now-playing__track">Last.fm</span>' +
    '<span class="now-playing__arrow" aria-hidden="true">↗</span>';
  chip.dataset.live = "false";
  container.appendChild(chip);
}

export function initNowPlaying() {
  if (!SITE.lastfmUser) return;
  const container = document.querySelector(`[data-mount="${MOUNT.NOW_PLAYING}"]`);
  if (!container) return;
  buildChip(container);
}
