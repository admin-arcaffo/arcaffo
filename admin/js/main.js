import { initAuth, checkAuth } from './auth.js';
import { initRouter } from './router.js';
import { initSidebar } from './components/sidebar.js';

document.addEventListener('DOMContentLoaded', () => {
  // Global toast function
  window.showToast = (msg, type = 'success') => {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'slideIn 0.3s reverse forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  initAuth();
  
  if (checkAuth()) {
    document.getElementById('login-view').classList.add('hidden');
    document.getElementById('app-layout').classList.remove('hidden');
    initSidebar();
    initRouter();
  } else {
    document.getElementById('login-view').classList.remove('hidden');
    document.getElementById('app-layout').classList.add('hidden');
  }
});
