import { readFile, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const [profileAuditPath, siteProjectsPath, outputPath, includeIdsArg] = process.argv.slice(2);
if (!profileAuditPath || !siteProjectsPath || !outputPath) {
  throw new Error('Uso: node scripts/audit-behance-projects.mjs <perfil.json> <projetos.json> <saida.json>');
}

const normalize = (value = '') => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

const profileAudit = JSON.parse(await readFile(profileAuditPath, 'utf8'));
const siteProjects = JSON.parse(await readFile(siteProjectsPath, 'utf8'));
const existingNames = new Set(siteProjects.flatMap((project) => [
  normalize(project.title),
  normalize(project.slug),
]));

const includeIds = includeIdsArg
  ? new Set(includeIdsArg.split(',').map(Number).filter(Number.isFinite))
  : null;

const missingProjects = profileAudit.projects.filter((project) => {
  if (includeIds) return includeIds.has(project.id);
  const title = project.text.replace(/^Link para o projeto\s*-\s*/i, '');
  const candidates = [normalize(title), normalize(project.slug)];
  return ![...existingNames].some((existing) => candidates.some((candidate) => (
    existing === candidate
    || (existing.length >= 8 && candidate.startsWith(`${existing} `))
  )));
});

const browser = await chromium.launch({
  headless: false,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
});

const results = [];
for (const project of missingProjects) {
  await page.goto(project.url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.waitForTimeout(1_000);

  const extracted = await page.evaluate(() => {
    const stateElement = document.querySelector('#beconfig-store_state');
    const state = stateElement?.textContent ? JSON.parse(stateElement.textContent) : null;
    const meta = Object.fromEntries(
      [...document.querySelectorAll('meta[name], meta[property]')]
        .map((element) => [element.getAttribute('name') || element.getAttribute('property'), element.content])
        .filter(([key, value]) => key && value),
    );
    const images = [...document.images].map((image) => ({
      src: image.currentSrc || image.src,
      alt: image.alt,
      width: image.naturalWidth,
      height: image.naturalHeight,
    })).filter((image) => image.src.includes('behance.net'));

    return {
      title: document.title,
      meta,
      images,
      stateKeys: state ? Object.keys(state) : [],
      projectLayout: state?.projectLayout || null,
      project: state?.project || null,
      oid: state?.oid || null,
    };
  });

  results.push({ ...project, ...extracted });
  console.log(`Extraído: ${project.slug}`);
}

await writeFile(outputPath, JSON.stringify({ missingProjects, results }, null, 2));
await browser.close();
console.log(`Auditoria salva em ${outputPath}`);
