// Spotlight interativo sobre a marca "ff" no hero de /servicos — luz segue o
// cursor (ou o dedo, em touch); sem input, deriva devagar sozinha. Módulo
// dedicado (não entra no loop de mousemove de main.js, que já itera .card em
// todas as páginas) — só carrega em servicos.html.

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.addEventListener('DOMContentLoaded', () => {
  const mark = document.querySelector('.servicos-hero-mark');
  if (!mark) return;

  requestAnimationFrame(() => requestAnimationFrame(() => {
    mark.classList.add('is-revealed');
  }));

  if (reduceMotion) return;

  const section = document.querySelector('.servicos-hero');
  if (!section) return;

  let rect = mark.getBoundingClientRect();
  window.addEventListener('resize', () => {
    rect = mark.getBoundingClientRect();
  });

  let targetX = 50;
  let targetY = 50;
  let currentX = 50;
  let currentY = 50;
  let lastInputAt = 0;
  const IDLE_AFTER_MS = 2200;

  function setTargetFromPoint(clientX, clientY) {
    targetX = ((clientX - rect.left) / rect.width) * 100;
    targetY = ((clientY - rect.top) / rect.height) * 100;
    lastInputAt = performance.now();
  }

  section.addEventListener('mousemove', (e) => setTargetFromPoint(e.clientX, e.clientY));
  section.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    if (touch) setTargetFromPoint(touch.clientX, touch.clientY);
  }, { passive: true });

  function idlePoint(t) {
    // Deriva lenta em Lissajous — some segundos sem input, então a luz
    // continua "viva" sozinha em vez de congelar onde o mouse a deixou.
    const seconds = t / 1000;
    const x = 50 + Math.sin(seconds * 0.28) * 22;
    const y = 50 + Math.sin(seconds * 0.19 + 1.3) * 18;
    return { x, y };
  }

  function tick(t) {
    if (performance.now() - lastInputAt > IDLE_AFTER_MS) {
      const idle = idlePoint(t);
      targetX = idle.x;
      targetY = idle.y;
    }

    currentX += (targetX - currentX) * 0.06;
    currentY += (targetY - currentY) * 0.06;

    mark.style.setProperty('--mx', `${currentX}%`);
    mark.style.setProperty('--my', `${currentY}%`);

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
});
