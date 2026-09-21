import { initWorktable } from './worktable.js';
import { initGallery } from './gallery.js';
import { initChapters } from './chapters.js';
import { injectSpeedInsights } from '@vercel/speed-insights';

document.documentElement.classList.add('has-js');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
window.addEventListener('pagereveal', event => {
  // Rapid navigation/reduced-motion changes can legitimately skip a native transition.
  event.viewTransition?.ready.catch(() => {});
});
function track(name, data = {}) {
  window.dataLayer = window.dataLayer || [];
  if(window.gtag)window.gtag('event', name, data);
  else window.dataLayer.push({event:name,...data});
}
function initMenu() {
  const button = document.querySelector('.mobile-menu-btn');
  const menu = document.querySelector('#site-navigation');
  if (!button || !menu) return;
  function close(returnFocus = false) {
    menu.classList.remove('open'); button.setAttribute('aria-expanded','false');
    if (returnFocus) button.focus();
  }
  button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(open)); menu.classList.toggle('open',open);
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('open')) close(true); });
  menu.addEventListener('click', e => { if (e.target.closest('a')) close(); });
  document.addEventListener('click',e => { if (!e.target.closest('.site-header')) close(); });
  document.querySelector('.site-header')?.addEventListener('focusout',e => { if (e.relatedTarget && !e.currentTarget.contains(e.relatedTarget)) close(); });
  window.matchMedia('(min-width: 761px)').addEventListener('change', () => close());
}
function initCollections() {
  document.querySelectorAll('[data-collection]').forEach(root => {
    const search = root.querySelector('[data-search]');
    const items = [...root.querySelectorAll('[data-filter-item]')];
    const filters = [...root.querySelectorAll('[data-filter]')];
    if (!items.length) return;
    let tag = '';
    const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');
    function update() {
      const term = normalize(search?.value || ''); let count = 0;
      items.forEach(item => {
        const visible = (!tag || (item.dataset.tags || '').split('|').includes(tag)) && normalize(item.dataset.title || '').includes(term);
        item.hidden = !visible; if (visible) count++;
      });
      const status = root.querySelector('[data-result-count]');
      if (status) status.textContent = `${count} ${root.querySelector('[data-projects-all]') ? (count === 1 ? 'projeto' : 'projetos') : (count === 1 ? 'artigo' : 'artigos')}`;
      const empty = root.querySelector('[data-empty]'); if (empty) empty.hidden = count > 0;
    }
    search?.addEventListener('input', update);
    filters.forEach(button => button.addEventListener('click', () => {
      tag = button.dataset.filter; filters.forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      update(); track('portfolio_filter',{category:tag || 'todos'});
    })); update();
  });
}
// Opções da pergunta "Qual é o seu momento hoje?" do formulário Site_Arcaffo
// (forms.arcaffo.com) que não entram como conversão de anúncio: "Preciso só de um
// logotipo…" e "Estou abrindo a empresa agora". Os ids vêm do admin do Forms; o
// texto do rótulo é o fallback caso a pergunta seja recriada.
const LEAD_GATE_INICIAL = ['0fb1ffd5-f029-49eb-9f2e-d32c71b556b9', '9a2a9493-0b72-4768-b203-39d238d84a9b'];
const LEAD_GATE_INICIAL_LABEL = /só de um logotipo|abrindo a empresa/i;
const LEAD_KEY = 'arcaffo:lead';
function initContact() {
  const embed = document.querySelector('[data-arcaffo-form]'); if (!embed) return;
  const contexts = { marca:'Sua marca e seu posicionamento', pessoas:'Sua equipe e sua cultura', negocio:'A estrutura do seu negócio', diagnostico:'Diagnóstico gratuito de Marca e Posicionamento' };
  const topic = new URLSearchParams(location.search).get('assunto');
  const context = document.querySelector('[data-contact-context]');
  if (context && contexts[topic]) { context.textContent = `À nossa mesa: ${contexts[topic]}. Podemos começar nossa conversa por aqui.`; context.hidden = false; }
  const labels = topic === 'diagnostico'
    ? { title:'Pedir o diagnóstico gratuito', submit:'Quero o diagnóstico gratuito' }
    : { title:'Solicitar uma conversa', submit:'Enviar minha solicitação' };
  function styleLabels() {
    const title = embed.querySelector('.arcaffo-title');
    if (title && title.textContent !== labels.title) title.textContent = labels.title;
    const submit = embed.querySelector('button[type="submit"]');
    if (submit && !submit.disabled && submit.textContent !== labels.submit) submit.textContent = labels.submit;
  }
  function leadPerfil() {
    const picked = [...embed.querySelectorAll('input[type="radio"]:checked')];
    const inicial = picked.some(input => LEAD_GATE_INICIAL.includes(input.value) || LEAD_GATE_INICIAL_LABEL.test(input.closest('label')?.textContent || ''));
    return inicial ? 'inicial' : 'qualificado';
  }
  document.addEventListener('arcaffo:ready', e => { if (e.target === embed) styleLabels(); });
  document.addEventListener('arcaffo:submit', e => {
    if (e.target !== embed) return;
    try { sessionStorage.setItem(LEAD_KEY, leadPerfil()); } catch {}
  });
  document.addEventListener('arcaffo:error', e => { if(e.target === embed) track('contact_error',{category:'formulario'}); });
  document.addEventListener('arcaffo:success', e => {
    if (e.target !== embed) return;
    const section = embed.querySelector('.arcaffo-success'); const heading = section?.querySelector('h2');
    if (heading) { heading.textContent = 'Recebemos sua solicitação.'; heading.tabIndex = -1; heading.focus(); }
    if (section) { let p = section.querySelector('p'); if(!p){p=document.createElement('p');section.append(p);}p.textContent='Nossa equipe entrará em contato para combinar o horário da conversa. Obrigado por compartilhar seu momento conosco.'; }
    let perfil = 'qualificado'; try { perfil = sessionStorage.getItem(LEAD_KEY) || perfil; } catch {}
    track('generate_lead',{event_category:'contato',event_label:'formulario',lead_perfil:perfil});
  });
  const observer = new MutationObserver(styleLabels); observer.observe(embed,{childList:true,subtree:true}); styleLabels();
}
function initReveals() {
  if(reducedMotion.matches || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if(!entry.isIntersecting)return; observer.unobserve(entry.target);
    if(!reducedMotion.matches) entry.target.animate([{transform:'translateY(15px)',opacity:.9},{transform:'translateY(0)',opacity:1}],{duration:550,easing:'cubic-bezier(.4,0,.2,1)'});
  }),{threshold:.12});
  document.querySelectorAll('.section-intro,.editorial-copy,.section-heading-row,.diagnostic-grid,.essence-text,.culture-layout > div:first-child,.leadership-grid figure,.ecosystem-editorial-grid > a,.service-introduction,.article-card,.project-card,.invitation-grid').forEach(el=>observer.observe(el));
  const opening=document.querySelector('main h1');
  if(opening)opening.animate([{transform:'translateY(18px)',opacity:.9},{transform:'none',opacity:1}],{duration:650,easing:'cubic-bezier(.2,0,.2,1)'});
  reducedMotion.addEventListener('change',()=>{if(reducedMotion.matches)document.getAnimations().forEach(animation=>animation.cancel());});
}
// Google Ads (conta 114-496-7466). Os rótulos vêm de Metas > Conversões.
const ADS_ID = 'AW-11127456356';
const ADS_CONV = {
  whatsapp: `${ADS_ID}/71DyCL-82OsZEOSE_rkp`, // "Contato - Botão Wpp"
  form: `${ADS_ID}/DP6YCLiXuJUYEOSE_rkp`,     // "Inscrição - quer o serviço da Arcaffo"
};
function adsConversion(sendTo) {
  if(window.gtag) window.gtag('event', 'conversion', { send_to: sendTo });
}
function initAnalytics() {
  document.addEventListener('click', e => {
    const diagnostic = e.target.closest('[data-cta="diagnostico"]');
    if (diagnostic) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'cta_diagnostico_click', cta_local: diagnostic.id });
    }
    const a = e.target.closest('a'); if(!a)return;
    if(a.href.startsWith('https://wa.me/')) { track('whatsapp_click',{event_category:'contato'}); adsConversion(ADS_CONV.whatsapp); }
    else if(a.href.startsWith('mailto:')) track('email_click',{event_category:'contato'});
    else if(new URL(a.href).pathname === '/contato.html') track('contact_open',{event_category:'contato'});
  });
  window.dataLayer = window.dataLayer || []; window.gtag = function(){ window.dataLayer.push(arguments); };
  if(location.pathname === '/obrigado.html') {
    // Só o lead qualificado (ver LEAD_GATE_INICIAL) conta como conversão de anúncio.
    let perfil = 'qualificado';
    try { perfil = sessionStorage.getItem(LEAD_KEY) || perfil; sessionStorage.removeItem(LEAD_KEY); } catch {}
    if(perfil !== 'inicial') adsConversion(ADS_CONV.form);
    document.querySelectorAll('[data-thanks]').forEach(block => { block.hidden = block.dataset.thanks !== perfil; });
    const title = document.querySelector('main h1');
    if(perfil === 'inicial' && title?.dataset.titleInicial) title.textContent = title.dataset.titleInicial;
  }
  if(!['arcaffo.com','www.arcaffo.com'].includes(location.hostname))return;
  // Configs enfileiradas já; o script carrega em seguida (sem atraso: cliques rápidos no WhatsApp
  // vindos de anúncio precisam ser medidos).
  window.gtag('js',new Date());
  window.gtag('config','G-3FVJTG0EF4');
  window.gtag('config',ADS_ID);
  const script=document.createElement('script');script.src='https://www.googletagmanager.com/gtag/js?id=G-3FVJTG0EF4';script.async=true;document.head.append(script);
}
function initResponsiveLabels() {
  const cta = document.querySelector('[data-label-full][data-label-mobile]');
  if (!cta) return;
  const mobile = window.matchMedia('(max-width: 760px)');
  const sync = () => cta.setAttribute('aria-label', mobile.matches ? cta.dataset.labelMobile : cta.dataset.labelFull);
  mobile.addEventListener('change', sync); sync();
}
function initPerformanceInsights() {
  if (['arcaffo.com','www.arcaffo.com'].includes(location.hostname) || location.hostname.endsWith('.vercel.app')) injectSpeedInsights({framework:'vite'});
}
initResponsiveLabels(); initAnalytics(); initMenu(); initWorktable(track); initCollections(); initGallery(track); initContact(); initReveals(); initChapters(track); initPerformanceInsights();
