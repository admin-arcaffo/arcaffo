import { api } from '../api.js';
import { initRichEditor } from '../components/rich-editor.js';

export async function renderVagas(container) {
  container.innerHTML = `
    <div class="header-actions">
      <h2>Vagas</h2>
      <a href="#/vagas/novo" class="btn btn-primary">+ Nova Vaga</a>
    </div>
    <div class="panel">
      <table class="data-table">
        <thead>
          <tr>
            <th>Título</th>
            <th>Local</th>
            <th>Tipo</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody id="vagas-list">
          <tr><td colspan="5" class="text-center">Carregando...</td></tr>
        </tbody>
      </table>
    </div>
  `;

  try {
    const vagas = await api.getVagas();
    const tbody = container.querySelector('#vagas-list');
    
    if (vagas.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center">Nenhuma vaga encontrada.</td></tr>';
      return;
    }

    tbody.innerHTML = vagas.map(v => `
      <tr>
        <td>
          <div style="font-weight: 500;">${v.title}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">${v.slug}</div>
        </td>
        <td>${v.location || 'Remoto'}</td>
        <td>${v.type || 'Tempo Integral'}</td>
        <td><span class="badge ${v.status === 'draft' ? 'draft' : 'published'}">${v.status === 'draft' ? 'Rascunho' : 'Aberta'}</span></td>
        <td class="actions-cell">
          <a href="#/vagas/editar/${v.slug}" class="btn btn-outline">Editar</a>
          <button class="btn btn-danger btn-delete" data-slug="${v.slug}">Excluir</button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        if (!confirm('Tem certeza que deseja excluir esta vaga?')) return;
        const slug = e.target.dataset.slug;
        try {
          await api.deleteVaga(slug);
          window.showToast('Vaga excluída com sucesso');
          renderVagas(container); // reload
        } catch (err) {
          window.showToast('Erro ao excluir: ' + err.message, 'error');
        }
      });
    });
  } catch (error) {
    container.querySelector('#vagas-list').innerHTML = `<tr><td colspan="5" class="text-danger">Erro ao carregar vagas: ${error.message}</td></tr>`;
  }
}

export async function renderEditorVaga(container, params) {
  const isEditing = !!(params && params.slug);
  let vaga = {
    title: '', slug: '', location: '', type: 'Tempo Integral', 
    status: 'published', description: '', requirements: '', benefits: ''
  };

  container.innerHTML = `
    <div class="header-actions">
      <h2>${isEditing ? 'Editar Vaga' : 'Nova Vaga'}</h2>
      <div>
        <a href="#/vagas" class="btn btn-outline">Cancelar</a>
        <button id="btn-save" class="btn btn-primary">Salvar</button>
      </div>
    </div>
    
    <div class="editor-grid">
      <div class="editor-main">
        <div class="panel">
          <div class="form-group">
            <label>Título da Vaga</label>
            <input type="text" id="f-title" value="${vaga.title}">
          </div>
          <div class="form-group">
            <label>Slug (URL) - Gerado automaticamente</label>
            <input type="text" id="f-slug" value="${vaga.slug}">
          </div>
          
          <div class="form-group">
            <label>Descrição (Rich Text)</label>
            <div id="editor-desc"></div>
          </div>
        </div>
      </div>
      
      <div class="editor-sidebar">
        <div class="panel">
          <h3>Configurações</h3>
          <hr style="border:0; border-top:1px solid var(--border-color); margin:1rem 0;">
          <div class="form-group">
            <label>Status</label>
            <select id="f-status">
              <option value="published" ${vaga.status === 'published' ? 'selected' : ''}>Aberta (Publicada)</option>
              <option value="draft" ${vaga.status === 'draft' ? 'selected' : ''}>Fechada (Rascunho)</option>
            </select>
          </div>
          <div class="form-group">
            <label>Localização</label>
            <input type="text" id="f-location" value="${vaga.location || ''}" placeholder="Ex: São Paulo, SP ou Remoto">
          </div>
          <div class="form-group">
            <label>Tipo</label>
            <select id="f-type">
              <option value="Tempo Integral" ${vaga.type === 'Tempo Integral' ? 'selected' : ''}>Tempo Integral</option>
              <option value="Meio Período" ${vaga.type === 'Meio Período' ? 'selected' : ''}>Meio Período</option>
              <option value="Estágio" ${vaga.type === 'Estágio' ? 'selected' : ''}>Estágio</option>
              <option value="Freelance" ${vaga.type === 'Freelance' ? 'selected' : ''}>Freelance</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  `;

  if (isEditing) {
    try {
      vaga = await api.getVaga(params.slug);
      document.getElementById('f-title').value = vaga.title;
      document.getElementById('f-slug').value = vaga.slug;
      document.getElementById('f-location').value = vaga.location || '';
      document.getElementById('f-type').value = vaga.type || 'Tempo Integral';
      document.getElementById('f-status').value = vaga.status || 'published';
    } catch (err) {
      window.showToast('Erro ao carregar vaga', 'error');
      return;
    }
  }

  // Rich Editor
  const richEditorDesc = initRichEditor('editor-desc', vaga.description);

  // Auto slug
  const titleInput = document.getElementById('f-title');
  const slugInput = document.getElementById('f-slug');
  titleInput.addEventListener('input', () => {
    if (!isEditing && titleInput.value) {
      slugInput.value = titleInput.value
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
    }
  });

  // Save
  document.getElementById('btn-save').addEventListener('click', async () => {
    const dataToSave = {
      title: document.getElementById('f-title').value,
      slug: document.getElementById('f-slug').value,
      status: document.getElementById('f-status').value,
      location: document.getElementById('f-location').value,
      type: document.getElementById('f-type').value,
      description: richEditorDesc.getContent()
    };

    if (!dataToSave.title || !dataToSave.slug) {
      return window.showToast('Título e Slug são obrigatórios', 'error');
    }

    try {
      const btn = document.getElementById('btn-save');
      btn.disabled = true;
      btn.textContent = 'Salvando...';

      if (isEditing) {
        await api.updateVaga(params.slug, dataToSave);
      } else {
        await api.createVaga(dataToSave);
      }

      window.showToast('Vaga salva com sucesso!');
      window.location.hash = '#/vagas';
    } catch (err) {
      window.showToast('Erro ao salvar: ' + err.message, 'error');
      document.getElementById('btn-save').disabled = false;
      document.getElementById('btn-save').textContent = 'Salvar';
    }
  });
}
