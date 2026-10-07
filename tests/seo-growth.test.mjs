import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';

const root = process.cwd();
const serviceSlugs = ['consultoria-de-branding','posicionamento-de-marca','identidade-visual','estrategia-de-marca','consultoria-empresarial','gestao-de-marketing'];

function page(relative) {
  return cheerio.load(fs.readFileSync(path.join(root, 'dist', relative), 'utf8'));
}

function graph($) {
  const schema = JSON.parse($('script[type="application/ld+json"]').text());
  return schema['@graph'];
}

test('priority service pages are indexable, self-canonical and expose Service schema', () => {
  for (const slug of serviceSlugs) {
    const $ = page(`${slug}/index.html`);
    assert.equal($('h1').length, 1, slug);
    assert.match($('meta[name="robots"]').attr('content'), /^index, follow/, slug);
    assert.equal($('link[rel="canonical"]').attr('href'), `https://www.arcaffo.com/${slug}/`, slug);
    assert.ok(graph($).some(item => item['@type'] === 'Service'), slug);
    assert.ok($('a[href^="/projetos/"], a[href^="https://milme.arcaffo.com/projetos/"]').length >= 3, slug);
    assert.ok($('a[href^="/artigos/"]').length >= 3, slug);
  }
});

test('organization schema contains verified hours, coordinates and offer catalog', () => {
  const $ = page('index.html');
  const organization = graph($).find(item => item['@id'] === 'https://www.arcaffo.com/#organization');
  assert.deepEqual(organization.geo, { '@type': 'GeoCoordinates', latitude: -20.457099172115935, longitude: -54.5978863988003 });
  assert.equal(organization.openingHoursSpecification[0].opens, '08:00');
  assert.equal(organization.openingHoursSpecification[0].closes, '18:00');
  assert.equal(organization.hasOfferCatalog.itemListElement.length, serviceSlugs.length);
});

test('leadership pages expose Person schema and article author links to a verified profile', () => {
  const $author = page('autores/arthur-fava/index.html');
  assert.ok(graph($author).some(item => item['@type'] === 'Person' && item.name === 'Arthur Fava'));
  const $article = page('artigos/founder-led-growth-branding-pessoal-instagram.html');
  const article = graph($article).find(item => item['@type'] === 'Article');
  assert.equal(article.author.url, 'https://www.arcaffo.com/autores/arthur-fava/');
  assert.equal($article('.article-author a[href="/autores/arthur-fava/"]').length, 1);
});

test('article and project detail pages include contextual internal links', () => {
  const $article = page('artigos/consultoria-de-branding-o-que-e-como-funciona.html');
  assert.ok($article('.related-content a[href^="/artigos/"]').length >= 3);
  assert.ok($article('.related-content a[href^="/consultoria-de-branding/"]').length >= 1);
  const $project = page('projetos/nadyelle-farias-arquiteta.html');
  assert.ok($project('.project-related a[href^="/artigos/"]').length >= 3);
  assert.ok($project('.project-related a[href$="/"]').length >= 1);
});

test('remaining Behance case keeps source-faithful narrative, credits and provenance', () => {
  const $ = page('projetos/nadyelle-farias-arquiteta.html');
  assert.equal($('.project-case-notes').length, 1);
  assert.equal($('.project-case-grid li').length, 3);
  assert.equal($('a[href*="behance.net/gallery/"]').length, 1);
  const creativeWork = graph($).find(item => item['@type'] === 'CreativeWork');
  assert.match(creativeWork.sameAs, /^https:\/\/www\.behance\.net\/gallery\//);
  assert.ok(creativeWork.creditText);
});

test('identity cases moved to MILME: not generated here, 301 configured, links and sitemap point to MILME', async () => {
  const { MILME_SLUGS, milmeProjectUrl, MILME_ORIGIN } = await import('../shared/milme.mjs');
  const vercel = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
  const sitemap = fs.readFileSync(path.join(root, 'dist', 'sitemap.xml'), 'utf8');
  assert.equal(MILME_SLUGS.size, 38);
  for (const slug of MILME_SLUGS) {
    assert.ok(!fs.existsSync(path.join(root, 'dist', 'projetos', `${slug}.html`)), `${slug} ainda gerado`);
    for (const source of [`/projetos/${slug}`, `/projetos/${slug}.html`]) {
      const rule = vercel.redirects.find(r => r.source === source);
      assert.equal(rule?.destination, milmeProjectUrl(slug), source);
      assert.equal(rule.permanent, true, source);
    }
    assert.doesNotMatch(sitemap, new RegExp(`/projetos/${slug}\\.html`), slug);
  }
  const firstGeneric = vercel.redirects.findIndex(r => r.source === '/projeto.html' && r.has?.[0]?.value?.includes('?<slug>'));
  const lastMilme = vercel.redirects.findLastIndex(r => r.source === '/projeto.html' && MILME_SLUGS.has(r.has?.[0]?.value));
  assert.ok(lastMilme < firstGeneric, 'redirects MILME precisam vir antes do genérico /projeto.html');
  const $projects = page('projetos.html');
  assert.ok($projects(`a[href^="${MILME_ORIGIN}/projetos/"]`).length >= 38);
  assert.equal($projects('a[href="/projetos/nadyelle-farias-arquiteta.html"]').length, 1);
  const organization = graph(page('index.html')).find(item => item['@id'] === 'https://www.arcaffo.com/#organization');
  assert.equal(organization.subOrganization['@id'], `${MILME_ORIGIN}/#organization`);
  assert.doesNotMatch(sitemap, /\/identidade-visual\//);
});
