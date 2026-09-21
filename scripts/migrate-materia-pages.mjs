// One-time mechanical migration. Existing content of Sobre/Serviços is retained.
// Run only after capturing the worktree backup. New layouts live in templates/.
import { readFileSync, writeFileSync } from 'node:fs';
import * as cheerio from 'cheerio';
const pages = ['index','sobre','servicos','projetos','projeto','artigos','artigo','contato','obrigado','vagas'];
const intros = {
  projetos: ['Projetos','Histórias que ganham<br>forma e presença.','Cada trabalho começa pela compreensão de uma empresa. Explore as marcas que ajudamos a construir.'],
  artigos: ['Perspectivas','Um espaço para<br>pensar com profundidade.','Compartilhamos reflexões sobre marcas, pessoas, cultura e negócios. Escolha uma leitura e fique à vontade.'],
  vagas: ['Trabalhe conosco','Há lugar para quem<br>quer construir junto.','Conheça as oportunidades de fazer parte da Arcaffo e contribuir com o nosso trabalho.'],
};
for (const name of pages) {
  const path = `${name}.html`;
  const $ = cheerio.load(readFileSync(path,'utf8'));
  if ($('html').attr('data-materia')) continue;
  $('html').attr('data-materia','2'); $('body').attr('data-page',name);
  $('link[rel="stylesheet"], link[rel="preload"], link[rel="preconnect"], style').remove();
  $('head').append('<link rel="stylesheet" href="/css/materia.css"><link rel="preload" href="/design-system/arcaffo-materia/fonts/newsreader-latin.woff2" as="font" type="font/woff2" crossorigin>');
  $('link[rel="icon"]').attr('href','/images/brand/ff-mark.svg');
  if (!$('link[rel="icon"]').length) $('head').append('<link rel="icon" href="/images/brand/ff-mark.svg" type="image/svg+xml">');
  $('.site-header').replaceWith('<div data-site-header></div>');
  $('.pre-footer-cta, .site-footer').remove();
  $('main').attr({id:'conteudo',tabindex:'-1'}).after('<div data-site-footer></div>');
  $('script').each((_,el)=>{if($(el).attr('type') !== 'application/ld+json')$(el).remove();});
  $('body').append('<script type="module" src="/js/main.js"></script>');
  // Inline layout declarations from the v1 interface must not override Matéria.
  $('main [style]').removeAttr('style');
  $('[class]').each((_,el)=>{
    const classes = ($(el).attr('class') || '').split(/\s+/).filter(c => !/^(animate-on-scroll|card-reveal|text-reveal|delay-\d+|light-theme|hover-scale)$/.test(c));
    $(el).attr('class', classes.join(' '));
  });
  $('[class*="lightsweep"], [class*="-grain"], .arcaffo-regmark, .servicos-hero-mark').remove();
  if (name==='index') $('main').html(readFileSync('templates/home.html','utf8'));
  if (name==='contato') { $('main').html(readFileSync('templates/contact.html','utf8')); $('body').append('<script defer src="/embed/arcaffo-form.js"></script>'); }
  if (name==='obrigado') $('main').html(readFileSync('templates/thanks.html','utf8'));
  if(intros[name]) {
    const [label,title,body]=intros[name];
    let controls=''; let listing='';
    if(name==='projetos') {controls='<div class="collection-controls"><label class="search-label">Buscar projeto<input type="search" data-search placeholder="Nome da marca" autocomplete="off"></label><div class="filters" data-project-filters aria-label="Filtrar por entrega"></div></div><p class="collection-count" data-project-count data-result-count role="status"></p>';listing='<div class="project-grid" data-projects-all></div>';}
    if(name==='artigos') {controls='<div class="collection-controls"><label class="search-label">Buscar uma leitura<input type="search" data-search placeholder="Um título ou assunto" autocomplete="off"></label></div><p data-result-count class="collection-count" role="status"></p>';listing='<div class="articles-grid" data-articles-all></div>';}
    if(name==='vagas')listing='<div class="jobs-list" data-jobs-all></div>';
    $('main').html(`<section class="page-intro container"><span class="arcaffo-eyebrow">${label}</span><h1>${title}</h1><p>${body}</p></section><section class="container section-bottom" data-collection>${controls}${listing}<p data-empty hidden>Nenhum resultado para esta busca. Experimente outro termo.</p></section>`);
  }
  if(name==='sobre'){
    $('.sobre-hero').addClass('page-intro');
    $('.team-section').attr('id','equipe');
    $('.sobre-hero h1').html('Acreditamos nas pessoas.<br>E no que elas podem construir.');
    $('.sobre-hero-quote').before('<p class="intro-copy">Construímos marcas a partir daquilo que uma empresa tem de mais próprio: sua história, seus valores e as pessoas que dão vida ao trabalho.</p>');
    $('.sobre-hero').after('<figure class="about-band"><img src="/images/fachada.webp" alt="A casa da Arcaffo em Campo Grande" width="1920" height="1314"><figcaption>Um lugar para conhecer, compreender e construir.</figcaption></figure>');
    $('.ecosystem-card p').each((_,el)=>$(el).text($(el).text().replace('posicionamentos inabaláveis','posicionamentos consistentes').replace('restrito e superexclusivo','de relacionamento').replace('líderes visionários','empresários e equipes')));
  }
  if(name==='servicos'){
    $('.servicos-hero').addClass('page-intro');
    $('.servicos-hero h1').html('O seu momento.<br>O nosso modo de contribuir.');
    // Preserve offerings, partners, names and existing business evidence.
    $('.servicos-hero-text').append('<a class="text-link" href="/#mesa-de-trabalho">Explore uma questão à nossa mesa ↗</a>');
  }
  if(name==='artigo'){$('#article-cover-container').attr('hidden','');$('.article-container').addClass('section-bottom');$('body').append('<script type="module" src="/js/legacy-detail.js"></script>');}
  if(name==='projeto')$('body').append('<script type="module" src="/js/legacy-detail.js"></script>');
  $('h1,h2,h3,h4').each((_,el)=>$(el).removeClass('text-accent'));
  if(!['artigo','projeto'].includes(name)){
    const url='https://www.arcaffo.com'+(name==='index'?'/':`/${name}.html`);
    $('link[rel="canonical"]').remove();$('head').append(`<link rel="canonical" href="${url}">`);
    $('meta[property="og:url"]').attr('content',url);
  }
  writeFileSync(path,$.html());
}
