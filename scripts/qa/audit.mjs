import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';

await mkdir('artifacts/audit', { recursive: true });
const browser = await chromium.launch();
const results = [];
for (const width of [1440, 390]) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  for (const route of ['/', '/services', '/clients', '/contact', '/blog', '/portal', '/faq', '/pricing']) {
    const errors = [];
    const onError = error => errors.push(error.message);
    page.on('pageerror', onError);
    await page.goto(`http://localhost:3100${route}`);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(400);
    const violations = (await new AxeBuilder({ page }).analyze()).violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) }));
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    results.push({ route, width, errors, overflow, violations });
    page.off('pageerror', onError);
    console.log(route, width, violations.map(v => `${v.id}:${v.nodes.length}`).join(', '));
  }
  await context.close();
}
await browser.close();
await writeFile('artifacts/audit/results.json', JSON.stringify(results, null, 2));
