import { checkAuth } from './auth.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderArtigos, renderEditorArtigo } from './pages/artigos.js';
import { renderProjetos, renderEditorProjeto } from './pages/projetos.js';
import { renderVagas, renderEditorVaga } from './pages/vagas.js';

const routes = {
  '/': { title: 'Dashboard', render: renderDashboard, nav: 'dashboard' },
  '/artigos': { title: 'Artigos', render: renderArtigos, nav: 'artigos' },
  '/artigos/novo': { title: 'Novo Artigo', render: (c, p) => renderEditorArtigo(c, p), nav: 'artigos' },
  '/artigos/editar/:slug': { title: 'Editar Artigo', render: renderEditorArtigo, nav: 'artigos' },
  '/projetos': { title: 'Projetos', render: renderProjetos, nav: 'projetos' },
  '/projetos/novo': { title: 'Novo Projeto', render: (c, p) => renderEditorProjeto(c, p), nav: 'projetos' },
  '/projetos/editar/:slug': { title: 'Editar Projeto', render: renderEditorProjeto, nav: 'projetos' },
  '/vagas': { title: 'Vagas', render: renderVagas, nav: 'vagas' },
  '/vagas/novo': { title: 'Nova Vaga', render: (c, p) => renderEditorVaga(c, p), nav: 'vagas' },
  '/vagas/editar/:slug': { title: 'Editar Vaga', render: renderEditorVaga, nav: 'vagas' },
};

function matchRoute(hash) {
  const path = hash.replace(/^#/, '') || '/';
  
  // Exact match
  if (routes[path]) {
    return { route: routes[path], params: {} };
  }

  // Parameter match
  for (const [routePath, routeConfig] of Object.entries(routes)) {
    if (routePath.includes('/:')) {
      const routeRegex = new RegExp('^' + routePath.replace(/:[a-zA-Z]+/g, '([^/]+)') + '$');
      const match = path.match(routeRegex);
      if (match) {
        // Extract params (currently assuming only one param :slug)
        const params = { slug: match[1] };
        return { route: routeConfig, params };
      }
    }
  }

  // Fallback
  return { route: routes['/'], params: {} };
}

function updateNavActive(navId) {
  document.querySelectorAll('.sidebar-nav .nav-item').forEach(el => {
    el.classList.remove('active');
    if (el.dataset.route === navId) {
      el.classList.add('active');
    }
  });
}

export function initRouter() {
  const handleRouteChange = async () => {
    if (!checkAuth()) return;

    const { route, params } = matchRoute(window.location.hash);
    
    document.getElementById('page-title').textContent = route.title;
    updateNavActive(route.nav);
    
    const routerView = document.getElementById('router-view');
    routerView.innerHTML = '<div class="skeleton-loader" style="height:200px; border-radius:12px; margin-bottom:20px;"></div>'.repeat(3);
    
    try {
      await route.render(routerView, params);
    } catch (err) {
      console.error('Route render error:', err);
      routerView.innerHTML = `<div class="panel text-center text-accent">Erro ao carregar a página: ${err.message}</div>`;
    }
  };

  window.addEventListener('hashchange', handleRouteChange);
  
  // Trigger initial route
  handleRouteChange();
}
