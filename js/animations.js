const WATCH_SELECTOR = '.animate-on-scroll, .card-reveal, .text-reveal';

// O setup do MutationObserver abaixo já cobre qualquer elemento injetado
// depois (fetch + innerHTML), então chamar initAnimations() de novo — como
// alguns componentes faziam a cada re-render (filtro de projetos, artigos) —
// só empilhava um MutationObserver novo por chamada, todos escutando
// document.body pra sempre. Esse guard torna o setup do observer idempotente;
// chamar initAnimations() mais de uma vez continua seguro, só não faz nada
// além da primeira vez.
let mutationObserverStarted = false;

export function initAnimations() {
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  function prepareTextReveal(el) {
    if (el.dataset.initialized) return;
    const text = el.textContent;
    el.innerHTML = '';
    const words = text.split(' ');
    words.forEach((word, idx) => {
      const span = document.createElement('span');
      span.textContent = word + (idx < words.length - 1 ? ' ' : '');
      span.style.transitionDelay = `${idx * 0.05}s`;
      el.appendChild(span);
    });
    el.dataset.initialized = 'true';
  }

  function watch(el) {
    if (el.classList.contains('text-reveal')) prepareTextReveal(el);
    observer.observe(el);
  }

  document.querySelectorAll(WATCH_SELECTOR).forEach(watch);

  if (mutationObserverStarted) return;
  mutationObserverStarted = true;

  // Várias páginas populam cards/listas via fetch + innerHTML depois deste
  // DOMContentLoaded (servicos, projetos em destaque, artigos, vagas...).
  // Sem isso, esses elementos .animate-on-scroll nunca são observados e ficam
  // presos em opacity:0 pra sempre — um bug real de visibilidade de conteúdo,
  // não só cosmético. O MutationObserver pega qualquer elemento assim inserido
  // depois, não importa a página ou o script que o injetou.
  const mutationObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType !== 1) continue;
        if (node.matches(WATCH_SELECTOR)) watch(node);
        node.querySelectorAll?.(WATCH_SELECTOR).forEach(watch);
      }
    }
  });
  mutationObserver.observe(document.body, { childList: true, subtree: true });
}
