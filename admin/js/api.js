import { getToken, logout } from './auth.js';

async function fetchApi(endpoint, options = {}) {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  };

  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers
  });

  if (response.status === 401) {
    logout();
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error((data && data.error) || 'Ocorreu um erro no servidor');
  }

  return data;
}

export const api = {
  // Articles
  getArtigos: () => fetchApi('/artigos'),
  getArtigo: (slug) => fetchApi(`/artigos/${slug}`),
  createArtigo: (data) => fetchApi('/artigos', { method: 'POST', body: JSON.stringify(data) }),
  updateArtigo: (slug, data) => fetchApi(`/artigos/${slug}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteArtigo: (slug) => fetchApi(`/artigos/${slug}`, { method: 'DELETE' }),

  // Projects
  getProjetos: () => fetchApi('/projetos'),
  getProjeto: (slug) => fetchApi(`/projetos/${slug}`),
  createProjeto: (data) => fetchApi('/projetos', { method: 'POST', body: JSON.stringify(data) }),
  updateProjeto: (slug, data) => fetchApi(`/projetos/${slug}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProjeto: (slug) => fetchApi(`/projetos/${slug}`, { method: 'DELETE' }),

  // Jobs
  getVagas: () => fetchApi('/vagas'),
  getVaga: (slug) => fetchApi(`/vagas/${slug}`),
  createVaga: (data) => fetchApi('/vagas', { method: 'POST', body: JSON.stringify(data) }),
  updateVaga: (slug, data) => fetchApi(`/vagas/${slug}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteVaga: (slug) => fetchApi(`/vagas/${slug}`, { method: 'DELETE' }),

  // Publish
  publishSite: () => fetchApi('/publish', { method: 'POST' }),
  
  // Upload (handled directly in media-upload component using @vercel/blob client)
};
