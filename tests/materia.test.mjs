import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import * as cheerio from 'cheerio';
import { migrateMateriaContent } from '../shared/materia-content.mjs';
import { materiaSitePlugin } from '../scripts/materia-site.mjs';

test('legacy CMS content migrates once, with recoverable copy and custom fields retained',()=>{
  const input={home:{hero_title_lead:'Antigo',custom:'preservar'},global:{footer_tagline:'Anterior'}};
  const migrated=migrateMateriaContent(input);
  assert.equal(input.home.hero_title_lead,'Antigo');
  assert.equal(migrated.legacyMateriaBackup.home.hero_title_lead,'Antigo');
  assert.equal(migrated.home.custom,'preservar');
  migrated.home.hero_title_lead='Edição do cliente';
  assert.deepEqual(migrateMateriaContent(migrated),migrated);
});
test('public build includes every published project and article without client fetching',()=>{
  const handler=materiaSitePlugin().transformIndexHtml.handler;
  for(const [page,key,selector] of [['projetos','projetos','.project-card'],['artigos','artigos','.article-card']]){
    const $=cheerio.load(handler(readFileSync(`${page}.html`,'utf8'),{path:`/${page}.html`}));
    const data=JSON.parse(readFileSync(`public/data/${key}.json`));
    assert.equal($(selector).length,data.filter(x=>x.status!=='draft').length);
    assert.equal($('.site-header').length,1);assert.equal($('.site-footer').length,1);
    assert.equal($('.nav-links [aria-current="page"]').length,1);
  }
});
test('every generated detail has actual content, canonical and no legacy redirect script',()=>{
  for(const type of ['projetos','artigos'])for(const file of readdirSync(type).filter(f=>f.endsWith('.html'))){
    const $=cheerio.load(readFileSync(`${type}/${file}`,'utf8'));
    assert.ok($('main h1').text().trim(),`${type}/${file}: missing title`);
    assert.ok(!$('main').text().includes('Carregando...'),`${type}/${file}: placeholder`);
    assert.equal($('script[src="/js/legacy-detail.js"]').length,0);
    assert.equal($('link[rel="canonical"]').length,1);
    assert.ok(!$('meta[name="robots"]').attr('content')?.includes('noindex'));
    if(type==='projetos')assert.ok($('.project-description').text().length>30);
  }
});
test('build internal links and local resources resolve; semantic landmarks exist',()=>{
  const files=['index.html','sobre.html','servicos.html','contato.html','obrigado.html','artigos.html','projetos.html','vagas.html',...readdirSync('dist/artigos').map(f=>'artigos/'+f),...readdirSync('dist/projetos').map(f=>'projetos/'+f)];
  for(const file of files){
    const $=cheerio.load(readFileSync(`dist/${file}`,'utf8'));
    assert.equal($('main').length,1,file); assert.equal($('main h1').length,1,file);
    assert.equal($('.site-header').length,1,file);
    $('[src],a[href],link[href]').each((_,el)=>{
      const value=$(el).attr('src')||$(el).attr('href');
      if(!value?.startsWith('/')||value.startsWith('//'))return;
      const path=value.split(/[?#]/)[0];
      assert.ok(existsSync(`dist${path==='/'?'/index.html':decodeURIComponent(path)}`),`${file}: ${path}`);
    });
  }
});
