export async function fetchProjetos() {
  try {
    const response = await fetch('/data/projetos.json?v=' + Date.now());
    if (!response.ok) throw new Error('Falha ao carregar projetos');
    const data = await response.json();
    return data.filter(p => p.status !== 'draft');
  } catch (error) {
    console.error('Erro:', error);
    return [];
  }
}

export async function carregarProjetosDestaque(containerId, limit = 4) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const projetos = await fetchProjetos();
  const destaque = projetos.slice(0, limit);

  container.innerHTML = destaque.map(projeto => {
    // Usar a primeira imagem do projeto ou cover
    let imgUrl = projeto.cover || '';
    if (!imgUrl && projeto.images && projeto.images.length > 0) {
      imgUrl = projeto.images[0].url;
    }
    // Fallback image
    if (!imgUrl) imgUrl = 'https://via.placeholder.com/800x450/111115/C8A96E?text=' + encodeURIComponent(projeto.title);

    const tagPrincipal = projeto.tags && projeto.tags.length > 0 ? projeto.tags[0] : 'Branding';

    return `
      <a href="/projeto.html?id=${projeto.slug}" class="project-card delay-100">
        <img src="${imgUrl}" alt="${projeto.title}" loading="lazy" />
        <div class="project-overlay">
          <h3 class="project-title">${projeto.title}</h3>
          <span class="project-tags">${tagPrincipal}</span>
        </div>
      </a>
    `;
  }).join('');
}
