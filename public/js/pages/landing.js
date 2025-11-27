import { navigateTo } from '../router.js';

export function renderLandingPage() {
  const app = document.querySelector('#app');
  app.innerHTML = `
    <div class="landing-container">
      <div class="animated-bg">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
        <div class="grid"></div>
      </div>
      
      <div class="landing-content">
        <h1 class="landing-title">Vidana Bootcamp Hub</h1>
        <p class="landing-subtitle">Master Modern Tech Skills</p>
        <p class="landing-description">
          Join our comprehensive bootcamp and learn N8N, Vibe Coding, Prompt Engineering, and AI Development Tools.
        </p>
        <div class="landing-cta">
          <button class="btn-primary" id="btn-get-started">
            Get Started
          </button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-get-started').addEventListener('click', () => navigateTo('/login'));
}
