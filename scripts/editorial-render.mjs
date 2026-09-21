import { CHAPTERS, editorialContent } from '../shared/editorial-content.mjs';
import { HOME_CAMPAIGN } from '../shared/home-campaign.mjs';
import { icon } from '../shared/icons.mjs';
import { projectPicture } from '../shared/responsive-images.mjs';
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeImage = s => /^(https?:\/\/|\/(?!\/))/.test(s || '') && !/[\s<>"\\]/.test(s) ? s : '';
const pic = (name, alt, cls = '', eager = false) => `<img class="${cls}" src="/images/materia/${name}-960.webp" srcset="/images/materia/${name}-640.webp 640w, /images/materia/${name}-960.webp 960w, /images/materia/${name}-1600.webp 1600w" sizes="(max-width: 760px) 100vw, 60vw" width="960" height="1280" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'}>`;
const link = (href, text) => `<a class="text-link" href="${href}">${text}${icon('diagonal')}</a>`;
const panels = (id, label, items) => `<div class="explorer" data-explorer="${id}"><div class="explorer-options" aria-label="${label}">${items.map(([key,title],i) => `<a href="#${id}-${key}" data-option="${i}">${title}${icon('right')}</a>`).join('')}</div><div class="explorer-content">${items.map(([key,title,body],i) => `<div class="explorer-panel" id="${id}-${key}" data-explorer-panel="${i}" tabindex="0"><h3>${title}</h3><p>${body}</p></div>`).join('')}</div></div>`;
const ecosystem = () => `<section class="section-space ecosystem-editorial" id="ecossistema"><div class="container"><h2 class="ecosystem-title"><span>O ecossistema</span><img src="/images/brand/logo-arcaffo-group-b.svg" alt="Arcaffo GROUP" width="430" height="84"></h2><p class="lede"><span>Formação, estratégia e relacionamento.</span><span>Um trabalho que se completa.</span></p><div class="ecosystem-editorial-grid">${[
['advisor_fb.webp','Arcaffo Advisor','Estratégia e acompanhamento para estruturar a marca e o negócio.','https://advisor.arcaffo.com'],
['enm_Arcaffo_ENM_Logo_b_r_h_p_v_3_1_png.webp','Escola de Negócios e Marcas','Conhecimento e prática para desenvolver empresários e equipes.','https://enm.arcaffo.com'],
['ordo_p.webp','Ordo Legatum','Conhecimento, relacionamento e ambiente para líderes.','https://ordo.arcaffo.com'],
].map(([image,title,body,url])=>`<a href="${url}" target="_blank" rel="noopener noreferrer"><img src="/images/ecossistema/${image}" alt="" loading="lazy" width="560" height="180"><h3>${title}</h3><p>${body}</p>${icon('diagonal')}</a>`).join('')}</div></div></section>`;

function applyHomeCampaign($) {
  if (!HOME_CAMPAIGN.enabled) return;
  const c = HOME_CAMPAIGN;
  // O CTA leva ao formulário (portão de qualificação); o WhatsApp fica como
  // caminho secundário e já pede os dados da empresa no texto.
  const ctaAttrs = { href: c.ctaHref, 'data-cta': 'diagnostico' };

  $('body').addClass('campaign-home');
  $('.home-hero').addClass('home-hero--campaign');
  $('.hero-heading').prepend(`<p class="campaign-eyebrow">${esc(c.eyebrow)}</p>`);
  $('#home-title').html(`<span class="campaign-title-line">${esc(c.titleLead)}</span>\n<span class="campaign-title-line hero-second-line">${esc(c.titleAccent)}</span>`);
  $('.home-introduction').text(c.subtitle);
  // No celular a foto empurraria o botão para fora da primeira dobra.
  $('.home-introduction').after(`<a class="btn campaign-hero-cta-mobile" id="cta-diagnostico-topo" ${Object.entries(ctaAttrs).map(([k,v])=>`${k}="${esc(v)}"`).join(' ')}>${esc(c.ctaMobile)}</a>`);

  const heroCtas = $('.hero-band .hero-ctas');
  const heroPrimary = heroCtas.find('a').first();
  heroPrimary.removeAttr('data-cms data-cms-href target rel').attr({
    ...ctaAttrs,
    id: 'cta-diagnostico-hero',
    class: 'btn btn-light campaign-hero-cta',
    'aria-label': c.ctaFull,
    'data-label-full': c.ctaFull,
    'data-label-mobile': c.ctaMobile,
  }).html(`<span class="cta-label-full" aria-hidden="true">${esc(c.ctaFull)}</span><span class="cta-label-mobile" aria-hidden="true">${esc(c.ctaMobile)}</span>`);
  heroCtas.find('a').eq(1).removeAttr('data-cms data-cms-href target rel id data-cta aria-label').attr({
    href: '#mesa-de-trabalho',
    class: 'btn btn-ghost-on-photo',
  }).text('Conheça como trabalhamos');

  const fit = `<div class="diagnostic-fit"><p><strong>${esc(c.diagnosticForLabel)}</strong> ${esc(c.diagnosticFor)}</p><p><strong>${esc(c.diagnosticNotForLabel)}</strong> ${esc(c.diagnosticNotFor)} <a href="${esc(c.diagnosticNotForLinkUrl)}" target="_blank" rel="noopener">${esc(c.diagnosticNotForLinkLabel)}</a>.</p></div>`;
  const actions = `<div class="diagnostic-actions"><a class="btn btn-primary diagnostic-cta" id="cta-diagnostico-bloco" ${Object.entries(ctaAttrs).map(([k,v])=>`${k}="${esc(v)}"`).join(' ')}>${esc(c.ctaFull)}</a><span class="diagnostic-proof">${esc(c.proof)}</span></div><p class="diagnostic-note">${esc(c.diagnosticNote)}</p><a class="text-link diagnostic-whatsapp" href="${esc(c.whatsappUrl)}" target="_blank" rel="noopener">${esc(c.whatsappLabel)}${icon('diagonal')}</a>`;
  const diagnostic = `<section class="diagnostic-offer" id="diagnostico-gratuito" aria-labelledby="diagnostic-title"><div class="container diagnostic-grid"><div class="diagnostic-copy"><h2 id="diagnostic-title">${esc(c.diagnosticTitle)}</h2><p>${esc(c.diagnosticBody)}</p>${fit}${actions}</div><ol class="diagnostic-list" aria-label="O que você recebe no diagnóstico">${c.diagnosticItems.map((item,index)=>`<li><span aria-hidden="true">0${index+1}</span><p>${esc(item)}</p></li>`).join('')}</ol></div></section>`;
  $('.home-hero').after(diagnostic);

  $('.invitation .btn').removeAttr('data-cms data-cms-href target rel').attr({
    ...ctaAttrs,
    id: 'cta-diagnostico-final',
  }).text(c.ctaFinal);
}

export function aboutPage(content) {
  const c = editorialContent(content).about;
  const artifacts = [
    `<span class="archive-word">Arquitetura<br>&amp; marca.</span><span class="archive-note">O campo de atuação inicial</span>`,
    `<span class="archive-word">Essência.<br>Posicionamento.<br>Expressão.</span><span class="archive-note">O olhar se aprofunda</span>`,
    `<div class="archive-method"><span>B</span><span>C</span><span>I</span></div><span class="archive-note">Bíblia da Marca · Comportamento · Imagem</span>`,
    `<div class="archive-names"><span>Arthur Fava</span><span>Luiz Paulo</span><span>Fabrício Rodrigues</span></div><span class="archive-note">Liderança e capacidade de entrega</span>`,
    `<div class="archive-names"><span>Advisor</span><span>Escola de Negócios</span><span>Ordo Legatum</span></div><span class="archive-note">Um ecossistema em desenvolvimento</span>`,
  ];
  return `<section class="about-opening container"><div class="opening-copy"><h1>${esc(c.title)}</h1><p>${esc(c.introduction)}</p><a class="text-link" href="#historia">Nossa história${icon('down')}</a></div><figure class="about-still" data-photo-motion>${pic('casa','Xícaras Arcaffo sobre a mesa da casa', '', true)}<figcaption>O cuidado também está nos detalhes.</figcaption></figure></section>
  <section class="history-section" id="historia" aria-labelledby="history-title"><div class="container"><div class="history-heading"><h2 id="history-title">Uma história em construção.</h2><p>Cada escolha abriu espaço para o próximo capítulo.</p></div><nav class="history-index" aria-label="Capítulos da história">${CHAPTERS.map(year=>`<a href="#ano-${year}" data-year-link="${year}">${year}</a>`).join('')}</nav><div class="history-layout"><div class="history-stage" aria-hidden="true"><span class="history-stage-year">2016</span><div class="history-stage-artifact">${artifacts[0]}</div><div class="history-progress"><span></span></div></div><div class="history-chapters">${CHAPTERS.map((year,i)=>`<article class="history-chapter" id="ano-${year}" data-chapter="${year}"><span class="chapter-year">${year}</span><h3>${esc(c[`year_${year}_title`])}</h3><p>${esc(c[`year_${year}_body`])}</p><div class="chapter-artifact">${safeImage(c[`year_${year}_image`]) ? `<figure><img src="${esc(c[`year_${year}_image`])}" alt="${esc(c[`year_${year}_caption`])}" loading="lazy"><figcaption>${esc(c[`year_${year}_caption`])}</figcaption></figure>` : artifacts[i]}</div></article>`).join('')}</div></div></div></section>
  <section class="essence-editorial section-space"><div class="container"><h2>O que nos move.</h2><div class="essence-composition" data-essence><div class="essence-terms" role="tablist" aria-label="Princípios da Arcaffo"><button id="essence-faith-tab" type="button" role="tab" aria-controls="essence-faith" aria-selected="true">Fé.</button><button id="essence-family-tab" type="button" role="tab" aria-controls="essence-family" aria-selected="false">Família.</button><button id="essence-authority-tab" type="button" role="tab" aria-controls="essence-authority" aria-selected="false">Autoridade.</button></div><div class="essence-text"><div class="essence-panel" id="essence-faith" role="tabpanel" aria-labelledby="essence-faith-tab"><h3>Fé</h3><p>Vivemos nossa fé de modo natural e visível. Ela orienta a maneira como decidimos e servimos.</p></div><div class="essence-panel" id="essence-family" role="tabpanel" aria-labelledby="essence-family-tab"><h3>Família</h3><p>A família é nossa vocação. Trabalhamos para que esse chamado seja cumprido com excelência.</p></div><div class="essence-panel" id="essence-authority" role="tabpanel" aria-labelledby="essence-authority-tab"><h3>Autoridade</h3><p>A autoridade se constrói com coerência, compostura e discernimento no que falamos e ensinamos.</p></div></div></div><blockquote>“Tudo o que fazemos, fazemos primeiro para o outro.”</blockquote></div></section>
  <section class="culture-editorial section-space"><div class="container culture-layout"><div><h2>A cultura aparece<br>nas atitudes.</h2><p>Os princípios que orientam a maneira como trabalhamos e nos relacionamos.</p></div><div class="culture-accordions">${[
['Humildade','Assumir erros. Servir sem vaidade.','Ver-se como é diante dos outros. Reconhecer limites e corrigir o que precisa melhorar.'],
['Maturidade','Responder pelo que fazemos.','Enfrentar a vida com fortaleza e responsabilidade, sem egoísmo.'],
['Estudo constante','Aprender para fazer melhor.','Aprofundar o conhecimento humano e técnico. Não se conformar com o pouco.'],
['Espírito de serviço','Colocar o trabalho a serviço do outro.','Generosidade e prontidão para contribuir. Serviam.'],
['Olhar de grandeza','Dedicar forças ao que vale a pena.','Buscar grandes ideais e cultivar a magnanimidade.'],
['Integridade','Fazer o que se diz.','Coerência entre pensamento, palavra e ação. Transparência e respeito.'],
].map(([title,statement,body],i)=>`<details ${i===0?'open':''}><summary>${title}<span class="detail-symbol">${icon('plus')}</span></summary><div class="culture-answer"><h3>${statement}</h3><p>${body}</p></div></details>`).join('')}</div></div></section>
  <section class="leadership-editorial section-space" id="equipe"><div class="container"><div class="section-heading-row"><h2>Quem assume<br>essa direção.</h2><p>Três trajetórias que se encontram<br>no trabalho da Arcaffo.</p></div><div class="leadership-grid">${[['arthur','Arthur Fava','Sócio e Diretor Comercial'],['luiz','Luiz Paulo Pacheco','Sócio e Diretor de Projetos'],['fabricio','Fabrício O. Rodrigues','Sócio e Diretor Operacional']].map(([file,name,role])=>`<figure>${pic(file,name)}<figcaption><h3>${name}</h3><p>${role}</p></figcaption></figure>`).join('')}</div></div></section>${ecosystem()}`;
}

export function servicesPage(content) {
 const c=editorialContent(content).services;
 return `<section class="services-opening container"><h1>${esc(c.title)}</h1><p class="lede">${esc(c.introduction)}</p><nav class="service-index" aria-label="Frentes de atuação"><a href="#advisor">Estruturar${icon('down')}</a><a href="#escola">Ensinar${icon('down')}</a><a href="#ordo-legatum">Elevar${icon('down')}</a></nav></section>
 <section class="method-section section-space"><div class="container"><div class="section-heading-row"><h2>Da identidade<br>à presença.</h2><p>Explore as três dimensões<br>da metodologia Arcaffo.</p></div>${panels('metodo','Dimensões da metodologia', [['biblia','Bíblia da Marca',esc(c.bible_body)],['comportamento','Comportamento',esc(c.behavior_body)],['imagem','Imagem',esc(c.image_body)]])}</div></section>
 <section class="advisor-editorial section-space" id="advisor"><div class="container"><div class="service-title"><img src="/images/ecossistema/advisor_fb.webp" alt="Arcaffo Advisor" width="240" height="90" loading="lazy"><h2>Estruturar.</h2></div><div class="service-introduction"><p class="lede">Estratégia que encontra<br>o trabalho de todos os dias.</p><p>Assessoria estratégica contínua para empresários. Encontros quinzenais, planos de ação e suporte próximo conectam direção e execução.</p></div>${panels('advisor-area','Áreas da assessoria',[['identidade','Identidade e posicionamento',esc(c.advisor_identity)],['negocio','Modelo de negócio e vendas',esc(c.advisor_business)],['marketing','Gestão de marketing',esc(c.advisor_marketing)],['cultura','Cultura organizacional',esc(c.advisor_culture)]])}<div class="service-footnote"><p>Encontros com o estrategista · Planos de ação · Suporte via WhatsApp</p>${link('https://advisor.arcaffo.com','Conheça a Advisor')}</div><div class="execution-network"><span>Quem executa</span><span>Branding</span><img src="/images/ecossistema/milme_a.svg" alt="MILME" loading="lazy"><img src="/images/ecossistema/desino_azul.webp" alt="Desino arquitetura" loading="lazy"><span>Marketing</span></div></div></section>
 <section class="school-editorial section-space" id="escola"><div class="container school-layout"><div class="school-visual"><img class="school-logo" src="/images/ecossistema/enm_Arcaffo_ENM_Logo_b_r_h_p_v_3_1_png.webp" alt="Escola de Negócios e Marcas" width="560" height="210" loading="lazy"><h2>Ensinar.</h2><figure data-photo-motion>${pic('casa','Detalhe das xícaras na casa da Arcaffo')}<figcaption>Conhecimento encontra conversa.</figcaption></figure></div><div class="school-content"><p class="lede">Conhecimento que<br>se leva para a empresa.</p><p>Formação prática em branding, gestão estratégica e vendas para líderes e equipes.</p>${panels('escola-formato','Formatos de formação',[['imersoes','Imersões presenciais',esc(c.school_immersion)],['company','In company',esc(c.school_company)],['workshops','Workshops e palestras',esc(c.school_workshop)]])}${link('https://enm.arcaffo.com','Explore a Escola')}</div></div></section>
 <section class="ordo-editorial section-space" id="ordo-legatum"><div class="container"><img class="ordo-logo" src="/images/ecossistema/ordo_p.webp" alt="Ordo Legatum" width="220" height="120" loading="lazy"><div class="section-heading-row"><h2>Elevar.</h2><p>Uma jornada de 12 meses para líderes<br>que querem construir legado.</p></div><div class="ordo-dimensions">${[['Conhecimento','Imersões e sessões estratégicas para ampliar o olhar.'],['Relacionamento','Encontros entre empresários para compartilhar experiências.'],['Ambiente','Um espaço de comprometimento e desenvolvimento.']].map(([title,body])=>`<article><h3>${title}</h3><p>${body}</p></article>`).join('')}</div><div class="service-footnote"><p>Imersões presenciais · Encontros online · Acesso à Escola de Negócios</p>${link('https://ordo.arcaffo.com','Conheça a Ordem')}</div></div></section>`;
}

export function refinePages($, content) {
 const page=$('body').attr('data-page');
 if(page==='sobre') $('main').html(aboutPage(content));
 if(page==='servicos') $('main').html(servicesPage(content));
 if(page==='servicos') $('.ordo-logo').attr('src','/images/ecossistema/ordo_b.webp');
 if(page==='index') {
  $('.home-people,.worktable-note').remove();
  const introduction=$('.hero-band-inner > p');
  introduction.insertAfter('.hero-heading h1').addClass('home-introduction');
  const introText=introduction.text().trim();
  const introParts=introText.match(/^(.*?negócios\.)(\s+.*)$/i);
  if(introParts)introduction.html(`<span>${esc(introParts[1])}</span><span>${esc(introParts[2].trim())}</span>`);
  const projects=JSON.parse((content.__projects || '[]'));
  const indreco=projects.find(p=>p.slug==='indreco');
  if(indreco?.cover) $('[data-panel="marca"] .table-artifact').replaceWith(`<figure class="worktable-evidence">${projectPicture(safeImage(indreco.cover),'Identidade visual da Indreco, projeto Arcaffo')}<figcaption>Indreco · Identidade de marca</figcaption></figure>`);
  $('[data-panel="pessoas"] .table-artifact').replaceWith('<blockquote class="worktable-quote">A cultura se revela no que as pessoas fazem todos os dias.</blockquote>');
  $('[data-panel="negocio"] .table-artifact').replaceWith('<div class="worktable-deliverables"><p>Encontros com o estrategista</p><p>Planos de ação</p><p>Acompanhamento da execução</p></div>');
  $('.ecosystem-section').replaceWith(ecosystem());
 }
 // Keep factual collection labels; remove all ornamental overlines.
 $('.arcaffo-eyebrow').each((_,el)=>{if($(el).closest('.article-card,.job-card,.article-author').length || $(el).is('#article-date')) $(el).removeClass('arcaffo-eyebrow').addClass('content-meta');else $(el).remove();});
 if(page==='index') applyHomeCampaign($);
 $('head').append('<link rel="stylesheet" href="/css/chapters.css">');
 // Convert only interface text nodes, never article/client content.
 const symbols={'↗':'diagonal','→':'right','←':'left','↓':'down','↑':'up'};
 $('a,button,.choice-arrow').each((_,el)=>{
  if($(el).closest('#article-content,.project-description').length)return;
  function walk(node){for(const child of [...(node.children||[])]){if(child.type==='text' && /[↗→←↓↑]/.test(child.data))$(child).replaceWith(child.data.split(/([↗→←↓↑])/).map(s=>symbols[s]?icon(symbols[s]):esc(s)).join(''));else if(child.type==='tag' && child.name!=='svg')walk(child);}}
  walk(el);
 });
}
