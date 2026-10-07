import { chromium } from 'playwright';
import { writeFile } from 'node:fs/promises';

const profileUrl = process.argv[2] || 'https://www.behance.net/arthurfava';
const outputPath = process.argv[3];
const browser = await chromium.launch({
  headless: false,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
});

const graphqlResponses = [];
page.on('response', async (response) => {
  if (!response.url().includes('/graphql')) return;

  try {
    const body = await response.json();
    graphqlResponses.push({ url: response.url(), status: response.status(), body });
  } catch {
    // Some GraphQL responses may be empty or not JSON; they are irrelevant here.
  }
});

await page.goto(profileUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 });

let stablePasses = 0;
let previousCount = 0;
for (let pass = 0; pass < 30 && stablePasses < 4; pass += 1) {
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1_500);

  const currentCount = await page.locator('a[href*="/gallery/"]').count();
  stablePasses = currentCount === previousCount ? stablePasses + 1 : 0;
  previousCount = currentCount;
}

const projects = await page.locator('a[href*="/gallery/"]').evaluateAll((links) => {
  const unique = new Map();
  for (const link of links) {
    const href = link.href;
    const match = href.match(/\/gallery\/(\d+)\/([^?#/]+)/);
    if (!match) continue;

    const card = link.closest('li, article, [class*="ProjectCover"], [class*="ProjectCard"]');
    const image = link.querySelector('img') || card?.querySelector('img');
    const text = (link.getAttribute('aria-label') || image?.alt || card?.textContent || link.textContent || '')
      .replace(/\s+/g, ' ')
      .trim();

    unique.set(match[1], {
      id: Number(match[1]),
      slug: match[2],
      url: href.split('?')[0],
      text,
    });
  }
  return [...unique.values()];
});

const result = JSON.stringify({ profileUrl, projects, graphqlResponses }, null, 2);
if (outputPath) {
  await writeFile(outputPath, result);
  console.log(`Auditoria salva em ${outputPath}`);
} else {
  console.log(result);
}
await browser.close();
