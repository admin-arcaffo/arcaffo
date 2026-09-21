const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

export function projectPicture(src, alt, { loading = 'lazy', style = '' } = {}) {
  const safeSrc = String(src || '');
  const match = safeSrc.match(/^(\/images\/projetos\/.+)\.(?:avif|jpe?g|png|webp)$/i);
  const attrs = `alt="${esc(alt)}" loading="${esc(loading)}" width="960" height="640"${style ? ` style="${esc(style)}"` : ''}`;
  if (!match) return `<img src="${esc(safeSrc)}" ${attrs}>`;
  const base = match[1];
  return `<picture><source media="(max-width: 760px)" srcset="${esc(base)}-480.webp"><source srcset="${esc(base)}-480.webp 480w, ${esc(base)}-960.webp 960w" sizes="(max-width: 760px) calc(100vw - 44px), 50vw"><img src="${esc(base)}-960.webp" ${attrs}></picture>`;
}
