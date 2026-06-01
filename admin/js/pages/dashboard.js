import { api } from '../api.js';

export async function renderDashboard(container) {
  const tpl = document.getElementById('tpl-dashboard').content.cloneNode(true);
  container.innerHTML = '';
  container.appendChild(tpl);

  try {
    const [artigos, projetos, vagas] = await Promise.all([
      api.getArtigos(),
      api.getProjetos(),
      api.getVagas()
    ]);

    document.getElementById('stat-artigos').textContent = artigos.length;
    document.getElementById('stat-projetos').textContent = projetos.length;
    document.getElementById('stat-vagas').textContent = vagas.length;
  } catch (error) {
    console.error('Failed to load dashboard stats', error);
  }
}
