import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import * as cheerio from 'cheerio';
import { absoluteUrl,validDate,jsonLd } from '../shared/seo.mjs';
import { editorialContent } from '../shared/editorial-content.mjs';
import { HOME_CAMPAIGN } from '../shared/home-campaign.mjs';
import { validateUpdate } from '../api/site-content/index.mjs';
test('SEO preserves external image origins and never invents dates',()=>{
 assert.equal(absoluteUrl('https://images.example.com/photo.jpg'),'https://images.example.com/photo.jpg');
 assert.equal(absoluteUrl('/images/photo.jpg'),'https://www.arcaffo.com/images/photo.jpg');
 assert.equal(validDate('not a date'),undefined);assert.equal(validDate(),undefined);
 assert.equal(validDate('2020-03-14'),'2020-03-14T00:00:00.000Z');
 assert.ok(!jsonLd({name:'</script><script>alert(1)</script>'}).includes('<'));
});
test('editorial CMS optional fields preserve existing documents and reject unsafe media',()=>{
 assert.equal(editorialContent({}).about.year_2016_image,'');
 assert.equal(editorialContent({about:{title:'Minha história'}}).about.title,'Minha história');
 assert.equal(validateUpdate({about:{year_2016_image:'javascript:alert(1)'}}).length>0,true);
 assert.equal(validateUpdate({about:{year_2016_image:'https://example.com/photo.jpg',year_2016_caption:'Registro de 2016'}}),'');
 assert.notEqual(validateUpdate({seo:{unexpected:'x'}}),'');
});
test('all built public pages have icon family, canonical and parseable single schema graph',()=>{
 const files=['index.html','sobre.html','servicos.html','artigos.html','projetos.html','contato.html','obrigado.html','vagas.html','404.html',...['artigos','projetos'].flatMap(dir=>readdirSync(`dist/${dir}`).filter(f=>f.endsWith('.html')).map(f=>`${dir}/${f}`))];
 for(const file of files){const $=cheerio.load(readFileSync(`dist/${file}`,'utf8'));
  assert.equal($('link[rel="canonical"]').length,1,file);
  assert.equal($('link[rel="apple-touch-icon"]').length,1,file);
  assert.equal($('link[rel="manifest"]').length,1,file);
  const graph=JSON.parse($('script[type="application/ld+json"]').text());assert.ok(graph['@graph'].length>=3,file);
  assert.equal(graph['@graph'].find(item=>item['@id']==='https://www.arcaffo.com/#organization')?.slogan,'Pessoas, valores, Negócios & Marcas.',file);
  assert.equal($('.footer-slogan').text(),'Pessoas, valores, Negócios & Marcas.',file);
  assert.equal($('script[type="application/ld+json"]').length,1,file);
  assert.ok(!$('a').not('#article-content a,.project-description a').text().match(/[↗→←↓↑]/),file);
  assert.equal($('[data-cta="diagnostico"]').length,file==='index.html'?4:0,file);
  assert.equal($('article[role="tabpanel"]').length,0,file);
  if(!['404.html','obrigado.html'].includes(file))assert.ok($('meta[name="robots"]').attr('content').includes('max-image-preview:large'),file);
 }
 const source=readFileSync('dist/index.html','utf8');
 const $=cheerio.load(source);assert.equal($('.home-people').length,0);
 assert.equal($('#home-title').text().replace(/\s+/g,' ').trim(),HOME_CAMPAIGN.title);
 assert.equal($('.campaign-eyebrow').text(),HOME_CAMPAIGN.eyebrow);
 assert.equal($('.home-introduction').text(),HOME_CAMPAIGN.subtitle);
 assert.equal($('title').text(),HOME_CAMPAIGN.seoTitle);
 assert.equal($('meta[name="description"]').attr('content'),HOME_CAMPAIGN.seoDescription);
 const expectedIds=['cta-diagnostico-topo','cta-diagnostico-hero','cta-diagnostico-bloco','cta-diagnostico-final'];
 assert.deepEqual($('[data-cta="diagnostico"]').map((_,el)=>$(el).attr('id')).get(),expectedIds);
 // A porta de entrada da campanha é o formulário; o WhatsApp é secundário e pede os dados da empresa.
 for(const id of expectedIds){const cta=$(`#${id}`);assert.equal(cta.attr('href'),HOME_CAMPAIGN.ctaHref,id);assert.equal(cta.attr('target'),undefined,id);}
 assert.equal($('.diagnostic-whatsapp').attr('href'),HOME_CAMPAIGN.whatsappUrl);
 assert.ok(decodeURIComponent(HOME_CAMPAIGN.whatsappUrl).includes('Empresa:'));
 assert.equal($('.diagnostic-fit p').length,2);
 assert.equal($('.diagnostic-proof').text(),HOME_CAMPAIGN.proof);
 assert.equal($('#cta-diagnostico-hero').attr('aria-label'),HOME_CAMPAIGN.ctaFull);
 assert.equal($('#cta-diagnostico-hero').attr('data-label-mobile'),HOME_CAMPAIGN.ctaMobile);
 assert.equal($('.worktable-page').filter('div').length,3);
 assert.equal($('.project-card picture source[media="(max-width: 760px)"]').length,4);
 assert.equal($('.diagnostic-offer + .philosophy-section').length,1);
});
