import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import * as cheerio from 'cheerio';
import { migrateMateriaContent } from '../shared/materia-content.mjs';
import { sanitizeSlug } from '../api/utils/slug.mjs';
import { refinePages } from './editorial-render.mjs';
import { applySeo } from './site-seo.mjs';
import { projectPicture } from '../shared/responsive-images.mjs';

export const escapeHtml = (s = '') => String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const safeUrl = (s = '') => /^(https?:\/\/|\/(?!\/)|#|mailto:|tel:)/i.test(s) ? s : '';
function data(name) { return JSON.parse(readFileSync(resolve('public/data', `${name}.json`), 'utf8')); }
export function richText(html = '') {
  const $ = cheerio.load(html, null, false);
  $('script,style,object,embed,form,link,meta').remove();
  $('*').each((_,el)=>{
    Object.keys(el.attribs || {}).forEach(key=>{
      if (/^on/i.test(key) || key === 'style') $(el).removeAttr(key);
      if (['href','src'].includes(key) && !safeUrl(el.attribs[key])) $(el).removeAttr(key);
    });
  });
  $('iframe').each((_,el)=>{try {const url=new URL($(el).attr('src'));if(!['www.youtube.com','www.youtube-nocookie.com','player.vimeo.com'].includes(url.hostname))$(el).remove();else $(el).attr('loading','lazy');}catch{$(el).remove();}});
  return $.html();
}
function jobCard(v) {
  const body = v.description ? richText(v.description) : [['Sobre a vaga',v.sobre],['Seu perfil',v.quem_e_voce],['O que buscamos',v.o_que_buscamos]].filter(([,s])=>s).map(([t,s])=>`<h3>${t}</h3><p>${escapeHtml(s).replace(/\n/g,'<br>')}</p>`).join('');
  return `<details class="job-card"><summary><span><span class="arcaffo-eyebrow">${escapeHtml(v.regime || [v.location,v.type].filter(Boolean).join(' · ') || 'Oportunidade')}</span><h2>${escapeHtml(v.title)}</h2></span><span aria-hidden="true">+</span></summary><div class="job-body">${body}<a class="btn" href="mailto:contato@arcaffo.com?subject=${encodeURIComponent('Vaga: '+v.title)}">Candidatar-se por e-mail ↗</a></div></details>`;
}
function projectCard(p) {
  p = { ...p, slug: sanitizeSlug(p.slug) };
  const img = safeUrl(p.cover || p.images?.[0]?.url || '/images/brand/og-image.jpg');
  return `<a class="project-card" href="/projetos/${encodeURIComponent(p.slug)}.html" data-filter-item data-tags="${escapeHtml((p.tags || []).join('|'))}" data-title="${escapeHtml(p.title)}"><div class="project-image">${projectPicture(img,p.title,{style:`view-transition-name: project-${p.slug.replace(/[^a-z0-9-]/gi,'')}`})}</div><div class="project-caption"><h3>${escapeHtml(p.title)}</h3><span>${escapeHtml((p.tags || []).join(' · '))}</span><span aria-hidden="true">↗</span></div></a>`;
}
function articleCard(a) {
  a = { ...a, slug: sanitizeSlug(a.slug) };
  return `<article class="article-card" data-filter-item data-title="${escapeHtml(a.title)}"><a href="/artigos/${encodeURIComponent(a.slug)}.html"><div class="article-image-wrap"><img src="${escapeHtml(safeUrl(a.cover || '/images/brand/og-image.jpg'))}" alt="" loading="lazy" width="800" height="560"></div><span class="arcaffo-eyebrow">${escapeHtml(a.date || 'Perspectivas')}</span><h2>${escapeHtml(a.title)}</h2><span class="text-link">Ler artigo <span aria-hidden="true">↗</span></span></a></article>`;
}
export function materiaSitePlugin() {
  return {
    name: 'arcaffo-materia',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        if (ctx.path?.startsWith('/admin') || !html.includes('data-materia')) return html;
        const $ = cheerio.load(html);
        const layout = { index:'home', contato:'contact', obrigado:'thanks' }[$('body').attr('data-page')];
        if (layout) $('main').html(readFileSync(resolve(`templates/${layout}.html`), 'utf8'));
        const pageMeta = {
          index:['Marcas com essência. Negócios com direção.','Acompanhamos empresários na construção de marcas, no desenvolvimento de pessoas e na estruturação de negócios. Conheça a Arcaffo GROUP.'],
          sobre:['Sobre a Arcaffo','Conheça nossa história, nossos valores e as pessoas que acompanham a construção de marcas e negócios desde 2016.'],
          servicos:['Como atuamos','Assessoria estratégica, formação empresarial e relacionamento. Conheça como as frentes da Arcaffo contribuem com sua empresa.'],
          projetos:['Projetos','Explore os projetos de branding, posicionamento e identidade visual da Arcaffo GROUP e as histórias por trás de cada marca.'],
          artigos:['Artigos e perspectivas','Reflexões sobre branding, cultura, pessoas e negócios. Um espaço para pensar com profundidade.'],
          contato:['Solicitar uma conversa','Deixe seus dados. Nossa equipe entra em contato para conhecer sua empresa e combinar o horário de uma conversa.'],
          obrigado:['Obrigado pela confiança','Sua solicitação inicia uma conversa. O horário será combinado com nossa equipe.'],
          vagas:['Trabalhe conosco','Conheça as oportunidades de fazer parte da Arcaffo GROUP e construir marcas e negócios conosco.'],
        }[$('body').attr('data-page')];
        if(pageMeta){
          const [title,description]=pageMeta;$('title').text(`${title} | Arcaffo GROUP`);
          $('meta[name="description"],meta[property="og:description"],meta[name="twitter:description"]').attr('content',description);
          $('meta[property="og:title"],meta[name="twitter:title"]').attr('content',`${title} | Arcaffo GROUP`);
          $('script[type="application/ld+json"]').each((_,el)=>{try{const json=JSON.parse($(el).html());if(json['@graph']){json['@graph']=json['@graph'].filter(item=>item['@type']!=='FAQPage');$(el).text(JSON.stringify(json));}}catch{}});
        }
        $('[data-site-header]').replaceWith(readFileSync(resolve('templates/header.html'), 'utf8'));
        $('[data-site-footer]').replaceWith(readFileSync(resolve('templates/footer.html'), 'utf8'));
        if ($('body').is('[data-page="contato"], [data-page="obrigado"]')) $('.invitation').remove();
        const active = ctx.path?.startsWith('/projetos/') ? '/projetos.html' : ctx.path?.startsWith('/artigos/') ? '/artigos.html' : ctx.path;
        $('.nav-links a').each((_, el) => { if ($(el).attr('href') === active) $(el).attr('aria-current', 'page'); });
        const content = migrateMateriaContent(data('site-content'));
        $('[data-cms]').each((_, el) => {
          const [ns, key] = $(el).attr('data-cms').split('.');
          const value = content[ns]?.[key];
          if (value !== undefined && value !== '') $(el).text(value);
        });
        $('[data-cms-href]').each((_, el) => {
          const [ns, key] = $(el).attr('data-cms-href').split('.');
          const value = content[ns]?.[key];
          if (value && safeUrl(value)) $(el).attr('href', value);
        });
        if ($('[data-projects-featured], [data-projects-all]').length) {
          const projects = data('projetos').filter(p => p.status !== 'draft');
          const featured = ['indreco','iclay','sacralita','kassar'];
          const selected = [...projects].sort((a,b) => (featured.indexOf(a.slug) < 0 ? 99 : featured.indexOf(a.slug)) - (featured.indexOf(b.slug) < 0 ? 99 : featured.indexOf(b.slug))).slice(0,4);
          $('[data-projects-featured]').html(selected.map(projectCard).join(''));
          $('[data-projects-all]').html(projects.map(projectCard).join(''));
          const tags = [...new Set(projects.flatMap(p => p.tags || []))].sort();
          $('[data-project-filters]').html(`<button type="button" class="filter-btn" data-filter="" aria-pressed="true">Todos</button>` + tags.map(t => `<button type="button" class="filter-btn" data-filter="${escapeHtml(t)}" aria-pressed="false">${escapeHtml(t)}</button>`).join(''));
          $('[data-project-count]').text(`${projects.length} projetos`);
        }
        if ($('[data-articles-all]').length) $('[data-articles-all]').html(data('artigos').filter(a => a.status !== 'draft').map(articleCard).join(''));
        if ($('[data-jobs-all]').length) {
          const jobs = data('vagas').filter(v => v.status !== 'draft' && v.status !== 'closed');
          $('[data-jobs-all]').html(jobs.length ? jobs.map(jobCard).join('') : '<p>Não há vagas abertas neste momento. Você pode se apresentar pelo e-mail contato@arcaffo.com.</p>');
        }
        refinePages($, { ...content, __projects: JSON.stringify(data('projetos')) });
        applySeo($, ctx.path || '/');
        $('a[target="_blank"]').attr('rel','noopener noreferrer');
        // Apply enhanced-navigation CSS before first paint; without JavaScript,
        // the class is never added and the complete navigation remains visible.
        $('head').prepend('<script>document.documentElement.classList.add("has-js")</script>');
        return $.html();
      },
    },
  };
}
