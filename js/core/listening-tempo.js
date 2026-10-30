import { TEMPOS } from '../../data/tempos.js';
const normalize = value => String(value || '').normalize('NFKC').trim().toLowerCase().replace(/\s+/g, ' ');
export function resolveTempo(track, catalogue = TEMPOS) {
  if (!track?.live) return null;
  const entry = catalogue.find(item => normalize(item.artist) === normalize(track.artist) && normalize(item.title) === normalize(track.name));
  return entry && /^https:\/\//.test(entry.source) && Number.isFinite(entry.bpm) && entry.bpm >= 30 && entry.bpm <= 300 ? entry.bpm : null;
}
let state = { bpm: null, expires: 0 };
export function publishListening(track) {
  state = { bpm: resolveTempo(track), expires: Date.now() + 90000 };
  window.dispatchEvent(new CustomEvent('listening-tempo', { detail: state }));
}
export function currentTempo() { return state; }
