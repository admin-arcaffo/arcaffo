import { createRequire } from 'node:module';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const run = promisify(execFile);
const base = process.env.AUDIT_URL || 'https://arcaffo-5uat6bcat-arcaffo-group.vercel.app';
const temp = await mkdtemp('/private/tmp/arcaffo-preview-audit-');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const report = { base, transport: 'Protected deployment GET through authenticated Vercel CLI; Forms GET directly in Chrome', providerWrites: 0, errors: [] };
let index = 0;
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.route(`${base}/**`, async route => {
    assert.equal(route.request().method(), 'GET');
    const id = index++;
    const url = new URL(route.request().url());
    const output = `${temp}/${id}.body`;
    const headers = `${temp}/${id}.headers`;
    await run('vercel', ['curl', url.pathname + url.search, '--deployment', base, '--', '--silent', '--show-error', '--output', output, '--dump-header', headers], { maxBuffer: 1024 * 1024 });
    const raw = await readFile(headers, 'utf8');
    const status = Number(raw.match(/HTTP\/[\d.]+ (\d+)/)?.[1]);
    const contentType = raw.match(/^content-type:\s*(.+)$/im)?.[1].trim() || 'application/octet-stream';
    assert.equal(status, 200, `${url.pathname}: ${status}`);
    await route.fulfill({ status, contentType, body: await readFile(output) });
  });
  await context.route('https://forms.arcaffo.com/**', route => {
    if (route.request().method() === 'GET') return route.continue();
    report.providerWrites++;
    return route.abort();
  });
  const page = await context.newPage();
  page.on('pageerror', error => report.errors.push(error.message));
  const definition = page.waitForResponse(response => response.url().includes('forms.arcaffo.com/api/embed/forms/'));
  await page.goto(`${base}/contato.html`, { timeout: 120000 });
  report.providerGetStatus = (await definition).status();
  await page.locator('.arcaffo-form').waitFor({ timeout: 30000 });
  await page.getByRole('button', { name: 'Enviar minha solicitação' }).waitFor();
  await page.evaluate(() => document.fonts.ready);
  report.fields = await page.locator('.arcaffo-fields input').count();
  report.heading = await page.locator('h1').textContent();
  report.font = await page.evaluate(() => document.fonts.check('300 32px Newsreader'));
  report.overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
  assert.equal(report.providerGetStatus, 200);
  assert.equal(report.fields, 3);
  assert.equal(report.font, true);
  assert.equal(report.overflow, false);
  assert.deepEqual(report.errors, []);
  assert.equal(report.providerWrites, 0);
  await page.screenshot({ path: '.impeccable/qa/materia/preview-contact-390.png', fullPage: true });
  report.ok = true;
} finally {
  await browser.close();
  await writeFile('.impeccable/qa/materia/preview.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}
