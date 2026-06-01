import { logout } from '../auth.js';
import { api } from '../api.js';

export function initSidebar() {
  document.getElementById('logout-btn').addEventListener('click', logout);
  
  const publishBtn = document.getElementById('publish-site-btn');
  publishBtn.addEventListener('click', async () => {
    if (!confirm('Deseja publicar as alterações para o site live? Isso levará cerca de 1 minuto.')) return;
    
    publishBtn.disabled = true;
    const originalText = publishBtn.textContent;
    publishBtn.textContent = 'Publicando...';
    
    try {
      await api.publishSite();
      window.showToast('Rebuild iniciado! O site estará atualizado em ~1 minuto.', 'success');
    } catch (err) {
      window.showToast('Erro ao publicar: ' + err.message, 'error');
    } finally {
      setTimeout(() => {
        publishBtn.disabled = false;
        publishBtn.textContent = originalText;
      }, 3000);
    }
  });
}
