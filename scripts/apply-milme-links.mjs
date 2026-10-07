// Pós-build: troca, em todo o HTML de dist/, links para cases e para /identidade-visual/
// que migraram para a MILME (shared/milme.mjs) pelas URLs canônicas da MILME.
// Cobre conteúdo vindo do Blob (artigos, textos do CMS) que o build não controla.
import fs from 'node:fs';
import path from 'node:path';
import { MILME_SLUGS, milmeProjectUrl, MILME_SERVICE_URL } from '../shared/milme.mjs';

const DIST = path.resolve('dist');
const slugAlt = [...MILME_SLUGS].map(s => s.replace(/[-]/g, '\\-')).join('|');
// Só <a href>: canonical/og das páginas que ficam continuam apontando para a Arcaffo.
const projectLink = new RegExp(`(<a\\b[^>]*?\\shref=")(?:https://www\\.arcaffo\\.com)?/projetos/(${slugAlt})(?:\\.html)?(?=["#?])`, 'g');
const projectQuery = new RegExp(`(<a\\b[^>]*?\\shref=")(?:https://www\\.arcaffo\\.com)?/projeto\\.html\\?id=(${slugAlt})(?=["&#])`, 'g');
const serviceLink = /(<a\b[^>]*?\shref=")(?:https:\/\/www\.arcaffo\.com)?\/identidade-visual\/?(?=["#?])/g;

let files = 0, links = 0;
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) { if (!['assets', 'images', 'admin'].includes(entry.name)) walk(p); continue; }
    if (!entry.name.endsWith('.html')) continue;
    const html = fs.readFileSync(p, 'utf8');
    let count = 0;
    const out = html
      .replace(projectLink, (_, a, slug) => { count++; return `${a}${milmeProjectUrl(slug)}`; })
      .replace(projectQuery, (_, a, slug) => { count++; return `${a}${milmeProjectUrl(slug)}`; })
      .replace(serviceLink, (_, a) => { count++; return `${a}${MILME_SERVICE_URL}`; });
    if (count) { fs.writeFileSync(p, out); files++; links += count; }
  }
}
walk(DIST);
console.log(`MILME: ${links} links reescritos em ${files} páginas.`);
