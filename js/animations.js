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

  const elements = document.querySelectorAll('.animate-on-scroll, .text-reveal');
  elements.forEach(el => observer.observe(el));

  // Preparar elementos de text-reveal
  document.querySelectorAll('.text-reveal').forEach(el => {
    if (!el.dataset.initialized) {
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
  });
}
