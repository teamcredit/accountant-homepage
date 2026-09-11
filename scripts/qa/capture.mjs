import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

const label = process.argv[2] || 'baseline';
const root = `artifacts/${label}`;
await mkdir(root, { recursive: true });
const browser = await chromium.launch();
const manifest = { commit: execFileSync('git', ['rev-parse', 'HEAD']).toString().trim(), browser: browser.version(), runs: [] };
for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  const context = await browser.newContext({ viewport, isMobile: viewport.width < 700, hasTouch: viewport.width < 700, recordVideo: { dir: `${root}/videos`, size: viewport } });
  await context.route('**/api/contact', route => route.abort());
  await context.tracing.start({ screenshots: true, snapshots: true });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const routes = ['/', '/about', '/portal', '/services', '/clients', '/members', '/pricing', '/contact', '/faq', '/blog'];
  for (const route of routes) {
    await page.goto(`http://localhost:3100${route}`);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(700);
    const name = `${viewport.width}-${route.replaceAll('/', '-') || 'home'}`;
    await page.screenshot({ path: `${root}/${name}-start.png` });
    const sections = await page.locator('main section').evaluateAll(elements => elements.map(el => ({ id: el.id, className: el.className, height: el.getBoundingClientRect().height, title: el.querySelector('h1,h2')?.textContent })));
    manifest.runs.push({ route, viewport, sections, errors: [...errors] });
    if (['/', '/about', '/portal'].includes(route)) {
      const height = await page.locator('body').evaluate(el => el.scrollHeight);
      for (let y = 0, step = 0; y < height; y += viewport.height * .7, step++) {
        await page.mouse.wheel(0, viewport.height * .7);
        await page.waitForTimeout(180);
        if (step % 4 === 0) await page.screenshot({ path: `${root}/${name}-scroll-${step}.png` });
      }
      await page.keyboard.press('End');
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${root}/${name}-end.png` });
      for (let i = 0; i < 8; i++) { await page.mouse.wheel(0, -viewport.height); await page.waitForTimeout(150); }
      await page.keyboard.press('Home');
    }
  }
  await context.tracing.stop({ path: `${root}/${viewport.width}-trace.zip` });
  await context.close();
}
await browser.close();
await writeFile(`${root}/manifest.json`, JSON.stringify(manifest, null, 2));
console.log(`Captured ${manifest.runs.length} route/viewport combinations in ${root}`);
