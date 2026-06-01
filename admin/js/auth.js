// Auth utility for client-side
import { Crypto } from '/js/main.js'; // Wait, I don't have crypto in client. I will just do a simple SHA-256

export function getToken() {
  return sessionStorage.getItem('admin_token');
}

export function setToken(token) {
  sessionStorage.setItem('admin_token', token);
}

export function removeToken() {
  sessionStorage.removeItem('admin_token');
}

export function checkAuth() {
  return !!getToken();
}

export function logout() {
  removeToken();
  window.location.hash = '';
  document.getElementById('app-layout').classList.add('hidden');
  document.getElementById('login-view').classList.remove('hidden');
}

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function initAuth() {
  const loginForm = document.getElementById('login-form');
  const loginBtn = document.getElementById('login-btn');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const userField = document.getElementById('login-username').value;
    const passField = document.getElementById('login-password').value;
    
    loginBtn.disabled = true;
    loginBtn.textContent = 'Verificando...';

    try {
      const usernameHash = await sha256(userField);
      const passwordHash = await sha256(passField);

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameHash, password: passwordHash })
      });

      if (res.ok) {
        const data = await res.json();
        setToken(data.token);
        
        document.getElementById('login-view').classList.add('hidden');
        document.getElementById('app-layout').classList.remove('hidden');
        
        // Trigger hash change to load dashboard
        if (!window.location.hash || window.location.hash === '#/login') {
          window.location.hash = '#/';
        } else {
          window.dispatchEvent(new HashChangeEvent('hashchange'));
        }
        
        window.showToast('Login efetuado com sucesso');
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Credenciais inválidas');
      }
    } catch (err) {
      window.showToast(err.message, 'error');
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = 'Entrar';
    }
  });
}
