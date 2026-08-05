import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import { sanitizeSlug } from '../api/utils/slug.mjs';

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
  if (!value) return new Date().toISOString();
  const d = new Date(value);
  return isNaN(d) ? new Date().toISOString() : d.toISOString();
}

function writeJsonLd($, data) {
  $('head').append(`<script type="application/ld+json">${JSON.stringify(data)}</script>\n`);
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

function generateArtigos() {
  const template = fs.readFileSync(path.join(ROOT, 'artigo.html'), 'utf8');
  const artigos = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/data/artigos.json'), 'utf8'))
    .filter(a => a.status !== 'draft');

  const outDir = path.join(ROOT, 'artigos');
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  for (const artigo of artigos) {
    const slug = sanitizeSlug(artigo.slug);
    const url = `${DOMAIN}/artigos/${slug}.html`;
    const image = artigo.cover ? `${DOMAIN}${artigo.cover}` : `${DOMAIN}/images/brand/og-image.jpg`;
    const description = artigo.excerpt || excerptFrom(artigo.content || '', 157);
    const dateISO = toISODate(artigo.createdAt || artigo.date);
    const authorName = artigo.author?.name || 'Equipe Arcaffo';

    const $ = cheerio.load(template);

    setCommonMeta($, { title: `${artigo.title} | Arcaffo®`, description, url, image, type: 'article' });

    writeJsonLd($, {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: artigo.title,
      description,
      image: [image],
      datePublished: dateISO,
      dateModified: toISODate(artigo.updatedAt || artigo.createdAt || artigo.date),
      author: { '@type': 'Person', name: authorName },
      publisher: {
        '@type': 'Organization',
        name: 'Arcaffo',
        logo: { '@type': 'ImageObject', url: `${DOMAIN}/images/brand/logo-arcaffo-v2.png` },
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

    $('#article-date').text(artigo.date || 'Blog');
    $('#article-title').text(artigo.title);

    if (artigo.cover) {
      $('#article-cover').attr('src', artigo.cover).attr('alt', artigo.title);
      const coverStyle = ($('#article-cover-container').attr('style') || '').replace('display: none;', 'display: block;');
      $('#article-cover-container').attr('style', coverStyle);
    }

    $('#article-content').html(artigo.content || '');

    // Author byline (E-E-A-T signal)
    const authorBlock = `
      <div style="margin-top: 4rem; padding-top: 2rem; border-top: 1px solid var(--color-border); display: flex; align-items: center; gap: 1.5rem;">
        ${artigo.author?.photo ? `<img loading="lazy" src="${artigo.author.photo}" alt="${authorName}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover;">` : ''}
        <div>
          <h4 style="margin-bottom: 0.2rem; font-size: 1.2rem;">${authorName}</h4>
          <p style="color: var(--color-text-secondary); font-size: 0.9rem; margin: 0;">${artigo.author?.role || 'Arcaffo'}</p>
        </div>
      </div>`;
    $('#article-content').parent().append(authorBlock);

    // Content is now server-rendered; drop the client-side fetch/inject script.
    removeScriptsContaining($, 'loadArticle');

    fs.writeFileSync(path.join(outDir, `${slug}.html`), $.html());
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
      return `<div class="gallery-video-wrapper animate-on-scroll" style="width: 100%; border-radius: 8px; overflow: hidden; margin-bottom: 2rem;">
        <video src="${url}" autoplay loop muted playsinline style="width: 100%; height: auto; display: block;"></video>
      </div>`;
    }
    return `<img src="${url}" alt="${projeto.title} - Mídia ${i + 1}" class="gallery-image animate-on-scroll" loading="lazy" />`;
  }).join('');
}

function generateProjetos() {
  const template = fs.readFileSync(path.join(ROOT, 'projeto.html'), 'utf8');
  const projetos = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/data/projetos.json'), 'utf8'))
    .filter(p => p.status !== 'draft');

  const outDir = path.join(ROOT, 'projetos');
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  for (const projeto of projetos) {
    const slug = sanitizeSlug(projeto.slug);
    const url = `${DOMAIN}/projetos/${slug}.html`;
    let image = projeto.cover || (projeto.images?.[0]?.url) || '';
    if (image && !/^https?:\/\//.test(image)) image = `${DOMAIN}${image}`;
    if (!image) image = `${DOMAIN}/images/brand/og-image.jpg`;
    const description = excerptFrom(projeto.description || '', 157);
    const dateISO = toISODate(projeto.createdAt || projeto.date);

    const $ = cheerio.load(template);

    setCommonMeta($, { title: `${projeto.title} | Arcaffo®`, description, url, image, type: 'website' });

    writeJsonLd($, {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: projeto.title,
      description,
      image: [image],
      url,
      datePublished: dateISO,
      creator: { '@type': 'Organization', name: 'Arcaffo' },
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
      ? (projeto.description || '')
      : (projeto.description || '').replace(/\n/g, '<br>');

    const bodyHtml = `
      <section class="project-detail-hero" style="background-image: url('${image}');">
        <div class="container project-detail-header">
          <h1 class="animate-on-scroll" style="font-size: 4rem;">${projeto.title}</h1>
          <p class="section-subtitle animate-on-scroll delay-100 text-accent">${(projeto.tags || []).join(' • ')}</p>
        </div>
      </section>

      <section class="project-detail-info">
        <div class="container grid-2">
          <div class="project-description animate-on-scroll">
            <h2 class="section-title">O Desafio</h2>
            <div>${descHtml}</div>
          </div>
          <div class="project-meta animate-on-scroll delay-100">
            ${projeto.team ? `
              <div class="meta-item">
                <span class="meta-label">Equipe</span>
                <span class="meta-value">${projeto.team}</span>
              </div>
            ` : ''}
            ${projeto.tags ? `
              <div class="meta-item">
                <span class="meta-label">Entregas</span>
                <span class="meta-value">${projeto.tags.join(', ')}</span>
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

      <section class="cta-section text-center" style="background-color: var(--color-bg-secondary); padding: 4rem 0;">
        <div class="container animate-on-scroll">
          <a href="/projetos.html" class="btn btn-outline">Voltar para o Portfólio</a>
        </div>
      </section>
    `;

    $('#project-container').html(bodyHtml);

    // Content is now server-rendered; drop the client-side fetch/inject script.
    $('script').each((_, el) => {
      const txt = $(el).html() || '';
      if (txt.includes('fetchProjetos')) $(el).remove();
    });

    fs.writeFileSync(path.join(outDir, `${slug}.html`), $.html());
  }

  console.log(`✅ Gerados ${projetos.length} projetos estáticos em /projetos`);
}

generateArtigos();
generateProjetos();
