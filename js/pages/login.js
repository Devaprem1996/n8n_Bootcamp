import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '../services/supabase.js';
import { navigateTo } from '../router.js';
import { setCurrentUser } from '../state.js';

export function renderLoginScreen() {
  const app = document.querySelector('#app');
  app.innerHTML = `
    <div class="login-container">
      <div class="login-card">
        <h1>🚀 Welcome Back</h1>
        <p>Continue to Vidana Bootcamp Hub</p>
        
        <button class="btn-google" id="btn-google-login">
          🔐 Sign in with Google
        </button>
        
        <div class="login-info">
          <h3>Or use email & password</h3>
          <form id="login-form">
            <input type="email" id="email" placeholder="your@email.com" required
                   style="width: 100%; padding: 12px 16px; margin-bottom: 12px; background: rgba(100, 116, 139, 0.1); border: 1px solid rgba(148, 163, 184, 0.3); color: #e4e9f1; border-radius: 8px; font-size: 14px;">
            <input type="password" id="password" placeholder="Password" required
                   style="width: 100%; padding: 12px 16px; margin-bottom: 16px; background: rgba(100, 116, 139, 0.1); border: 1px solid rgba(148, 163, 184, 0.3); color: #e4e9f1; border-radius: 8px; font-size: 14px;">
            
            <div id="error-message" style="color: #ef4444; font-size: 14px; margin-bottom: 10px; display: none;"></div>

            <button type="submit" id="btn-email-login"
                    style="width: 100%; padding: 12px 16px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; margin-bottom: 10px; font-size: 14px; transition: all 0.3s;">
              Login
            </button>
            <button type="button" id="btn-email-signup"
                    style="width: 100%; padding: 12px 16px; background: rgba(34, 197, 94, 0.15); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 14px; transition: all 0.3s;">
              Create Account
            </button>
          </form>
        </div>
      </div>
    </div>
  `;

  const showError = (msg) => {
    const el = document.getElementById('error-message');
    el.textContent = msg;
    el.style.display = 'block';
  };

  const setLoading = (isLoading) => {
    const btn = document.getElementById('btn-email-login');
    if (isLoading) {
      btn.textContent = 'Loading...';
      btn.disabled = true;
      btn.style.opacity = '0.7';
    } else {
      btn.textContent = 'Login';
      btn.disabled = false;
      btn.style.opacity = '1';
    }
  };

  document.getElementById('btn-google-login').addEventListener('click', async () => {
    await signInWithGoogle();
  });

  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    setLoading(true);
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const result = await signInWithEmail(email, password);

    if (result.success) {
      setCurrentUser(result.data.user);
      navigateTo('/dashboard');
    } else {
      showError(result.error);
      setLoading(false);
    }
  });

  document.getElementById('btn-email-signup').addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
      showError('Please enter email and password');
      return;
    }

    setLoading(true);
    const result = await signUpWithEmail(email, password);

    if (result.success) {
      if (result.data.user) {
        setCurrentUser(result.data.user);
        navigateTo('/dashboard');
      } else {
        showError('Check your email for confirmation!');
        setLoading(false);
      }
    } else {
      showError(result.error);
      setLoading(false);
    }
  });
}
