import { upload } from '@vercel/blob/client';
import { getToken } from '../auth.js';

export function initRichEditor(containerId, initialContent = '') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const html = `
    <div class="rich-editor-wrapper" style="border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; background: #FFFFFF; color: #1A1A1A; position: relative;">
      <div class="rich-toolbar" style="background: #F7F7F7; padding: 0.5rem; display: flex; gap: 0.5rem; border-bottom: 1px solid #E0E0E0; flex-wrap: wrap;">
        <button type="button" class="rich-btn" data-command="formatBlock" data-value="H2" title="Título 2" style="color: #333; border: 1px solid #CCC; background: #FFF; padding: 0.2rem 0.5rem; border-radius: 4px;"><b>H2</b></button>
        <button type="button" class="rich-btn" data-command="formatBlock" data-value="H3" title="Título 3" style="color: #333; border: 1px solid #CCC; background: #FFF; padding: 0.2rem 0.5rem; border-radius: 4px;"><b>H3</b></button>
        <div style="width: 1px; background: #E0E0E0; margin: 0 0.5rem;"></div>
        <button type="button" class="rich-btn" data-command="bold" title="Negrito" style="color: #333; border: 1px solid #CCC; background: #FFF; padding: 0.2rem 0.5rem; border-radius: 4px;"><b>B</b></button>
        <button type="button" class="rich-btn" data-command="italic" title="Itálico" style="color: #333; border: 1px solid #CCC; background: #FFF; padding: 0.2rem 0.5rem; border-radius: 4px;"><i>I</i></button>
        <button type="button" class="rich-btn" data-command="strikeThrough" title="Tachado" style="color: #333; border: 1px solid #CCC; background: #FFF; padding: 0.2rem 0.5rem; border-radius: 4px;"><strike>S</strike></button>
        <div style="width: 1px; background: #E0E0E0; margin: 0 0.5rem;"></div>
        <button type="button" class="rich-btn" data-command="insertUnorderedList" title="Lista" style="color: #333; border: 1px solid #CCC; background: #FFF; padding: 0.2rem 0.5rem; border-radius: 4px;">UL</button>
        <button type="button" class="rich-btn" data-command="insertOrderedList" title="Lista Numérica" style="color: #333; border: 1px solid #CCC; background: #FFF; padding: 0.2rem 0.5rem; border-radius: 4px;">OL</button>
        <div style="width: 1px; background: #E0E0E0; margin: 0 0.5rem;"></div>
        <button type="button" class="rich-btn" data-command="createLink" title="Inserir Link" style="color: #333; border: 1px solid #CCC; background: #FFF; padding: 0.2rem 0.5rem; border-radius: 4px;">Link</button>
        <button type="button" class="rich-btn" data-command="insertHorizontalRule" title="Linha" style="color: #333; border: 1px solid #CCC; background: #FFF; padding: 0.2rem 0.5rem; border-radius: 4px;">HR</button>
        <div style="width: 1px; background: #E0E0E0; margin: 0 0.5rem;"></div>
        <button type="button" class="rich-btn" id="btn-insert-image" title="Inserir Imagem" style="color: #333; border: 1px solid #CCC; background: #FFF; padding: 0.2rem 0.5rem; border-radius: 4px;">📷 Imagem</button>
        <button type="button" class="rich-btn" id="btn-insert-video" title="Inserir Vídeo (YouTube/Vimeo)" style="color: #333; border: 1px solid #CCC; background: #FFF; padding: 0.2rem 0.5rem; border-radius: 4px;">🎥 Vídeo</button>
      </div>
      <div id="editor-progress" class="hidden" style="position: absolute; top: 40px; left: 0; height: 4px; background: var(--accent); width: 0%; transition: width 0.2s; z-index: 10;"></div>
      <input type="file" id="editor-file-input" style="display: none" accept="image/*" />
      <div class="rich-content" contenteditable="true" style="padding: 2rem; min-height: 400px; outline: none; line-height: 1.6; font-size: 1.1rem; font-family: 'Inter Tight', sans-serif;">
        ${initialContent}
      </div>
    </div>
  `;
  
  container.innerHTML = html;

  const contentArea = container.querySelector('.rich-content');
  const buttons = container.querySelectorAll('.rich-btn');

  buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const command = btn.dataset.command;
      let value = btn.dataset.value || null;

      if (command === 'createLink') {
        value = prompt('Digite a URL:');
        if (!value) return;
      }

      document.execCommand(command, false, value);
      contentArea.focus();
    });
  });

  // Image Insertion Logic
  const btnInsertImage = container.querySelector('#btn-insert-image');
  const fileInput = container.querySelector('#editor-file-input');
  const progressBar = container.querySelector('#editor-progress');
  
  if (btnInsertImage && fileInput) {
    btnInsertImage.addEventListener('click', (e) => {
      e.preventDefault();
      // Save cursor position by focusing content area then triggering file dialog
      contentArea.focus();
      fileInput.click();
    });

    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const token = getToken();
      progressBar.classList.remove('hidden');
      progressBar.style.width = '20%';

      try {
        // Upload image to Vercel Blob
        const newBlob = await upload(file.name, file, {
          access: 'public',
          handleUploadUrl: '/api/upload',
          clientPayload: token
        });

        progressBar.style.width = '100%';
        
        // Restore focus and insert the image
        contentArea.focus();
        const imgHtml = `<img src="${newBlob.url}" class="article-image" alt="Imagem do artigo" style="max-width: 100%; height: auto; border-radius: 8px; margin: 2rem 0;" />`;
        document.execCommand('insertHTML', false, imgHtml);
        
      } catch (error) {
        console.error('Editor image upload failed:', error);
        window.showToast('Erro no upload: ' + error.message, 'error');
      } finally {
        setTimeout(() => progressBar.classList.add('hidden'), 1000);
        fileInput.value = ''; // Reset input
      }
    });
  }

  // Video Embed Logic
  const btnInsertVideo = container.querySelector('#btn-insert-video');
  if (btnInsertVideo) {
    btnInsertVideo.addEventListener('click', (e) => {
      e.preventDefault();
      contentArea.focus();
      const url = prompt('Digite o link do vídeo (YouTube ou Vimeo):');
      if (!url) return;

      let embedUrl = '';
      if (url.includes('youtube.com/watch?v=')) {
        embedUrl = url.replace('watch?v=', 'embed/').split('&')[0];
      } else if (url.includes('youtu.be/')) {
        embedUrl = url.replace('youtu.be/', 'youtube.com/embed/').split('?')[0];
      } else if (url.includes('vimeo.com/')) {
        embedUrl = url.replace('vimeo.com/', 'player.vimeo.com/video/').split('?')[0];
      } else {
        return window.showToast('Por favor, insira um link válido do YouTube ou Vimeo.', 'error');
      }

      // Responsive 16:9 iframe container
      const iframeHtml = `
        <div class="video-responsive" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; border-radius: 8px; margin: 2rem 0;">
          <iframe src="${embedUrl}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" allowfullscreen></iframe>
        </div><p><br></p>
      `;
      
      document.execCommand('insertHTML', false, iframeHtml);
    });
  }

  return {
    getContent: () => contentArea.innerHTML,
    setContent: (html) => contentArea.innerHTML = html
  };
}
