import { chromium } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const baseURL = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:4000';
const widths = [360, 390, 768, 1024, 1280, 1440, 1920];
const htmlRoot = path.resolve('dist');
const outputRoot = path.resolve(process.env.AUDIT_OUTPUT_ROOT || 'audit/before');

async function collectHtmlFiles(directory, prefix = '') {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const relative = path.join(prefix, entry.name);
    if (entry.isDirectory()) files.push(...(await collectHtmlFiles(path.join(directory, entry.name), relative)));
    if (entry.isFile() && entry.name.endsWith('.html')) files.push(relative);
  }
  return files.sort();
}

function routeFor(file) {
  return file === 'index.html' ? '/' : `/${file}`;
}

function slugFor(file) {
  return file.replace(/\.html$/, '').replaceAll(path.sep, '--');
}

const browser = await chromium.launch();
const files = await collectHtmlFiles(htmlRoot);
const summary = [];
await mkdir(outputRoot, { recursive: true });

for (const file of files) {
  const route = routeFor(file);
  const slug = slugFor(file);
  for (const reducedMotion of ['reduce', 'no-preference']) {
    for (const width of widths) {
      const context = await browser.newContext({
        viewport: { width, height: 900 },
        reducedMotion,
        colorScheme: 'light',
      });
      const page = await context.newPage();
      const response = await page.goto(`${baseURL}${route}`, { waitUntil: 'networkidle' });
      await page.screenshot({
        path: path.join(outputRoot, `${slug}--${width}--motion-${reducedMotion}.png`),
        fullPage: true,
      });

      if (reducedMotion === 'reduce') {
        const styles = await page.locator('body *').evaluateAll((elements) =>
          elements.map((element, index) => {
            const style = getComputedStyle(element);
            return {
              index,
              tag: element.tagName.toLowerCase(),
              id: element.id || null,
              class: typeof element.className === 'string' ? element.className : null,
              text: (element.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 120),
              fontFamily: style.fontFamily,
              fontSize: style.fontSize,
              fontWeight: style.fontWeight,
              lineHeight: style.lineHeight,
              letterSpacing: style.letterSpacing,
              color: style.color,
              backgroundColor: style.backgroundColor,
              padding: style.padding,
              margin: style.margin,
              gap: style.gap,
              borderRadius: style.borderRadius,
            };
          }),
        );
        await writeFile(
          path.join(outputRoot, `${slug}--${width}--computed-styles.json`),
          `${JSON.stringify(styles, null, 2)}\n`,
        );
      }

      if (reducedMotion === 'reduce' && width === 390) {
        const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze();
        await writeFile(path.join(outputRoot, `${slug}--axe.json`), `${JSON.stringify(axe, null, 2)}\n`);
      }

      summary.push({ file, route, width, reducedMotion, status: response?.status() ?? null, url: page.url() });
      await context.close();
    }
  }
}

await browser.close();
await writeFile(path.join(outputRoot, 'capture-summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
