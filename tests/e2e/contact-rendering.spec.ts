import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';

test('contact is prerendered instead of rendered on every Worker request', () => {
  const manifest = JSON.parse(readFileSync('.next/prerender-manifest.json', 'utf8'));
  expect(manifest.routes['/contact']).toBeDefined();
  expect(manifest.routes['/contact'].initialRevalidateSeconds).toBe(false);
});

test('contact keeps its form and direct contact details without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, ignoreHTTPSErrors: true });
  const page = await context.newPage();
  await page.goto(`${baseURL}/contact`);
  await expect(page.getByLabel('현재 상황')).toBeVisible();
  await expect(page.getByRole('heading', { name: '직접 연락처로 보내기' })).toBeVisible();
  await context.close();
});
