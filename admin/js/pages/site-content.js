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
        ],
      },
      {
        title: 'Botões do Hero',
        description: 'Edite o texto exibido e para onde cada botão leva.',
        fields: [
          {
            type: 'button-link',
            label: 'Botão principal',
            labelKey: 'hero_cta_primary_label',
            hrefKey: 'hero_cta_primary_href',
            defaultHref: '#ecossistema',
          },
          {
            type: 'button-link',
            label: 'Botão secundário',
            labelKey: 'hero_cta_secondary_label',
            hrefKey: 'hero_cta_secondary_href',
            defaultHref: '/projetos.html',
          },
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
          {
            type: 'button-link',
            label: 'Botão',
            labelKey: 'prefooter_cta_label',
            hrefKey: 'prefooter_cta_href',
            defaultHref: '/contato.html',
          },
        ],
      },
    ],
  },
};

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  })[character]);
}

function inputFieldHtml(namespace, field) {
  const id = `f-${namespace}-${field.key}`;
  if (field.type === 'textarea') {
    return `
      <div class="form-group">
        <label for="${id}">${field.label}</label>
        <textarea id="${id}" rows="3"></textarea>
      </div>
    `;
  }

  if (field.type === 'link') {
    const hintId = `${id}-hint`;
    const errorId = `${id}-error`;
    return `
      <div class="form-group">
        <label for="${id}">${field.label}</label>
        <input
          type="text"
          id="${id}"
          inputmode="url"
          autocomplete="url"
          spellcheck="false"
          placeholder="${escapeHtml(field.placeholder || '/pagina.html ou https://site.com')}"
          aria-describedby="${hintId} ${errorId}"
        >
        <small class="form-hint" id="${hintId}">Aceita página interna, âncora, URL completa, e-mail ou telefone.</small>
        <small class="form-error" id="${errorId}" aria-live="polite"></small>
      </div>
    `;
  }

  return `
    <div class="form-group">
      <label for="${id}">${field.label}</label>
      <input type="text" id="${id}">
    </div>
  `;
}

function fieldHtml(namespace, field) {
  if (field.type !== 'button-link') return inputFieldHtml(namespace, field);

  return `
    <fieldset class="button-link-editor">
      <legend>${field.label}</legend>
      <div class="button-link-fields">
        ${inputFieldHtml(namespace, { key: field.labelKey, label: 'Texto do botão', type: 'text' })}
        ${inputFieldHtml(namespace, {
          key: field.hrefKey,
          label: 'Destino do link',
          type: 'link',
          placeholder: field.defaultHref,
        })}
      </div>
    </fieldset>
  `;
}

function getInputFields(field) {
  if (field.type !== 'button-link') return [field];
  return [
    { key: field.labelKey, type: 'text' },
    { key: field.hrefKey, type: 'link', defaultValue: field.defaultHref },
  ];
}

function forEachInputField(page, callback) {
  page.sections.forEach((section) => {
    section.fields.forEach((field) => {
      getInputFields(field).forEach(callback);
    });
  });
}

function validateLink(value) {
  const link = value.trim();
  if (!link) return '';
  if (/^(?:https?:\/\/|mailto:|tel:)/i.test(link)) return '';
  if (link.startsWith('#')) return '';
  if (link.startsWith('/') && !link.startsWith('//')) return '';
  return 'Use um link iniciado por /, #, http://, https://, mailto: ou tel:.';
}

function setLinkError(input, message) {
  const error = document.getElementById(`${input.id}-error`);
  input.setAttribute('aria-invalid', message ? 'true' : 'false');
  if (error) error.textContent = message;
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
      ${section.description ? `<p class="panel-description">${section.description}</p>` : ''}
      <hr style="border:0; border-top:1px solid var(--border-color); margin:1rem 0;">
      ${section.fields.map((field) => fieldHtml(slug, field)).join('')}
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
  forEachInputField(page, (field) => {
    const el = document.getElementById(`f-${slug}-${field.key}`);
    if (el) el.value = namespaceData[field.key] ?? field.defaultValue ?? '';

    if (field.type === 'link' && el) {
      el.addEventListener('input', () => setLinkError(el, ''));
      el.addEventListener('blur', () => setLinkError(el, validateLink(el.value)));
    }
  });

  document.getElementById('btn-save').addEventListener('click', async () => {
    const payload = { [slug]: {} };
    let firstInvalidInput = null;

    forEachInputField(page, (field) => {
      const el = document.getElementById(`f-${slug}-${field.key}`);
      const value = el ? el.value.trim() : '';
      payload[slug][field.key] = value;

      if (field.type === 'link' && el) {
        const error = validateLink(value);
        setLinkError(el, error);
        if (error && !firstInvalidInput) firstInvalidInput = el;
      }
    });

    if (firstInvalidInput) {
      firstInvalidInput.focus();
      window.showToast('Revise o destino do link antes de salvar.', 'error');
      return;
    }

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
