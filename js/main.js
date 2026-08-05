import { initAnimations } from './animations.js';

document.addEventListener('DOMContentLoaded', () => {
  // Inicializar animações
  initAnimations();

  // Scroll Header Effect
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Spotlight Hover Effect for cards
  let isScrolling = false;
  let ticking = false;

  document.addEventListener('mousemove', (e) => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        document.querySelectorAll('.card, .service-card').forEach((card) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          card.style.setProperty('--mouse-x', `${x}px`);
          card.style.setProperty('--mouse-y', `${y}px`);
        });
        ticking = false;
      });
      ticking = true;
    }
  });
  // Highlight current nav item
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-links a');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href !== '/' && currentPath.includes(href)) {
      link.classList.add('active');
    } else if (currentPath === '/' && href === '/') {
      link.classList.add('active');
    }
  });

  // Track WhatsApp/e-mail clicks as conversions, queued into dataLayer so
  // gtag.js (loaded a few seconds later on purpose) picks them up once ready.
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="https://wa.me"], a[href^="mailto:"]');
    if (!link) return;
    window.dataLayer = window.dataLayer || [];
    const isWhatsapp = link.href.startsWith('https://wa.me');
    window.dataLayer.push(['event', isWhatsapp ? 'whatsapp_click' : 'email_click', {
      event_category: 'contato',
      event_label: link.href,
    }]);
  });
});

