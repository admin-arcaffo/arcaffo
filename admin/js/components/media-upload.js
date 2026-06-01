import { upload } from '@vercel/blob/client';
import { getToken } from '../auth.js';

export function createUploader(containerId, initialImage, onUploadSuccess) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const html = `
    <div class="media-upload-wrapper" style="border: 2px dashed var(--border-color); padding: 2rem; text-align: center; border-radius: 8px; cursor: pointer; position: relative;">
      <input type="file" style="position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; z-index: 2;" accept="image/*,video/mp4" />
      <div class="preview-area" style="position: relative; z-index: 1;">
        ${initialImage ? `<img src="${initialImage}" style="max-height: 200px; max-width: 100%; border-radius: 8px;" />` : `<div style="color: var(--text-muted);">Clique ou arraste uma imagem aqui</div>`}
      </div>
      <div class="progress-bar hidden" style="position: absolute; bottom: 0; left: 0; height: 4px; background: var(--accent); width: 0%; transition: width 0.2s;"></div>
    </div>
  `;
  container.innerHTML = html;

  const input = container.querySelector('input');
  const previewArea = container.querySelector('.preview-area');
  const progressBar = container.querySelector('.progress-bar');
  const token = getToken();

  input.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show optimistic preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        previewArea.innerHTML = `<img src="${e.target.result}" style="max-height: 200px; max-width: 100%; border-radius: 8px; opacity: 0.5;" />`;
      };
      reader.readAsDataURL(file);
    } else {
      previewArea.innerHTML = `<div style="color: var(--text-muted);">Fazendo upload de vídeo...</div>`;
    }

    progressBar.classList.remove('hidden');
    progressBar.style.width = '10%';

    try {
      const newBlob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
        clientPayload: token // Pass token to authorize upload
      });

      progressBar.style.width = '100%';
      
      if (file.type.startsWith('image/')) {
        previewArea.innerHTML = `<img src="${newBlob.url}" style="max-height: 200px; max-width: 100%; border-radius: 8px;" />`;
      } else {
        previewArea.innerHTML = `<div style="color: var(--text-muted);">Vídeo carregado: ${newBlob.url}</div>`;
      }

      if (onUploadSuccess) onUploadSuccess(newBlob.url, file.type);
    } catch (error) {
      console.error('Upload failed:', error);
      window.showToast('Erro no upload: ' + error.message, 'error');
      progressBar.classList.add('hidden');
      previewArea.innerHTML = `<div style="color: var(--danger);">Falha no upload</div>`;
    } finally {
      setTimeout(() => progressBar.classList.add('hidden'), 1000);
    }
  });
}
