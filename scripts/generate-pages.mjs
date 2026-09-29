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

const PROJECT_CASE_NOTES = {
  'la-parisienne': {
    question: 'Como atualizar uma pâtisserie francesa sem apagar o reconhecimento construído pela marca?',
    answer: 'O projeto da La Parisienne reuniu redesign, desenho tipográfico, identidade visual e fotografia. A direção partiu do encontro que já existia no negócio: repertório francês, adaptação ao paladar brasileiro e um espaço que combina referências clássicas com uma presença contemporânea.',
    decisions: [
      'Redesenhar a expressão visual preservando a atmosfera francesa reconhecida pelo público.',
      'Usar o typedesign para dar personalidade própria ao nome La Parisienne.',
      'Conectar identidade, ambiente e fotografia em uma apresentação coerente da experiência da marca.',
    ],
    perspective: 'Este case mostra por que redesign não significa começar do zero. Quando uma marca já possui memória e afeto, o trabalho estratégico é identificar o que merece permanecer e construir um sistema visual capaz de sustentar sua próxima fase.',
    metaDescription: 'Case La Parisienne: redesign, typedesign, identidade visual e fotografia para uma boulangerie e pâtisserie de Campo Grande, desenvolvido pela Arcaffo.',
  },
  iclay: {
    question: 'Como traduzir uma operação técnica em uma marca percebida como premium?',
    answer: 'Para a iClay, identidade visual e posicionamento precisavam tornar visível uma combinação específica: assistência certificada IRP, suporte para produtos Apple e comercialização de dispositivos novos e seminovos. O sistema foi orientado para comunicar excelência técnica e uma experiência premium de forma coerente.',
    decisions: [
      'Organizar o posicionamento em torno de confiança técnica, excelência e experiência.',
      'Criar uma identidade compatível com o padrão premium pretendido pela operação.',
      'Aproximar os diferentes serviços da iClay sob uma mesma percepção de marca.',
    ],
    perspective: 'Negócios técnicos costumam explicar bem o que fazem, mas nem sempre comunicam por que devem ser escolhidos. O papel do branding, neste caso, é transformar atributos operacionais em sinais claros de confiança antes mesmo do primeiro atendimento.',
    metaDescription: 'Case iClay: posicionamento e identidade visual para comunicar assistência certificada, confiança técnica e experiência premium no universo Apple.',
  },
  arkete: {
    question: 'Como criar um nome proprietário para um escritório de arquitetura sustentável?',
    answer: 'Arkete combina arquitetura com Aketé, termo de origem tupi-guarani associado à maior casa da aldeia dos Asurini. O estudo de naming avaliou significados, sonoridades e tipos de nome para chegar a uma escolha coerente com uma arquitetura moderna, sustentável, minimalista e racionalista.',
    decisions: [
      'Construir o nome a partir do território de atuação e de uma referência cultural ligada à moradia.',
      'Avaliar significado e sonoridade junto da capacidade de diferenciação do nome.',
      'Traduzir seriedade, sustentabilidade e racionalidade em uma identidade visual integrada.',
    ],
    perspective: 'Um bom naming não nasce apenas de uma palavra agradável. Ele precisa criar associações úteis, sustentar uma narrativa verdadeira e funcionar como base para o sistema de identidade que virá depois.',
    metaDescription: 'Case Arkete: processo de naming e identidade visual para um escritório de arquitetura moderna e sustentável com sede em Sorocaba.',
  },
  indreco: {
    question: 'Como renovar uma empresa industrial com 55 anos de história sem romper com sua origem?',
    answer: 'A Indreco Motores entrou em uma nova fase mantendo o compromisso que orientou sua trajetória: recuperar motores com qualidade, transparência e integridade. O posicionamento, a identidade visual e a fotografia foram articulados para aproximar a empresa de clientes e interessados do setor.',
    decisions: [
      'Preservar a história iniciada por Emiliano e os valores construídos ao longo de 55 anos.',
      'Apresentar a nova identidade Indreco Motores como evolução, e não como ruptura.',
      'Usar imagem e linguagem de marca para tornar a operação industrial mais próxima e compreensível.',
    ],
    perspective: 'Em marcas longevas, a mudança precisa reconhecer a confiança acumulada. O reposicionamento ganha força quando organiza o legado e o transforma em uma promessa clara para o presente.',
    metaDescription: 'Case Indreco Motores: posicionamento, identidade visual e fotografia para renovar uma empresa industrial com 55 anos de história.',
  },
  kassar: {
    question: 'Como diferenciar um escritório quando a promessa de qualidade parece igual à dos concorrentes?',
    answer: 'O reposicionamento da Kassar partiu de uma promessa considerada homogênea e pouco eficiente. Em 20 reuniões realizadas ao longo de cinco meses, o projeto organizou o DNA da marca, a relação entre os três sócios, a comunicação verbal e uma identidade visual precisa, leve, acolhedora e profissional.',
    decisions: [
      'Equilibrar a presença e a hierarquia dos três sócios na construção da marca.',
      'Definir uma comunicação verbal coerente e linear para o escritório.',
      'Unir precisão técnica e acolhimento na identidade visual.',
    ],
    perspective: 'Dizer que um escritório entrega bons projetos não cria diferenciação por si só. A marca passa a competir melhor quando transforma sua forma particular de trabalhar em linguagem, comportamento e sinais reconhecíveis.',
    metaDescription: 'Case Kassar: cinco meses de posicionamento, comunicação verbal e identidade visual para um escritório de arquitetura, engenharia e interiores.',
  },
  sacralita: {
    question: 'Como transformar uma história pessoal e espiritual em uma marca de galeria de arte?',
    answer: 'A Sacralità nasceu do encontro entre arquitetura, fotografia, viagens, estudos e a experiência do Caminho de Santiago. Estratégia, naming, posicionamento e identidade visual foram reunidos para expressar beleza, fé e conhecimento em uma galeria de arte clássica concebida como sustento e legado familiar.',
    decisions: [
      'Organizar beleza, fé e conhecimento como território central da marca.',
      'Construir um nome compatível com a dimensão clássica e espiritual do projeto.',
      'Dar forma visual a uma proposta que também representa legado familiar.',
    ],
    perspective: 'Marcas com origem biográfica exigem cuidado para que a história não se torne apenas decoração. O trabalho estratégico seleciona os significados essenciais e cria um sistema capaz de compartilhá-los com outras pessoas.',
    metaDescription: 'Case Sacralità: estratégia, naming, posicionamento e identidade visual para uma galeria de arte clássica orientada por beleza, fé e conhecimento.',
  },
  'cia-do-vidro': {
    question: 'Como renovar uma vidraçaria sem recorrer aos clichês visuais do segmento?',
    answer: 'A nova identidade da Cia do Vidro usa tipografia exclusiva com terminações arredondadas para comunicar conforto, segurança e proximidade. O retângulo sintetiza o vidro de forma discreta, enquanto o redesign organiza uma presença mais moderna e compatível com o padrão de qualidade construído em mais de duas décadas.',
    decisions: [
      'Desenhar uma tipografia própria para suavizar a percepção de rigidez associada ao vidro.',
      'Adotar o retângulo como síntese visual do material, evitando símbolos previsíveis.',
      'Equilibrar sofisticação, segurança, confiança e proximidade no sistema de marca.',
    ],
    perspective: 'A diferenciação visual se torna mais consistente quando cada escolha nasce de atributos reais do negócio. Forma, tipografia e composição deixam de ser ornamentos e passam a explicar como a empresa quer ser percebida.',
    metaDescription: 'Case Cia do Vidro: redesign, typedesign, estratégia e identidade visual para traduzir segurança, proximidade e alto padrão sem clichês.',
  },
  profive: {
    question: 'Como representar performance esportiva sem criar uma marca de academia genérica?',
    answer: 'A ProFive foi concebida como um centro de treinamento que leva a excelência da performance esportiva ao ambiente de academia. Naming, símbolo e tipografia exclusiva foram construídos para expressar força, velocidade, tecnologia, dinamismo e persistência, com inspiração na tocha olímpica.',
    decisions: [
      'Usar a tocha olímpica como referência de performance, persistência e determinação.',
      'Reinterpretar o símbolo com linhas retas, movimento e energia.',
      'Desenvolver uma tipografia leve e própria, aplicável nos ambientes digital e físico.',
    ],
    perspective: 'Em categorias visualmente saturadas, listar atributos como força e velocidade não basta. Uma identidade memorável precisa condensar esses atributos em um símbolo reconhecível e em um sistema que funcione nos pontos de contato reais.',
    metaDescription: 'Case ProFive: naming, typedesign e identidade visual inspirada na performance esportiva e na tocha olímpica para um centro de treinamento.',
  },
  'rafael-a-obra': {
    question: 'Como construir uma marca de construção conectada à história e à atuação do fundador?',
    answer: 'A identidade visual da Rafael à Obra parte da trajetória empreendedora de Rafael e de sua atuação com financiamento de terreno e construção. A marca precisava apoiar uma relação baseada em orientação, segurança e soluções financeiras adaptadas a cada projeto.',
    decisions: [
      'Manter o fundador como referência humana e narrativa da marca.',
      'Aproximar os temas de financiamento, terreno e construção em uma identidade única.',
      'Comunicar orientação e segurança em uma decisão de alto envolvimento para o cliente.',
    ],
    perspective: 'Marcas lideradas pelo fundador ganham força quando a história pessoal se conecta a uma proposta concreta. A narrativa abre a conversa, mas é a clareza sobre o serviço e a experiência prometida que sustenta confiança.',
    metaDescription: 'Case Rafael à Obra: identidade visual conectada à trajetória do fundador e à orientação segura para financiamento de terreno e construção.',
  },
};

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

function projectDescriptionPt(value = '') {
  return value
    .replace(/^\s*PT-BR\s*/i, '')
    .split(/\n\s*EN-US\s*\n/i)[0]
    .split(/\n\s*Founded in 2017\b/i)[0]
    .trim();
}

function projectCaseHtml(project) {
  const note = PROJECT_CASE_NOTES[project.slug];
  if (!note) return '';
  return `<section class="project-case-notes light-theme" aria-labelledby="case-question-${escapeHtml(project.slug)}">
    <div class="container">
      <p class="arcaffo-eyebrow">Leitura do case</p>
      <h2 id="case-question-${escapeHtml(project.slug)}">${escapeHtml(note.question)}</h2>
      <p class="project-case-answer">${escapeHtml(note.answer)}</p>
      <div class="project-case-grid">
        <div>
          <h3>Decisões do projeto</h3>
          <ul>${note.decisions.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
        </div>
        <div>
          <h3>O que este trabalho evidencia</h3>
          <p>${escapeHtml(note.perspective)}</p>
        </div>
      </div>
    </div>
  </section>`;
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
    const projectDescription = projectDescriptionPt(projeto.description || '');
    const caseNote = PROJECT_CASE_NOTES[slug];
    const rawDescription = excerptFrom(caseNote?.metaDescription || projectDescription, 157);
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
      keywords: (projeto.tags || []).join(', '),
      abstract: caseNote?.answer,
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

    const descHtml = projectDescription.includes('<')
      ? richText(projectDescription)
      : escapeHtml(projectDescription).replace(/\n/g, '<br>');

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

      ${projectCaseHtml(projeto)}

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
