import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';

const base = process.env.AUDIT_URL || 'http://127.0.0.1:4173';
const output = '.impeccable/qa/span-compressed';
const routes = [
  '/',
  '/sobre.html',
  '/servicos.html',
  '/agencia-de-branding-campo-grande/',
  '/agencia-de-marketing-campo-grande/',
  '/projetos/indreco.html',
  '/artigos/branding-para-empresas-b2b.html',
];
const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'desktop', width: 1440, height: 900 },
];

mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const report = { base, pages: [], typekitResponses: [], errors: [] };

try {
  const context = await browser.newContext();
  const page = await context.newPage();
  page.on('pageerror', error => report.errors.push(error.message));
  page.on('response', response => {
    if (response.url().includes('typekit.net')) {
      report.typekitResponses.push({ url: response.url(), status: response.status() });
    }
  });

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    for (const route of routes) {
      await page.goto(`${base}${route}`, { waitUntil: 'networkidle', timeout: 60000 });
      await page.evaluate(async () => {
        await document.fonts.load('400 32px "span-compressed"', 'Marcas com essência');
        await document.fonts.ready;
      });
      const state = await page.evaluate(() => {
        const heading = document.querySelector('h1');
        const face = [...document.fonts].find(font => font.family.replaceAll('"', '') === 'span-compressed' && font.weight === '400');
        return {
          title: heading?.textContent?.trim(),
          family: heading ? getComputedStyle(heading).fontFamily : null,
          weight: heading ? getComputedStyle(heading).fontWeight : null,
          fontStatus: face?.status || null,
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
        };
      });
      assert.ok(state.title, `Título ausente em ${route}`);
      assert.match(state.family, /span-compressed/i, `Família incorreta em ${route}`);
      assert.equal(state.weight, '400', `Peso incorreto em ${route}`);
      assert.equal(state.fontStatus, 'loaded', `Span Compressed não carregou em ${route}`);
      assert.equal(state.overflow, false, `Overflow em ${route} (${viewport.name})`);
      report.pages.push({ route, viewport: viewport.name, ...state });
      const slug = route === '/' ? 'home' : route.replace(/^\//, '').replace(/\/$/, '').replaceAll('/', '-').replace('.html', '');
      await page.screenshot({ path: `${output}/${slug}-${viewport.name}.png`, fullPage: true });
    }
  }

  report.typekitResponses = [...new Map(report.typekitResponses.map(item => [item.url, item])).values()];
  assert.ok(report.typekitResponses.some(item => item.url.includes('gkr2kbf.css') && item.status === 200), 'CSS do Adobe Fonts não respondeu 200');
  assert.ok(report.typekitResponses.some(item => /\/af\/.+\/l\?/.test(item.url) && item.status === 200), 'Arquivo WOFF2 da Span não respondeu 200');
  assert.deepEqual(report.errors, []);
  report.ok = true;
} finally {
  await browser.close();
  writeFileSync(`${output}/report.json`, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
}
