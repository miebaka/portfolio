import { test, expect } from "@playwright/test";

test("Last.fm pill follows the logo, reflects real status, and Index inverts with theme", async ({ page }) => {
  await page.route("**/api/now-playing", route => route.fulfill({
    status: 200, contentType: "application/json",
    body: JSON.stringify({
      track: "Test track", artist: "Test artist", nowPlaying: true,
      url: "https://www.last.fm/music/Test+artist/_/Test+track"
    })
  }));
  await page.goto("/index.html?now-playing-test=1");
  const pill = page.locator(".site-nav__listening .now-playing");
  await expect(pill).toContainText("Miebaka Is Listening To");
  await expect(pill).toContainText("Test track — Test artist");
  await expect(pill).toHaveAttribute("data-live", "true");
  const nav = page.locator(".site-nav__inner");
  await expect(nav.locator(".site-nav__leading .site-nav__brand")).toHaveCount(1);
  await expect(nav.locator(".site-nav__leading .site-nav__listening")).toHaveCount(1);
  for (const theme of ["light", "dark"]) {
    await page.evaluate(mode => { document.documentElement.dataset.theme = mode; }, theme);
    const colors = await page.locator(".site-nav__menu-btn").evaluate(button => {
      const style = getComputedStyle(button);
      const root = getComputedStyle(document.documentElement);
      const resolve = token => {
        const test = document.createElement("div");
        test.style.color = "var(" + token + ")";
        document.body.append(test);
        const color = getComputedStyle(test).color;
        test.remove();
        return color;
      };
      return {
        text: style.color, fill: style.backgroundColor,
        ink: resolve("--ink"), paper: resolve("--paper"),
        offset: (button.getBoundingClientRect().left + button.getBoundingClientRect().right) / 2 -
          (document.documentElement.clientWidth / 2)
      };
    });
    // Root tokens change immediately, while the button's CSS transition
    // finishes a fraction of a second later. Assert the settled state.
    await expect.poll(() => page.locator(".site-nav__menu-btn").evaluate(button => {
      const style = getComputedStyle(button);
      const probe = document.createElement("span");
      probe.style.color = "var(--ink)";
      document.body.append(probe);
      const ink = getComputedStyle(probe).color;
      probe.style.color = "var(--paper)";
      const paper = getComputedStyle(probe).color;
      probe.remove();
      return style.backgroundColor === ink && style.color === paper;
    })).toBe(true);
    expect(Math.abs(colors.offset)).toBeLessThan(4);
  }
});

test("the listening header switches to past tense when live playback ends", async ({ page }) => {
  await page.clock.install();
  let isLive = true;
  await page.route("**/api/now-playing", route => route.fulfill({
    json: { track: "Test track", artist: "Test artist", nowPlaying: isLive,
      playedAt: Math.floor(Date.now() / 1000) - 5 }
  }));
  await page.goto("/index.html?now-playing-test=1");
  const pill = page.locator(".now-playing");
  await expect(pill.locator(".now-playing__label")).toHaveText("Miebaka Is Listening To");
  isLive = false;
  await page.clock.fastForward(60_000);
  await expect(pill.locator(".now-playing__label")).toHaveText("Miebaka Was Listening To");
  await expect(pill).toHaveAttribute("data-live", "false");
});

test("Now Playing stays a truthful accessible profile link when Last.fm is unavailable", async ({ page }) => {
  await page.route("**/api/now-playing", route => route.fulfill({
    status: 503, contentType: "application/json", body: '{"error":"Listening status unavailable"}'
  }));
  await page.goto("/index.html?now-playing-test=1");
  const pill = page.locator(".now-playing");
  await expect(pill).toHaveAttribute("href", "https://www.last.fm/user/sheikmoujabaa");
  await expect(pill).toHaveAttribute("data-live", "false");
  await expect(pill).not.toContainText("DJ Habias");
});

test("navbar fits at 320px and remains readable with scripting disabled", async ({ page, browser }) => {
  await page.setViewportSize({ width: 320, height: 768 });
  await page.goto("/index.html");
  const bounds = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    width: document.documentElement.clientWidth,
    links: [...document.querySelectorAll(".site-nav__leading,.site-nav__menu-btn,.site-nav__themes")]
      .map(node => node.getBoundingClientRect().toJSON())
  }));
  expect(bounds.scroll).toBeLessThanOrEqual(bounds.width + 1);
  expect(bounds.links[0].right).toBeLessThan(bounds.links[1].left + 2);
  expect(bounds.links[1].right).toBeLessThan(bounds.links[2].left + 2);
  const context = await browser.newContext({ javaScriptEnabled: false });
  const noJS = await context.newPage();
  await noJS.goto("/index.html");
  await expect(noJS.locator(".site-nav__listening a")).toHaveAttribute("href", /last\.fm/);
  await context.close();
});


test("a previously live track clears when Last.fm goes offline", async ({ page }) => {
  await page.clock.install();
  let requests = 0;
  await page.route("**/api/now-playing", route => {
    requests++;
    if (requests === 1) {
      return route.fulfill({
        status: 200, contentType: "application/json",
        body: JSON.stringify({
          track: "A live track", artist: "An artist", nowPlaying: true,
          url: "https://www.last.fm/music/An+artist/_/A+live+track"
        })
      });
    }
    return route.fulfill({
      status: 503, contentType: "application/json",
      body: '{"error":"Listening status unavailable"}'
    });
  });
  // The local static test server has no Vercel Function; opt in to mock fetch.
  await page.goto("/index.html?now-playing-test=1");
  const pill = page.locator(".now-playing");
  await expect(pill).toContainText("Miebaka Is Listening To");
  await expect(pill).toHaveAttribute("data-live", "true");

  await page.clock.fastForward(60_000);
  await expect(pill).toContainText("Listening history");
  await expect(pill).toHaveAttribute("data-live", "false");
  await expect(pill).toHaveAttribute("href", "https://www.last.fm/user/sheikmoujabaa");
  expect(requests).toBeGreaterThanOrEqual(2);
});
