import { api } from '../api.js';

const PAGES = {
  home: {
    label: 'Página Inicial',
    sections: [
      {
        title: 'Hero',
        fields: [
          { key: 'hero_title_lead', label: 'Título — primeira parte', type: 'text' },
          { key: 'hero_title_accent', label: 'Título — parte destacada', type: 'text' },
          { key: 'hero_subtitle', label: 'Subtítulo', type: 'textarea' },
          { key: 'hero_cta_primary_label', label: 'Botão principal', type: 'text' },
          { key: 'hero_cta_secondary_label', label: 'Botão secundário', type: 'text' },
        ],
      },
      {
        title: 'Títulos de seção',
        fields: [
          { key: 'philosophy_title', label: 'Título — Nossa Filosofia', type: 'text' },
          { key: 'ecosystem_title', label: 'Título — Nosso Ecossistema', type: 'text' },
          { key: 'projects_title', label: 'Título — Portfólio', type: 'text' },
          { key: 'problem_solution_title', label: 'Título — Problema/Solução', type: 'text' },
        ],
      },
    ],
  },
  global: {
    label: 'Rodapé e CTA (todas as páginas)',
    sections: [
      {
        title: 'Rodapé',
        fields: [
          { key: 'footer_tagline', label: 'Frase do rodapé', type: 'textarea' },
        ],
      },
      {
        title: 'Chamada final (antes do rodapé)',
        fields: [
          { key: 'prefooter_title_lead', label: 'Título — primeira parte', type: 'text' },
          { key: 'prefooter_title_accent', label: 'Título — parte destacada', type: 'text' },
          { key: 'prefooter_body', label: 'Texto', type: 'textarea' },
          { key: 'prefooter_cta_label', label: 'Botão', type: 'text' },
        ],
      },
    ],
  },
};

function fieldHtml(namespace, field, value) {
  const id = `f-${namespace}-${field.key}`;
  const safeValue = (value || '').replace(/</g, '&lt;');
  if (field.type === 'textarea') {
    return `
      <div class="form-group">
        <label for="${id}">${field.label}</label>
        <textarea id="${id}" rows="3">${safeValue}</textarea>
      </div>
    `;
  }
  return `
    <div class="form-group">
      <label for="${id}">${field.label}</label>
      <input type="text" id="${id}" value="${safeValue}">
    </div>
  `;
}

export async function renderSiteContent(container, params) {
  const slug = params && PAGES[params.slug] ? params.slug : 'home';

  const tabs = Object.keys(PAGES).map((key) => `
    <a href="#/conteudo/${key}" class="btn ${key === slug ? 'btn-primary' : 'btn-outline'}">${PAGES[key].label}</a>
  `).join('');

  const page = PAGES[slug];
  const sectionsHtml = page.sections.map((section) => `
    <div class="panel">
      <h3>${section.title}</h3>
      <hr style="border:0; border-top:1px solid var(--border-color); margin:1rem 0;">
      ${section.fields.map((f) => fieldHtml(slug, f, '')).join('')}
    </div>
  `).join('');

  container.innerHTML = `
    <div class="header-actions">
      <h2>Conteúdo do Site</h2>
      <button id="btn-save" class="btn btn-primary">Salvar</button>
    </div>
    <div class="header-actions" style="gap: 0.5rem; margin-bottom: 1.5rem;">
      ${tabs}
    </div>
    <div class="editor-main">
      ${sectionsHtml}
    </div>
  `;

  let siteContent = {};
  try {
    siteContent = await api.getSiteContent();
  } catch (err) {
    window.showToast('Erro ao carregar conteúdo: ' + err.message, 'error');
    return;
  }

  const namespaceData = siteContent[slug] || {};
  page.sections.forEach((section) => {
    section.fields.forEach((field) => {
      const el = document.getElementById(`f-${slug}-${field.key}`);
      if (el) el.value = namespaceData[field.key] || '';
    });
  });

  document.getElementById('btn-save').addEventListener('click', async () => {
    const payload = { [slug]: {} };
    page.sections.forEach((section) => {
      section.fields.forEach((field) => {
        const el = document.getElementById(`f-${slug}-${field.key}`);
        payload[slug][field.key] = el ? el.value : '';
      });
    });

    const btn = document.getElementById('btn-save');
    btn.disabled = true;
    btn.textContent = 'Salvando...';

    try {
      await api.updateSiteContent(payload);
      window.showToast('Conteúdo salvo com sucesso!');
    } catch (err) {
      window.showToast('Erro ao salvar: ' + err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Salvar';
    }
  });
}
