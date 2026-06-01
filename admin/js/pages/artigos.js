import { api } from '../api.js';
import { createUploader } from '../components/media-upload.js';
import { initRichEditor } from '../components/rich-editor.js';

export async function renderArtigos(container) {
  container.innerHTML = `
    <div class="header-actions">
      <h2>Artigos</h2>
      <a href="#/artigos/novo" class="btn btn-primary">+ Novo Artigo</a>
    </div>
    <div class="panel">
      <table class="data-table">
        <thead>
          <tr>
            <th>Capa</th>
            <th>Título</th>
            <th>Data</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody id="artigos-list">
          <tr><td colspan="5" class="text-center">Carregando...</td></tr>
        </tbody>
      </table>
    </div>
  `;

  try {
    const artigos = await api.getArtigos();
    const tbody = container.querySelector('#artigos-list');
    
    if (artigos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center">Nenhum artigo encontrado.</td></tr>';
      return;
    }

    tbody.innerHTML = artigos.map(a => `
      <tr>
        <td>
          <img src="${a.cover || '/images/placeholders/thumb-1.jpg'}" alt="" style="width: 48px; height: 48px; object-fit: cover; border-radius: 6px;">
        </td>
        <td>
          <div style="font-weight: 500;">${a.title}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">${a.slug}</div>
        </td>
        <td>${a.date}</td>
        <td><span class="badge ${a.status === 'draft' ? 'draft' : 'published'}">${a.status === 'draft' ? 'Rascunho' : 'Publicado'}</span></td>
        <td class="actions-cell">
          <a href="#/artigos/editar/${a.slug}" class="btn btn-outline">Editar</a>
          <button class="btn btn-danger btn-delete" data-slug="${a.slug}">Excluir</button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        if (!confirm('Tem certeza que deseja excluir este artigo?')) return;
        const slug = e.target.dataset.slug;
        try {
          await api.deleteArtigo(slug);
          window.showToast('Artigo excluído com sucesso');
          renderArtigos(container); // reload
        } catch (err) {
          window.showToast('Erro ao excluir: ' + err.message, 'error');
        }
      });
    });
  } catch (error) {
    container.querySelector('#artigos-list').innerHTML = `<tr><td colspan="5" class="text-danger">Erro ao carregar artigos: ${error.message}</td></tr>`;
  }
}

export async function renderEditorArtigo(container, params) {
  const isEditing = !!(params && params.slug);
  let artigo = {
    title: '', slug: '', date: new Date().toISOString().split('T')[0],
    content: '', cover: '', status: 'published',
    author: { name: '', role: '', photo: '' },
    seo: { metaDescription: '', keywords: [] }
  };

  container.innerHTML = `
    <div class="header-actions">
      <h2>${isEditing ? 'Editar Artigo' : 'Novo Artigo'}</h2>
      <div>
        <a href="#/artigos" class="btn btn-outline">Cancelar</a>
        <button id="btn-save" class="btn btn-primary">Salvar</button>
      </div>
    </div>
    
    <div class="editor-grid">
      <div class="editor-main">
        <div class="panel">
          <div class="form-group">
            <label>Título do Artigo</label>
            <input type="text" id="f-title" value="${artigo.title}" placeholder="Ex: A importância do Branding...">
          </div>
          <div class="form-group">
            <label>Slug (URL) - Gerado automaticamente</label>
            <input type="text" id="f-slug" value="${artigo.slug}">
          </div>
          
          <div class="form-group">
            <label>Conteúdo</label>
            <div id="editor-container"></div>
          </div>
        </div>
        
        <div class="panel">
          <h3>SEO</h3>
          <hr style="border:0; border-top:1px solid var(--border-color); margin:1rem 0;">
          <div class="form-group">
            <label>Meta Description (Max 160 char)</label>
            <textarea id="f-seo-desc" rows="3">${artigo.seo.metaDescription}</textarea>
          </div>
          <div class="form-group">
            <label>Keywords (separadas por vírgula)</label>
            <input type="text" id="f-seo-keys" value="${artigo.seo.keywords.join(', ')}">
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
              <option value="published" ${artigo.status === 'published' ? 'selected' : ''}>Publicado</option>
              <option value="draft" ${artigo.status === 'draft' ? 'selected' : ''}>Rascunho</option>
            </select>
          </div>
          <div class="form-group">
            <label>Data de Publicação</label>
            <input type="date" id="f-date" value="${artigo.date}">
          </div>
        </div>
        
        <div class="panel">
          <h3>Imagem de Capa</h3>
          <hr style="border:0; border-top:1px solid var(--border-color); margin:1rem 0;">
          <div id="cover-uploader"></div>
        </div>
        
        <div class="panel">
          <h3>Autor</h3>
          <hr style="border:0; border-top:1px solid var(--border-color); margin:1rem 0;">
          <div class="form-group">
            <label>Nome do Autor</label>
            <input type="text" id="f-author-name" value="${artigo.author.name}">
          </div>
          <div class="form-group">
            <label>Cargo / Bio</label>
            <input type="text" id="f-author-role" value="${artigo.author.role}">
          </div>
          <div class="form-group">
            <label>Foto (URL)</label>
            <input type="text" id="f-author-photo" value="${artigo.author.photo}" placeholder="/images/lideranca/... .webp">
          </div>
        </div>
      </div>
    </div>
  `;

  if (isEditing) {
    try {
      artigo = await api.getArtigo(params.slug);
      document.getElementById('f-title').value = artigo.title;
      document.getElementById('f-slug').value = artigo.slug;
      document.getElementById('f-date').value = artigo.date;
      document.getElementById('f-status').value = artigo.status || 'published';
      document.getElementById('f-seo-desc').value = artigo.seo?.metaDescription || '';
      document.getElementById('f-seo-keys').value = (artigo.seo?.keywords || []).join(', ');
      
      if (artigo.author) {
        document.getElementById('f-author-name').value = artigo.author.name || '';
        document.getElementById('f-author-role').value = artigo.author.role || '';
        document.getElementById('f-author-photo').value = artigo.author.photo || '';
      }
    } catch (err) {
      window.showToast('Erro ao carregar artigo', 'error');
      return;
    }
  }

  // Initialize Uploader
  let currentCover = artigo.cover;
  createUploader('cover-uploader', currentCover, (url) => {
    currentCover = url;
  });

  // Initialize Rich Editor
  const richEditor = initRichEditor('editor-container', artigo.content);

  // Auto slug generation
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

  // Save handling
  document.getElementById('btn-save').addEventListener('click', async () => {
    const dataToSave = {
      title: document.getElementById('f-title').value,
      slug: document.getElementById('f-slug').value,
      date: document.getElementById('f-date').value,
      status: document.getElementById('f-status').value,
      content: richEditor.getContent(),
      cover: currentCover,
      seo: {
        metaDescription: document.getElementById('f-seo-desc').value,
        keywords: document.getElementById('f-seo-keys').value.split(',').map(k => k.trim()).filter(Boolean)
      },
      author: {
        name: document.getElementById('f-author-name').value,
        role: document.getElementById('f-author-role').value,
        photo: document.getElementById('f-author-photo').value
      }
    };

    if (!dataToSave.title || !dataToSave.slug) {
      return window.showToast('Título e Slug são obrigatórios', 'error');
    }

    try {
      const btn = document.getElementById('btn-save');
      btn.disabled = true;
      btn.textContent = 'Salvando...';

      if (isEditing) {
        await api.updateArtigo(params.slug, dataToSave);
      } else {
        await api.createArtigo(dataToSave);
      }

      window.showToast('Artigo salvo com sucesso!');
      window.location.hash = '#/artigos';
    } catch (err) {
      window.showToast('Erro ao salvar: ' + err.message, 'error');
      document.getElementById('btn-save').disabled = false;
      document.getElementById('btn-save').textContent = 'Salvar';
    }
  });
}
