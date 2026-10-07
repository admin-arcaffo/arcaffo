import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.argv[2] || 'http://127.0.0.1:4173';
const slugs = (process.argv[3] || 'colatto,touro-morto,saneflow,centralle-osteria,aldraba,claudia-comparin,arcaffo')
  .split(',')
  .map((slug) => slug.trim())
  .filter(Boolean);
const browser = await chromium.launch({
  headless: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
});

const report = [];
for (const viewport of [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'mobile', width: 390, height: 844 },
]) {
  const page = await browser.newPage({ viewport });
  for (const slug of slugs) {
    await page.goto(`${baseUrl}/projetos/${slug}.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {});
    const images = page.locator('.project-gallery img, .project-cover');
    for (let imageIndex = 0; imageIndex < await images.count(); imageIndex += 1) {
      const image = images.nth(imageIndex);
      await image.scrollIntoViewIfNeeded();
      await image.evaluate((element) => element.decode?.().catch(() => {}));
    }

    const result = await page.evaluate(() => ({
      title: document.querySelector('h1')?.textContent?.trim(),
      galleryImages: document.querySelectorAll('.project-gallery img').length,
      brokenImages: [...document.querySelectorAll('.project-gallery img, .project-cover')]
        .filter((image) => !image.complete || image.naturalWidth === 0)
        .map((image) => image.src),
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      behanceLinks: document.querySelectorAll('a[href*="behance.net/gallery/"]').length,
    }));

    assert.ok(result.title, `${viewport.name}/${slug}: título ausente`);
    assert.ok(result.galleryImages >= 5, `${viewport.name}/${slug}: galeria incompleta`);
    assert.deepEqual(result.brokenImages, [], `${viewport.name}/${slug}: imagem quebrada`);
    assert.equal(result.horizontalOverflow, false, `${viewport.name}/${slug}: overflow horizontal`);
    assert.equal(result.behanceLinks, 1, `${viewport.name}/${slug}: fonte Behance ausente`);
    report.push({ viewport: viewport.name, slug, ...result });
  }

  const screenshotSlug = viewport.name === 'desktop' ? slugs[0] : (slugs[1] || slugs[0]);
  await page.goto(`${baseUrl}/projetos/${screenshotSlug}.html`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `/private/tmp/arcaffo-${screenshotSlug}-${viewport.name}.png`, fullPage: true });
  await page.close();
}

console.log(JSON.stringify(report, null, 2));
await browser.close();
