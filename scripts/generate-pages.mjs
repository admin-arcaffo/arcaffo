import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import sharp from 'sharp';
import { sanitizeSlug } from '../api/utils/slug.mjs';
import { escapeHtml, richText } from './materia-site.mjs';
import { absoluteUrl, validDate, jsonLd } from '../shared/seo.mjs';
import { PEOPLE_BY_NAME } from '../shared/people.mjs';

// Pre-renders one static HTML file per artigo/projeto so the real title,
// description, content and JSON-LD ship in the initial HTML response —
// crawlers that don't execute JavaScript (most AI bots included) see the
// actual page instead of the shared "Carregando..." template.

const ROOT = process.cwd();
const DOMAIN = 'https://www.arcaffo.com';

function stripHtml(html = '') {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function excerptFrom(html, len = 157) {
  const text = stripHtml(html);
  if (text.length <= len) return text;
  const cut = text.slice(0, len);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut) + '…';
}

function toISODate(value) {
  return validDate(value);
}

function seoPageTitle(value, suffix = ' | Arcaffo') {
  const clean = stripHtml(value).replace(/\s+/g, ' ').trim();
  const max = Math.max(20, 60 - suffix.length);
  if (clean.length <= max) return clean + suffix;
  const cut = clean.slice(0, max + 1);
  return `${cut.slice(0, cut.lastIndexOf(' '))}${suffix}`;
}

const STOP_WORDS = new Set(['para','como','uma','com','que','por','dos','das','de','do','da','em','e','o','a','os','as','um','no','na','sua','seu']);
function terms(value = '') {
  return new Set(stripHtml(value).toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '').split(/[^a-z0-9]+/).filter(term => term.length > 3 && !STOP_WORDS.has(term)));
}
function relatedArticles(current, all, limit = 3) {
  const source = terms(`${current.title} ${current.excerpt || ''} ${current.content || ''}`);
  return all.filter(item => item.slug !== current.slug).map(item => {
    const target = terms(`${item.title} ${item.excerpt || ''}`);
    return { item, score: [...source].filter(term => target.has(term)).length };
  }).sort((a,b) => b.score - a.score || String(b.item.updatedAt || '').localeCompare(String(a.item.updatedAt || ''))).slice(0, limit).map(entry => entry.item);
}

function articlesForProject(project, all, limit = 3) {
  const source = terms(`${project.title} ${(project.tags || []).join(' ')} ${project.description || ''}`);
  return all.map(item => {
    const target = terms(`${item.title} ${item.excerpt || ''}`);
    return { item, score: [...source].filter(term => target.has(term)).length };
  }).sort((a,b) => b.score - a.score || String(b.item.updatedAt || '').localeCompare(String(a.item.updatedAt || ''))).slice(0, limit).map(entry => entry.item);
}

function serviceFor(value = '') {
  const text = stripHtml(value).toLocaleLowerCase('pt-BR');
  if (/consultoria de branding|projeto de branding/.test(text)) return ['/consultoria-de-branding/','Consultoria de branding'];
  if (/identidade visual|redesign|typedesign|logotipo/.test(text)) return ['/identidade-visual/','Identidade visual'];
  if (/marketing|publicidade|anúncio|anuncio/.test(text)) return ['/gestao-de-marketing/','Gestão de marketing'];
  if (/posicionamento/.test(text)) return ['/posicionamento-de-marca/','Posicionamento de marca'];
  if (/arquitetura|estratégia|estrategia|naming/.test(text)) return ['/estrategia-de-marca/','Estratégia de marca'];
  return ['/consultoria-de-branding/','Consultoria de branding'];
}

function writeJsonLd($, data) {
  $('head').append(`<script type="application/ld+json">${jsonLd(data)}</script>\n`);
}

function setCommonMeta($, { title, description, url, image, type = 'website' }) {
  $('title').text(title);
  // The templates (artigo.html / projeto.html) are noindexed since they only
  // render content via client-side JS; the pre-rendered pages built from them
  // are the real crawlable pages and must not inherit that.
  $('meta[name="robots"]').remove();
  $('meta[name="description"]').attr('content', description);
  $('meta[property="og:title"]').attr('content', title);
  $('meta[property="og:description"]').attr('content', description);
  $('meta[property="og:image"]').attr('content', image);
  $('meta[property="og:url"]').attr('content', url);
  $('meta[property="og:type"]').attr('content', type);
  $('meta[name="twitter:title"]').attr('content', title);
  $('meta[name="twitter:description"]').attr('content', description);
  $('meta[name="twitter:image"]').attr('content', image);
  $('head').append(`<link rel="canonical" href="${url}">\n`);
}

function removeScriptsContaining($, needle) {
  $('script').each((_, el) => {
    const txt = $(el).html() || '';
    if (txt.includes(needle)) $(el).remove();
  });
}

// ---------- Artigos ----------

async function localImageMetadata(url) {
  if (!url?.startsWith('/')) return null;
  const file = path.join(ROOT, 'public', url.slice(1));
  if (!fs.existsSync(file)) return null;
  const { width, height } = await sharp(file).metadata();
  return width && height ? { width, height } : null;
}

async function generateArtigos() {
  const template = fs.readFileSync(path.join(ROOT, 'artigo.html'), 'utf8');
  const artigos = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/data/artigos.json'), 'utf8'))
    .filter(a => a.status !== 'draft');

  const outDir = path.join(ROOT, 'artigos');
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  for (const artigo of artigos) {
    const slug = sanitizeSlug(artigo.slug);
    const url = `${DOMAIN}/artigos/${slug}.html`;
    const image = absoluteUrl(artigo.cover);
    const rawDescription = artigo.seo?.metaDescription || artigo.excerpt || excerptFrom(artigo.content || '', 157);
    const description = rawDescription.length < 120 ? excerptFrom(`${rawDescription} Leia a análise completa da Arcaffo.`, 157) : rawDescription;
    const metaTitle = artigo.seo?.metaTitle || artigo.title;
    const dateISO = toISODate(artigo.createdAt || artigo.date);
    const authorName = artigo.author?.name || 'Equipe Arcaffo';

    const $ = cheerio.load(template);

    setCommonMeta($, { title: seoPageTitle(metaTitle), description, url, image, type: 'article' });

    writeJsonLd($, {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: artigo.title,
      description,
      image: [image],
      datePublished: dateISO,
      dateModified: toISODate(artigo.updatedAt || artigo.createdAt || artigo.date),
      author: PEOPLE_BY_NAME[authorName]
        ? { '@type': 'Person', name: authorName, url: `${DOMAIN}/autores/${PEOPLE_BY_NAME[authorName].slug}/` }
        : { '@type': /equipe|arcaffo group/i.test(authorName) ? 'Organization' : 'Person', name: authorName },
      publisher: {
        '@type': 'Organization',
        name: 'Arcaffo GROUP',
        logo: { '@type': 'ImageObject', url: `${DOMAIN}/icon-512.png` },
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    });

    writeJsonLd($, {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Início', item: `${DOMAIN}/` },
        { '@type': 'ListItem', position: 2, name: 'Artigos', item: `${DOMAIN}/artigos.html` },
        { '@type': 'ListItem', position: 3, name: artigo.title, item: url },
      ],
    });

    if (Array.isArray(artigo.faq) && artigo.faq.length > 0) {
      writeJsonLd($, {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: artigo.faq.map(item => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      });
    }

    $('#article-date').text(artigo.date || 'Blog');
    $('#article-title').text(artigo.title);

    if (artigo.cover) {
      const dimensions = await localImageMetadata(artigo.cover);
      $('#article-cover')
        .attr('src', artigo.cover)
        .attr('alt', artigo.title)
        .attr('loading', 'eager')
        .attr('fetchpriority', 'high')
        .attr('decoding', 'async');
      if (dimensions) {
        $('#article-cover')
          .attr('width', String(dimensions.width))
          .attr('height', String(dimensions.height));
      }
      $('#article-cover-container').removeAttr('hidden');
    }

    $('#article-content').html(richText(artigo.content || ''));
    $('#article-content h1').each((_,el) => $(el).replaceWith(`<h2>${$(el).html()}</h2>`));

    // Author byline (E-E-A-T signal)
    const authorUrl = PEOPLE_BY_NAME[authorName] ? `/autores/${PEOPLE_BY_NAME[authorName].slug}/` : /equipe|arcaffo group/i.test(authorName) ? '/sobre.html#equipe' : '';
    const authorBlock = `
      <div class="article-author">
        ${artigo.author?.photo ? `<img loading="lazy" src="${escapeHtml(artigo.author.photo)}" alt="${escapeHtml(authorName)}" width="72" height="90">` : ''}
        <div>
          <p class="author-name">${authorUrl ? `<a href="${authorUrl}">${escapeHtml(authorName)}</a>` : escapeHtml(authorName)}</p>
          <p class="author-bio">${escapeHtml(artigo.author?.role || 'Arcaffo GROUP')}</p>
        </div>
      </div>`;
    $('#article-content').parent().append(authorBlock);

    const related = relatedArticles(artigo, artigos);
    const [serviceUrl, serviceName] = serviceFor(`${artigo.title} ${artigo.content || ''}`);
    const relatedBlock = `<aside class="related-content" aria-labelledby="related-title">
      <h2 id="related-title">Continue a leitura</h2>
      <ul>${related.map(item => `<li><a href="/artigos/${sanitizeSlug(item.slug)}.html">${escapeHtml(item.title)}</a></li>`).join('')}</ul>
      <p>Se este tema descreve o momento da sua empresa, conheça nosso trabalho em <a href="${serviceUrl}">${serviceName}</a>.</p>
    </aside>`;
    $('#article-content').parent().append(relatedBlock);

    // Content is now server-rendered; drop the client-side fetch/inject script.
    removeScriptsContaining($, 'loadArticle');
    $('script[src="/js/legacy-detail.js"]').remove();
    $('#article-content [style]').removeAttr('style');
    $('#article-content h2, #article-content h3').each((_,el) => { if (!$(el).text().trim()) $(el).remove(); });
    $('#article-content img').attr('loading','lazy');

    fs.writeFileSync(path.join(outDir, `${slug}.html`), $.html().replace(/[ \t]+$/gm, ''));
  }

  console.log(`✅ Gerados ${artigos.length} artigos estáticos em /artigos`);
}

// ---------- Projetos ----------

function mediaHtml(projeto) {
  const items = (projeto.media && projeto.media.length > 0) ? projeto.media : (projeto.images || []);
  return items.map((m, i) => {
    const url = m.url || m;
    const type = m.type || (/\.(mp4|webm)$/i.test(url) ? 'video' : 'image');
    if (type === 'video') {
      return `<div class="gallery-video-wrapper">
        <video src="${escapeHtml(url)}" controls playsinline preload="metadata" aria-label="${escapeHtml(projeto.title)} — vídeo ${i + 1}"></video>
      </div>`;
    }
    return `<a href="${escapeHtml(url)}" class="gallery-button" data-gallery-image aria-label="Ampliar imagem ${i + 1} de ${escapeHtml(projeto.title)}"><img src="${escapeHtml(url)}" alt="${escapeHtml(projeto.title)} — imagem ${i + 1}" class="gallery-image" loading="lazy" ${m.width && m.height ? `width="${Number(m.width)}" height="${Number(m.height)}"` : ''}></a>`;
  }).join('');
}

function generateProjetos() {
  const template = fs.readFileSync(path.join(ROOT, 'projeto.html'), 'utf8');
  const projetos = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/data/projetos.json'), 'utf8'))
    .filter(p => p.status !== 'draft');
  const artigos = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/data/artigos.json'), 'utf8'))
    .filter(a => a.status !== 'draft');

  const outDir = path.join(ROOT, 'projetos');
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  for (const projeto of projetos) {
    const slug = sanitizeSlug(projeto.slug);
    const url = `${DOMAIN}/projetos/${slug}.html`;
    let image = projeto.cover || (projeto.images?.[0]?.url) || '';
    if (image && !/^https?:\/\//.test(image)) image = `${DOMAIN}${image}`;
    if (!image) image = `${DOMAIN}/images/brand/og-image.jpg`;
    const rawDescription = excerptFrom(projeto.description || '', 157);
    const descriptionBase = rawDescription.length >= 120
      ? rawDescription
      : excerptFrom(`${rawDescription ? `${rawDescription} ` : ''}Conheça o contexto, as decisões e as aplicações do projeto ${projeto.title}, desenvolvido pela Arcaffo.`, 157);
    const description = descriptionBase.length < 120
      ? excerptFrom(`${descriptionBase} Veja o trabalho completo e a equipe envolvida nesta construção de marca.`, 157)
      : descriptionBase;
    const dateISO = toISODate(projeto.createdAt || projeto.date);

    const $ = cheerio.load(template);

    const primaryTags = (projeto.tags || []).slice(0, 2).join(' e ').toLocaleLowerCase('pt-BR');
    setCommonMeta($, { title: seoPageTitle(`${projeto.title}${primaryTags ? `: ${primaryTags}` : ' — projeto'}`), description, url, image, type: 'website' });

    writeJsonLd($, {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: projeto.title,
      description,
      image: [image],
      url,
      datePublished: dateISO,
      creator: { '@type': 'Organization', name: 'Arcaffo GROUP' },
    });

    writeJsonLd($, {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Início', item: `${DOMAIN}/` },
        { '@type': 'ListItem', position: 2, name: 'Projetos', item: `${DOMAIN}/projetos.html` },
        { '@type': 'ListItem', position: 3, name: projeto.title, item: url },
      ],
    });

    const descHtml = (projeto.description || '').includes('<')
      ? richText(projeto.description || '')
      : escapeHtml(projeto.description || '').replace(/\n/g, '<br>');

    const [serviceUrl, serviceName] = serviceFor((projeto.tags || []).join(' '));
    const projectArticles = articlesForProject(projeto, artigos);
    const bodyHtml = `
      <section class="project-detail-hero">
        <div class="container project-detail-header">
          <a class="text-link" href="/projetos.html">← Todos os projetos</a>
          <h1>${escapeHtml(projeto.title)}</h1>
          <p class="section-subtitle">${escapeHtml((projeto.tags || []).join(' · '))}</p>
        </div>
        <img class="project-cover" src="${escapeHtml(image)}" alt="${escapeHtml(projeto.title)}" fetchpriority="high" width="1920" height="1280" style="view-transition-name: project-${slug}">
      </section>

      <section class="project-detail-info light-theme">
        <div class="container grid-2">
          <div class="project-description animate-on-scroll">
            <h2 class="section-title">A história por trás da marca.</h2>
            <div>${descHtml}</div>
          </div>
          <div class="project-meta animate-on-scroll delay-100">
            ${projeto.team ? `
              <div class="meta-item">
                <span class="meta-label">Equipe</span>
                <span class="meta-value">${escapeHtml(projeto.team)}</span>
              </div>
            ` : ''}
            ${projeto.tags ? `
              <div class="meta-item">
                <span class="meta-label">Entregas</span>
                <span class="meta-value">${escapeHtml(projeto.tags.join(', '))}</span>
              </div>
            ` : ''}
          </div>
        </div>
      </section>

      <section class="project-gallery">
        <div class="container">
          ${mediaHtml(projeto)}
        </div>
      </section>

      <aside class="project-related light-theme">
        <div class="container grid-2">
          <div><h2>Da decisão ao sistema.</h2><p>Este projeto se relaciona ao nosso trabalho em <a href="${serviceUrl}">${serviceName}</a>. Conheça como estruturamos diagnóstico, escolhas e aplicação.</p></div>
          <div><h3>Leituras relacionadas</h3><ul>${projectArticles.map(item => `<li><a href="/artigos/${sanitizeSlug(item.slug)}.html">${escapeHtml(item.title)}</a></li>`).join('')}</ul></div>
        </div>
      </aside>

      <section class="cta-section text-center">
        <div class="container animate-on-scroll">
          <a href="/projetos.html" class="btn btn-outline">Voltar para o Portfólio</a>
        </div>
      </section>
    `;

    $('main').html(bodyHtml);
    $('script[src="/js/legacy-detail.js"]').remove();

    // Content is now server-rendered; drop the client-side fetch/inject script.
    $('script').each((_, el) => {
      const txt = $(el).html() || '';
      if (txt.includes('fetchProjetos')) $(el).remove();
    });

    fs.writeFileSync(path.join(outDir, `${slug}.html`), $.html().replace(/[ \t]+$/gm, ''));
  }

  console.log(`✅ Gerados ${projetos.length} projetos estáticos em /projetos`);
}

await generateArtigos();
generateProjetos();
