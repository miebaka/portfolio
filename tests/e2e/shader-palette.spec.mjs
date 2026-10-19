import { test, expect } from '@playwright/test';
import sharp from 'sharp';

test('Light water pixels remain inside the delegated palette, including after a theme switch', async ({ page }) => {
  test.setTimeout(60_000);
  await page.addInitScript(() => localStorage.setItem('color-theme', 'light'));
  await page.goto('/?shader-test=1');
  await expect(page.locator('[data-shader-backdrop]')).toHaveClass(/is-ready/);
  for (const theme of ['light', 'dark', 'light']) {
    await page.evaluate(theme => { document.documentElement.dataset.theme = theme; }, theme);
    await expect(page.locator('[data-shader-backdrop]')).toHaveAttribute('data-preset', `${theme === 'light' ? 'Light' : 'Dark'} water plane`);
    await page.waitForTimeout(600);
    if (theme === 'dark') continue;
    const { data, info } = await sharp(await page.screenshot({ scale: 'css', clip: { x: 10, y: 120, width: page.viewportSize().width - 20, height: 180 } })).raw().toBuffer({ resolveWithObject: true });
    // Paper #f8f9fc / neutral-96 #f2f3f8 / neutral-94 #eceef3.
    // One quantisation step allowed. Physical shading previously fell below this range.
    const low = [255, 255, 255], high = [0, 0, 0];
    let blueExcess = 0;
    for (let i = 0; i < data.length; i += info.channels) {
      for (let channel = 0; channel < 3; channel++) {
        low[channel] = Math.min(low[channel], data[i + channel]);
        high[channel] = Math.max(high[channel], data[i + channel]);
      }
      blueExcess = Math.max(blueExcess, data[i + 2] - data[i]);
    }
    for (let channel = 0; channel < 3; channel++) {
      expect(low[channel]).toBeGreaterThanOrEqual([235, 237, 242][channel]);
      expect(high[channel]).toBeLessThanOrEqual([249, 250, 253][channel]);
    }
    expect(blueExcess).toBeLessThanOrEqual(8);
  }
});

test('Vinyl spins like the reference and stops with the motion preference', async ({ page }) => {
  await page.goto('/');
  const disc = page.locator('.now-playing__vinyl');
  await expect(disc).toBeAttached();
  await page.evaluate(() => { document.documentElement.dataset.motion = 'full'; document.documentElement.dataset.motionPreference = 'full'; });
  expect(await disc.evaluate(el => getComputedStyle(el).animationDuration)).toBe('3.2s');
  const before = await disc.evaluate(el => getComputedStyle(el).transform);
  await page.waitForTimeout(100);
  expect(await disc.evaluate(el => getComputedStyle(el).transform)).not.toBe(before);
  await page.evaluate(() => { document.documentElement.dataset.motion = 'reduced'; document.documentElement.dataset.motionPreference = 'reduce'; });
  expect(await disc.evaluate(el => getComputedStyle(el).animationName)).toBe('none');
  await page.locator('.now-playing').focus();
  expect(await page.locator('.now-playing__arrow-track').evaluate(el => getComputedStyle(el).transform)).toBe('none');
  const box = await page.locator('.now-playing').boundingBox();
  const portrait = await page.locator('.home-profile__portrait').boundingBox();
  expect(Math.abs(box.width - portrait.width)).toBeLessThanOrEqual(1);
});


test('Print relief stays textured and paper-dominant in its still state', async ({ page }) => {
  test.setTimeout(60_000);
  await page.addInitScript(() => localStorage.setItem('color-theme', 'light'));
  await page.goto('/?shader-test=1&shader-static=1');
  await expect(page.locator('[data-shader-backdrop]')).toHaveClass(/is-ready/);
  // Inspect the actual field without text or the second, clipped content canvas.
  await page.addStyleTag({ content: 'main,header,footer,.skip-link{visibility:hidden!important}' });
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const { data, info } = await sharp(await page.screenshot({ scale: 'css' })).raw().toBuffer({ resolveWithObject: true });
  const levels = new Set();
  let paper = 0, deep = 0;
  const count = info.width * info.height;
  for (let i = 0; i < data.length; i += info.channels) {
    const red = data[i];
    levels.add(red);
    if (red >= 246) paper++;
    if (red <= 239) deep++;
  }
  // A flat fill used to satisfy every palette check. Require real tonal relief.
  expect(Math.max(...levels) - Math.min(...levels)).toBeGreaterThanOrEqual(8);
  expect(levels.size).toBeGreaterThanOrEqual(9);
  expect(paper / count).toBeGreaterThan(0.55);
  expect(deep / count).toBeLessThan(0.2);
});
