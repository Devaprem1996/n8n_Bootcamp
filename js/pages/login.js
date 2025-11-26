import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '../services/supabase.js';
import { navigateTo } from '../router.js';

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
          <input type="email" id="email" placeholder="your@email.com" 
                 style="width: 100%; padding: 12px 16px; margin-bottom: 12px; background: rgba(100, 116, 139, 0.1); border: 1px solid rgba(148, 163, 184, 0.3); color: #e4e9f1; border-radius: 8px; font-size: 14px;">
          <input type="password" id="password" placeholder="Password" 
                 style="width: 100%; padding: 12px 16px; margin-bottom: 16px; background: rgba(100, 116, 139, 0.1); border: 1px solid rgba(148, 163, 184, 0.3); color: #e4e9f1; border-radius: 8px; font-size: 14px;">
          <button id="btn-email-login"
                  style="width: 100%; padding: 12px 16px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; margin-bottom: 10px; font-size: 14px; transition: all 0.3s;">
            Login
          </button>
          <button id="btn-email-signup"
                  style="width: 100%; padding: 12px 16px; background: rgba(34, 197, 94, 0.15); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 14px; transition: all 0.3s;">
            Create Account
          </button>
        </div>
      </div>
    </div>
  `;

    document.getElementById('btn-google-login').addEventListener('click', async () => {
        await signInWithGoogle();
    });

    document.getElementById('btn-email-login').addEventListener('click', async () => {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const result = await signInWithEmail(email, password);
        if (result.success) navigateTo('/dashboard');
        else alert(result.error);
    });

    document.getElementById('btn-email-signup').addEventListener('click', async () => {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const result = await signUpWithEmail(email, password);
        if (result.success) alert('Check your email for confirmation!');
        else alert(result.error);
    });
}
