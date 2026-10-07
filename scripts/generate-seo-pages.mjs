import fs from 'node:fs';
import path from 'node:path';
import { SERVICE_PAGES } from '../shared/service-pages.mjs';
import { PEOPLE } from '../shared/people.mjs';
import { sanitizeSlug } from '../api/utils/slug.mjs';
import { isMilmeProject, projectHref } from '../shared/milme.mjs';

const ROOT = process.cwd();
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const articles = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/data/artigos.json'), 'utf8')).filter(item => item.status !== 'draft');
const projects = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/data/projetos.json'), 'utf8')).filter(item => item.status !== 'draft');
const articleBySlug = new Map(articles.map(item => [sanitizeSlug(item.slug), item]));
const projectBySlug = new Map(projects.map(item => [sanitizeSlug(item.slug), item]));

function shell({ title, description, page, bodyAttributes = '', content }) {
  return `<!doctype html>
<html lang="pt-BR" data-materia="2">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:image" content="https://www.arcaffo.com/images/materia/social-home.jpg">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="preconnect" href="https://use.typekit.net" crossorigin>
  <link rel="preconnect" href="https://p.typekit.net" crossorigin>
  <link rel="stylesheet" href="https://use.typekit.net/gkr2kbf.css">
  <link rel="stylesheet" href="/css/materia.css">
  <link rel="stylesheet" href="/css/seo-pages.css">
</head>
<body data-page="${esc(page)}" ${bodyAttributes}>
  <div data-site-header></div>
  <main id="conteudo" tabindex="-1">${content}</main>
  <div data-site-footer></div>
  <script type="module" src="/js/main.js"></script>
</body>
</html>`;
}

function projectCards(slugs) {
  return slugs.map(slug => projectBySlug.get(slug)).filter(Boolean).map(project => `
    <a class="seo-reference-card" href="${esc(projectHref(sanitizeSlug(project.slug)))}">
      <img src="${esc(project.cover || project.images?.[0]?.url)}" alt="${esc(project.title)} — ${isMilmeProject(sanitizeSlug(project.slug)) ? 'identidade visual pela MILME, brand studio da Arcaffo' : 'projeto desenvolvido pela Arcaffo'}" loading="lazy" width="720" height="480">
      <span>${esc((project.tags || []).slice(0, 2).join(' · '))}</span>
      <h3>${esc(project.title)}</h3>
      <p>Conheça o contexto e as decisões deste projeto.</p>
    </a>`).join('');
}

function articleLinks(slugs) {
  return slugs.map(slug => articleBySlug.get(slug)).filter(Boolean).map(article => `
    <li><a href="/artigos/${encodeURIComponent(sanitizeSlug(article.slug))}.html">${esc(article.title)}</a></li>`).join('');
}

function renderService(service) {
  const faq = service.faq.map(([question, answer]) => `<details><summary>${esc(question)}</summary><p>${esc(answer)}</p></details>`).join('');
  const content = `
    <article class="seo-service-page">
      <header class="seo-hero container">
        <p class="content-meta">${esc(service.eyebrow)}</p>
        <h1>${esc(service.h1)}</h1>
        <p class="lede">${esc(service.lead)}</p>
        <a class="btn" href="/contato.html?assunto=diagnostico" data-cta="diagnostico">Solicitar uma conversa de diagnóstico</a>
      </header>

      <section class="seo-section seo-section--sand">
        <div class="container seo-split">
          <div><h2>Quando este trabalho faz sentido</h2><p>${esc(service.fit)}</p></div>
          <ul class="seo-signal-list">${service.symptoms.map(item => `<li>${esc(item)}</li>`).join('')}</ul>
        </div>
      </section>

      <section class="seo-section">
        <div class="container seo-narrow">
          <h2>O que está em jogo</h2>
          <p class="lede">${esc(service.diagnosis)}</p>
        </div>
      </section>

      <section class="seo-section seo-section--deep">
        <div class="container">
          <div class="seo-section-heading"><h2>Como conduzimos</h2><p>Uma sequência de investigação, escolha e aplicação. O desenho final é definido pelo problema real da empresa.</p></div>
          <ol class="seo-process">${service.approach.map(([title, body], index) => `<li><span>0${index + 1}</span><div><h3>${esc(title)}</h3><p>${esc(body)}</p></div></li>`).join('')}</ol>
        </div>
      </section>

      <section class="seo-section">
        <div class="container seo-split">
          <div><h2>Entregas possíveis</h2><p>O escopo combina apenas as entregas necessárias para resolver o problema diagnosticado.</p></div>
          <ul class="seo-deliverables">${service.deliverables.map(item => `<li>${esc(item)}</li>`).join('')}</ul>
        </div>
      </section>

      <section class="seo-section seo-section--sand">
        <div class="container">
          <div class="seo-section-heading"><h2>Projetos relacionados</h2><a class="text-link" href="/projetos.html">Ver todos os projetos →</a></div>
          <div class="seo-reference-grid">${projectCards(service.projects)}</div>
        </div>
      </section>

      <section class="seo-section">
        <div class="container seo-split">
          <div><h2>Antes de contratar</h2><p>${esc(service.notFit)}</p></div>
          <div><h3>Leituras para aprofundar</h3><ul class="seo-reading-list">${articleLinks(service.articles)}</ul></div>
        </div>
      </section>

      <section class="seo-section seo-section--faq">
        <div class="container seo-narrow"><h2>Perguntas frequentes</h2><div class="seo-faq">${faq}</div></div>
      </section>

      <section class="seo-section seo-final-cta">
        <div class="container seo-narrow"><h2>Vamos entender o momento da sua empresa.</h2><p>Conte o que está acontecendo. A primeira conversa serve para identificar o problema, o nível de maturidade e o próximo passo mais útil.</p><a class="btn" href="/contato.html?assunto=diagnostico" data-cta="diagnostico">Pedir um diagnóstico de marca</a></div>
      </section>
    </article>`;

  const output = shell({
    title: service.title,
    description: service.description,
    page: 'service-detail',
    bodyAttributes: `data-service-name="${esc(service.name)}" data-service-type="${esc(service.name)}"`,
    content,
  });
  const dir = path.join(ROOT, service.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), output.replace(/[ \t]+$/gm, ''));
}

function renderPerson(person) {
  const authored = articles.filter(article => article.author?.name === person.name);
  const participated = projects.filter(project => (project.team || '').includes(person.name.split(' ')[0])).slice(0, 6);
  const content = `
    <article class="seo-person-page">
      <header class="seo-person-hero container">
        <img src="${esc(person.image)}" alt="${esc(person.name)}" width="720" height="900" fetchpriority="high">
        <div><p class="content-meta">Liderança Arcaffo</p><h1>${esc(person.name)}</h1><p class="lede">${esc(person.role)}</p><p>${esc(person.bio)}</p></div>
      </header>
      <section class="seo-section seo-section--sand"><div class="container seo-split"><div><h2>Áreas de atuação</h2><p>A atuação é integrada ao trabalho da equipe e ao contexto de cada projeto.</p></div><ul class="seo-deliverables">${person.focus.map(item => `<li>${esc(item)}</li>`).join('')}</ul></div></section>
      ${authored.length ? `<section class="seo-section"><div class="container"><h2>Artigos publicados</h2><ul class="seo-reading-list">${authored.map(article => `<li><a href="/artigos/${sanitizeSlug(article.slug)}.html">${esc(article.title)}</a></li>`).join('')}</ul></div></section>` : ''}
      ${participated.length ? `<section class="seo-section"><div class="container"><div class="seo-section-heading"><h2>Projetos com participação</h2><a class="text-link" href="/projetos.html">Ver portfólio →</a></div><div class="seo-reference-grid">${projectCards(participated.map(project => sanitizeSlug(project.slug)).slice(0, 3))}</div></div></section>` : ''}
    </article>`;
  const output = shell({
    title: person.slug === 'fabricio-rodrigues' ? 'Fabrício Rodrigues — Diretor Operacional | Arcaffo' : `${person.name} — ${person.role} | Arcaffo`,
    description: `${person.name} é ${person.role} na Arcaffo GROUP, em Campo Grande, MS. Conheça sua atuação e os projetos dos quais participa.`,
    page: 'author',
    bodyAttributes: `data-person-name="${esc(person.name)}" data-person-role="${esc(person.role)}" data-person-image="${esc(person.image)}"`,
    content,
  });
  const dir = path.join(ROOT, 'autores', person.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), output.replace(/[ \t]+$/gm, ''));
}

SERVICE_PAGES.forEach(renderService);
PEOPLE.forEach(renderPerson);
console.log(`✅ Geradas ${SERVICE_PAGES.length} páginas de serviço e ${PEOPLE.length} páginas de autoria`);
