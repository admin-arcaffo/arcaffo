import { api } from '../api.js';
import { createUploader } from '../components/media-upload.js';
import { initRichEditor } from '../components/rich-editor.js';

export async function renderProjetos(container) {
  container.innerHTML = `
    <div class="header-actions">
      <h2>Projetos</h2>
      <a href="#/projetos/novo" class="btn btn-primary">+ Novo Projeto</a>
    </div>
    <div class="panel">
      <table class="data-table">
        <thead>
          <tr>
            <th>Capa</th>
            <th>Título</th>
            <th>Tags</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody id="projetos-list">
          <tr><td colspan="5" class="text-center">Carregando...</td></tr>
        </tbody>
      </table>
    </div>
  `;

  try {
    const projetos = await api.getProjetos();
    const tbody = container.querySelector('#projetos-list');
    
    if (projetos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center">Nenhum projeto encontrado.</td></tr>';
      return;
    }

    tbody.innerHTML = projetos.map(p => `
      <tr>
        <td>
          <img src="${p.cover || '/images/placeholders/thumb-1.jpg'}" alt="" style="width: 48px; height: 48px; object-fit: cover; border-radius: 6px;">
        </td>
        <td>
          <div style="font-weight: 500;">${p.title}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">${p.slug}</div>
        </td>
        <td>${(p.tags || []).join(', ')}</td>
        <td><span class="badge ${p.status === 'draft' ? 'draft' : 'published'}">${p.status === 'draft' ? 'Rascunho' : 'Publicado'}</span></td>
        <td class="actions-cell">
          <a href="#/projetos/editar/${p.slug}" class="btn btn-outline">Editar</a>
          <button class="btn btn-danger btn-delete" data-slug="${p.slug}">Excluir</button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        if (!confirm('Tem certeza que deseja excluir este projeto?')) return;
        const slug = e.target.dataset.slug;
        try {
          await api.deleteProjeto(slug);
          window.showToast('Projeto excluído com sucesso');
          renderProjetos(container); // reload
        } catch (err) {
          window.showToast('Erro ao excluir: ' + err.message, 'error');
        }
      });
    });
  } catch (error) {
    container.querySelector('#projetos-list').innerHTML = `<tr><td colspan="5" class="text-danger">Erro ao carregar projetos: ${error.message}</td></tr>`;
  }
}

export async function renderEditorProjeto(container, params) {
  const isEditing = !!(params && params.slug);
  let projeto = {
    title: '', slug: '', description: '', cover: '', 
    status: 'published', tags: [], team: '', media: []
  };

  container.innerHTML = `
    <div class="header-actions">
      <h2>${isEditing ? 'Editar Projeto' : 'Novo Projeto'}</h2>
      <div>
        <a href="#/projetos" class="btn btn-outline">Cancelar</a>
        <button id="btn-save" class="btn btn-primary">Salvar</button>
      </div>
    </div>
    
    <div class="editor-grid">
      <div class="editor-main">
        <div class="panel">
          <div class="form-group">
            <label>Título do Projeto</label>
            <input type="text" id="f-title" value="${projeto.title}">
          </div>
          <div class="form-group">
            <label>Slug (URL) - Gerado automaticamente</label>
            <input type="text" id="f-slug" value="${projeto.slug}">
          </div>
          
          <div class="form-group">
            <label>Descrição (Rich Text)</label>
            <div id="editor-container"></div>
          </div>
        </div>
        
        <div class="panel">
          <div class="header-actions" style="margin-bottom: 1rem;">
            <h3>Galeria de Mídia</h3>
            <button class="btn btn-outline btn-sm" id="btn-add-video">+ Add Vídeo URL</button>
          </div>
          <div id="media-uploader"></div>
          <div class="gallery-grid" id="gallery-grid"></div>
        </div>
      </div>
      
      <div class="editor-sidebar">
        <div class="panel">
          <h3>Configurações</h3>
          <hr style="border:0; border-top:1px solid var(--border-color); margin:1rem 0;">
          <div class="form-group">
            <label>Status</label>
            <select id="f-status">
              <option value="published" ${projeto.status === 'published' ? 'selected' : ''}>Publicado</option>
              <option value="draft" ${projeto.status === 'draft' ? 'selected' : ''}>Rascunho</option>
            </select>
          </div>
          <div class="form-group">
            <label>Tags (separadas por vírgula)</label>
            <input type="text" id="f-tags" value="${projeto.tags.join(', ')}">
          </div>
          <div class="form-group">
            <label>Equipe</label>
            <input type="text" id="f-team" value="${projeto.team}">
          </div>
        </div>
        
        <div class="panel">
          <h3>Imagem de Capa</h3>
          <hr style="border:0; border-top:1px solid var(--border-color); margin:1rem 0;">
          <div id="cover-uploader"></div>
        </div>
      </div>
    </div>
  `;

  if (isEditing) {
    try {
      projeto = await api.getProjeto(params.slug);
      document.getElementById('f-title').value = projeto.title;
      document.getElementById('f-slug').value = projeto.slug;
      document.getElementById('f-tags').value = (projeto.tags || []).join(', ');
      document.getElementById('f-team').value = projeto.team || '';
      document.getElementById('f-status').value = projeto.status || 'published';
    } catch (err) {
      window.showToast('Erro ao carregar projeto', 'error');
      return;
    }
  }

  // Cover Uploader
  let currentCover = projeto.cover;
  createUploader('cover-uploader', currentCover, (url) => {
    currentCover = url;
  });

  // Media Gallery Logic
  let mediaItems = [...(projeto.media || [])];
  
  function renderGallery() {
    const grid = document.getElementById('gallery-grid');
    grid.innerHTML = mediaItems.map((m, index) => {
      let preview = '';
      if (m.type === 'video') {
        preview = `<video src="${m.url}" style="width: 100%; height: 100%; object-fit: cover;" muted></video><div style="position:absolute; bottom:0; background:rgba(0,0,0,0.5); width:100%; text-align:center; font-size:0.7rem; padding:2px;">VÍDEO</div>`;
      } else {
        preview = `<img src="${m.url}">`;
      }
      return `
        <div class="gallery-item" draggable="true" data-index="${index}">
          ${preview}
          <button class="remove-btn" title="Remover" onclick="removeMedia(${index})">×</button>
        </div>
      `;
    }).join('');

    // Make global for inline onclick
    window.removeMedia = (idx) => {
      mediaItems.splice(idx, 1);
      renderGallery();
    };
  }

  createUploader('media-uploader', null, (url, mimeType) => {
    mediaItems.push({
      type: mimeType.startsWith('video') ? 'video' : 'image',
      url: url,
      autoplay: true, controls: false
    });
    renderGallery();
    // Reset uploader visually
    document.querySelector('#media-uploader .preview-area').innerHTML = `<div style="color: var(--text-muted);">Clique ou arraste uma imagem/vídeo aqui</div>`;
  });

  renderGallery();

  // Add video via URL
  document.getElementById('btn-add-video').addEventListener('click', () => {
    const url = prompt('Cole a URL do vídeo (YouTube, Vimeo, ou MP4 direto):');
    if (url) {
      mediaItems.push({ type: 'video', url, autoplay: true, controls: false });
      renderGallery();
    }
  });

  // Rich Editor
  const richEditor = initRichEditor('editor-container', projeto.description);

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
      description: richEditor.getContent(),
      cover: currentCover,
      tags: document.getElementById('f-tags').value.split(',').map(t => t.trim()).filter(Boolean),
      team: document.getElementById('f-team').value,
      media: mediaItems
    };

    if (!dataToSave.title || !dataToSave.slug) {
      return window.showToast('Título e Slug são obrigatórios', 'error');
    }

    try {
      const btn = document.getElementById('btn-save');
      btn.disabled = true;
      btn.textContent = 'Salvando...';

      if (isEditing) {
        await api.updateProjeto(params.slug, dataToSave);
      } else {
        await api.createProjeto(dataToSave);
      }

      window.showToast('Projeto salvo com sucesso!');
      window.location.hash = '#/projetos';
    } catch (err) {
      window.showToast('Erro ao salvar: ' + err.message, 'error');
      document.getElementById('btn-save').disabled = false;
      document.getElementById('btn-save').textContent = 'Salvar';
    }
  });
}
