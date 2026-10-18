const USER = "sheikmoujabaa";
const LASTFM_ENDPOINT = "https://ws.audioscrobbler.com/2.0/";

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Method not allowed" });
  }
  const key = process.env.LASTFM_API_KEY;
  if (!key) return response.status(503).json({ error: "Listening status unavailable" });
  const params = new URLSearchParams({ method: "user.getrecenttracks", user: USER, api_key: key, format: "json", limit: "1" });
  try {
    const upstream = await fetch(`${LASTFM_ENDPOINT}?${params}`, { headers: { accept: "application/json" } });
    if (!upstream.ok) return response.status(502).json({ error: "Listening status unavailable" });
    const data = await upstream.json();
    const item = data?.recenttracks?.track?.[0];
    const track = item?.name?.trim();
    const artist = item?.artist?.["#text"]?.trim();
    if (!track || !artist) return response.status(404).json({ error: "No recent track" });
    response.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=120");
    return response.status(200).json({
      track,
      artist,
      nowPlaying: item?.["@attr"]?.nowplaying === "true",
      url: typeof item.url === "string" && item.url.startsWith("https://www.last.fm/") ? item.url : `https://www.last.fm/user/${USER}`
    });
  } catch {
    return response.status(502).json({ error: "Listening status unavailable" });
  }
}
