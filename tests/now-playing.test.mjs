import test from "node:test";
import assert from "node:assert/strict";
import handler from "../api/now-playing.js";

function response() {
  const state = { headers: {}, status: null, body: null };
  return {
    state,
    setHeader(name, value) { state.headers[name] = value; return this; },
    status(code) { state.status = code; return this; },
    json(value) { state.body = value; return this; }
  };
}

test("Last.fm API enforces GET without exposing the key", async () => {
  const res = response();
  await handler({ method: "POST" }, res);
  assert.equal(res.state.status, 405);
  assert.equal(res.state.headers.Allow, "GET");
});

test("missing Last.fm API key degrades safely", async () => {
  const key = process.env.LASTFM_API_KEY;
  delete process.env.LASTFM_API_KEY;
  try {
    const res = response();
    await handler({ method: "GET" }, res);
    assert.equal(res.state.status, 503);
    assert.deepEqual(res.state.body, { error: "Listening status unavailable" });
  } finally {
    if (key !== undefined) process.env.LASTFM_API_KEY = key;
  }
});

test("Last.fm status returns only genuine public track data", async () => {
  const key = process.env.LASTFM_API_KEY;
  const priorFetch = globalThis.fetch;
  process.env.LASTFM_API_KEY = "private-unit-test-key";
  let requestUrl;
  globalThis.fetch = async url => {
    requestUrl = String(url);
    return { ok: true, json: async () => ({ recenttracks: { track: [{
      name: "Example Track",
      artist: { "#text": "Example Artist" },
      "@attr": { nowplaying: "true" },
      url: "https://www.last.fm/music/Example/Track"
    }] } }) };
  };
  try {
    const res = response();
    await handler({ method: "GET" }, res);
    assert.equal(res.state.status, 200);
    assert.equal(res.state.body.track, "Example Track");
    assert.equal(res.state.body.artist, "Example Artist");
    assert.equal(res.state.body.nowPlaying, true);
    assert.equal(res.state.body.url, "https://www.last.fm/music/Example/Track");
    assert.match(requestUrl, /user=sheikmoujabaa/);
    assert.equal(JSON.stringify(res.state.body).includes("private-unit-test-key"), false);
  } finally {
    globalThis.fetch = priorFetch;
    if (key === undefined) delete process.env.LASTFM_API_KEY;
    else process.env.LASTFM_API_KEY = key;
  }
});

test("Last.fm rejects empty or upstream-broken responses", async () => {
  const key = process.env.LASTFM_API_KEY;
  const priorFetch = globalThis.fetch;
  process.env.LASTFM_API_KEY = "private-unit-test-key";
  try {
    globalThis.fetch = async () => ({ ok: true, json: async () => ({ recenttracks: { track: [] } }) });
    const empty = response();
    await handler({ method: "GET" }, empty);
    assert.equal(empty.state.status, 404);
    globalThis.fetch = async () => { throw new Error("No network"); };
    const error = response();
    await handler({ method: "GET" }, error);
    assert.equal(error.state.status, 502);
  } finally {
    globalThis.fetch = priorFetch;
    if (key === undefined) delete process.env.LASTFM_API_KEY;
    else process.env.LASTFM_API_KEY = key;
  }
});
