/* Public Last.fm status; API credentials never leave this server boundary. */
import { siteConfig } from "../data/site-config.js";

const ENDPOINT = "https://ws.audioscrobbler.com/2.0/";

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Method not allowed" });
  }
  const key = process.env.LASTFM_API_KEY;
  if (!key) return response.status(503).json({ error: "Listening status unavailable" });
  const user = siteConfig.lastfmUser;
  const query = new URLSearchParams({
    method: "user.getrecenttracks", user, api_key: key, format: "json", limit: "1",
  });
  try {
    const upstream = await fetch(ENDPOINT + "?" + query, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(4_500),
    });
    if (!upstream.ok) return response.status(502).json({ error: "Listening status unavailable" });
    const result = await upstream.json();
    const item = result?.recenttracks?.track?.[0];
    const track = typeof item?.name === "string" ? item.name.trim().slice(0, 140) : "";
    const artist = typeof item?.artist?.["#text"] === "string"
      ? item.artist["#text"].trim().slice(0, 140) : "";
    if (!track || !artist) return response.status(404).json({ error: "No recent track" });
    const profile = "https://www.last.fm/user/" + encodeURIComponent(user);
    const url = typeof item.url === "string" && item.url.startsWith("https://www.last.fm/")
      ? item.url : profile;
    return response.status(200).json({
      track, artist, nowPlaying: item?.["@attr"]?.nowplaying === "true", url,
    });
  } catch {
    return response.status(502).json({ error: "Listening status unavailable" });
  }
}
