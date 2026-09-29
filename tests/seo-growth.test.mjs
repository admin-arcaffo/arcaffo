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
    assert.ok($('a[href^="/projetos/"]').length >= 3, slug);
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
  const $project = page('projetos/indreco.html');
  assert.ok($project('.project-related a[href^="/artigos/"]').length >= 3);
  assert.ok($project('.project-related a[href^="/"][href$="/"]').length >= 1);
});

test('priority cases expose factual, extractable project narratives', () => {
  const slugs = ['la-parisienne','iclay','arkete','indreco','kassar','sacralita','cia-do-vidro','profive','rafael-a-obra'];
  for (const slug of slugs) {
    const $ = page(`projetos/${slug}.html`);
    assert.equal($('.project-case-notes').length, 1, slug);
    assert.equal($('.project-case-notes h2').length, 1, slug);
    assert.equal($('.project-case-grid li').length, 3, slug);
    const creativeWork = graph($).find(item => item['@type'] === 'CreativeWork');
    assert.ok(creativeWork?.abstract, slug);
    assert.ok(creativeWork?.keywords, slug);
  }
  assert.doesNotMatch(page('projetos/iclay.html')('main').text(), /Founded in 2017/);
  assert.doesNotMatch(page('projetos/cia-do-vidro.html')('main').text(), /With over two decades/);
});
