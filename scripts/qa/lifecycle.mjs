import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await context.addInitScript(() => {
  const pending = new Set();
  const request = window.requestAnimationFrame.bind(window);
  const cancel = window.cancelAnimationFrame.bind(window);
  window.requestAnimationFrame = callback => {
    const id = request(time => { pending.delete(id); callback(time); });
    pending.add(id);
    return id;
  };
  window.cancelAnimationFrame = id => { pending.delete(id); cancel(id); };
  window.__qaPendingFrames = () => pending.size;
});
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
await page.goto('http://localhost:3100/');
const origin = await page.evaluate(() => performance.timeOrigin);
const cycles = [];
for (let cycle = 0; cycle < 10; cycle++) {
  for (const route of ['/portal', '/about', '/contact', '/']) {
    await page.locator(`footer a[href="${route}"]`).first().click();
    await page.waitForURL(`http://localhost:3100${route}`);
    await page.waitForTimeout(400);
    await page.mouse.wheel(0, 650);
    await page.waitForTimeout(300);
  }
  await page.waitForTimeout(1000);
  cycles.push(await page.evaluate(() => ({ pendingFrames: window.__qaPendingFrames(), timeOrigin: performance.timeOrigin })));
}
const result = { errors, cycles, sameDocument: cycles.every(item => item.timeOrigin === origin) };
await mkdir('artifacts/acceptance', { recursive: true });
await writeFile('artifacts/acceptance/lifecycle.json', JSON.stringify(result, null, 2));
console.log(JSON.stringify(result));
await browser.close();
if (errors.length || !result.sameDocument || cycles.at(-1).pendingFrames > cycles[0].pendingFrames + 2) process.exitCode = 1;
