import { test, expect } from '@playwright/test';

test('motion choice remains consistent across theme controls and the pointer field', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/about.html');
  await page.locator('.site-nav__menu-btn').click();
  await page.locator('[data-motion-choice="reduce"]').click();
  await page.locator('[data-theme-choice="dark"]').click();
  await page.locator('[data-index-close]').click();
  await page.locator('.theme-cord').press('Enter');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
  expect(await page.evaluate(() => localStorage.getItem('motion-preference'))).toBe('reduce');
  await page.mouse.move(70, 260);
  await page.waitForTimeout(50);
  const before = await page.locator('.editorial-field').evaluate(canvas => canvas.toDataURL());
  await page.mouse.move(170, 330);
  await page.waitForTimeout(50);
  expect(await page.locator('.editorial-field').evaluate(canvas => canvas.toDataURL())).toBe(before);
  await page.goto('/writing/designing-for-disability-in-nigeria.html');
  await expect(page.locator('.editorial-field')).toHaveCount(0);
});

test('a failed refresh retires a previous current-listening claim', async ({ page, context }) => {
  let calls = 0;
  await context.route('https://portfolio-review.test/**', async route => {
    const path = new URL(route.request().url()).pathname;
    if (path === '/api/now-playing') {
      calls += 1;
      await route.fulfill(calls === 1
        ? { status: 200, json: { track: 'Verified track', artist: 'Test artist', nowPlaying: true, url: 'https://www.last.fm/music/test' } }
        : { status: 503, json: { error: 'Unavailable' } });
      return;
    }
    const response = await context.request.get('http://127.0.0.1:4173' + path);
    await route.fulfill({ response });
  });
  await page.clock.install();
  await page.goto('https://portfolio-review.test/');
  await page.clock.runFor(300);
  await expect(page.locator('.now-playing')).toHaveAttribute('data-live', 'true');
  await page.clock.runFor(61_000);
  await expect(page.locator('.now-playing__track')).toHaveText('Listening history on Last.fm');
  await expect(page.locator('.now-playing')).toHaveAttribute('data-live', 'false');
  expect(calls).toBeGreaterThanOrEqual(2);
});

test('cases identify the project first and retain legacy chapter anchors', async ({ page }) => {
  for (const [slug, title, chapters] of [['rivo', 'Rivo Studio', 4], ['tedx-rsu', 'TEDx RSU', 5], ['chopbox', 'ChopBox', 3]]) {
    await page.goto('/work/' + slug + '.html');
    await expect(page.locator('h1')).toHaveText(title);
    await expect(page.locator('.case-chapter')).toHaveCount(chapters);
    await expect(page.locator('.case-proof')).toHaveCount(0);
    await expect(page.locator('.case-scope-note')).not.toBeEmpty();
    for (const id of ['context', 'decision', 'system', 'applications', 'reflection']) await expect(page.locator('[id="' + id + '"]')).toHaveCount(1);
  }
});
