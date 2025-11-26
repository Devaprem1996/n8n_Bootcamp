import { getCurrentUser, getProgress, setProgress } from '../state.js';
import { saveProgress, loadProgress } from '../services/supabase.js';
import { navigateTo } from '../router.js';
import { N8N_CURRICULUM } from '../data/n8n.js';
import { VIBE_CODING_CURRICULUM } from '../data/vibe-coding.js';
import { PROMPT_ENG_CURRICULUM } from '../data/prompt-engineering.js';
import { AI_TOOLS_CURRICULUM } from '../data/ai-developments-tools.js';

const CURRICULA = {
  'n8n': N8N_CURRICULUM,
  'vibe-coding': VIBE_CODING_CURRICULUM,
  'prompt-engineering': PROMPT_ENG_CURRICULUM,
  'ai-developments-tools': AI_TOOLS_CURRICULUM
};

export async function renderDashboard(category) {
  const user = getCurrentUser();
  const curriculum = CURRICULA[category];

  // Load progress if not already loaded
  let progress = getProgress(category);
  if (!progress.isLoaded) {
    const result = await loadProgress(user.id, category);
    if (result.success && result.data) {
      setProgress(category, { ...result.data, isLoaded: true });
      progress = getProgress(category);
    }
  }

  const completedCount = progress.completedTasks.filter(t => t).length;
  const totalDays = curriculum.days.length;
  const progressPercent = Math.round((completedCount / totalDays) * 100);

  const app = document.querySelector('#app');
  app.innerHTML = `
    <div class="app-container">
      <div class="app-header">
        <div class="header-content">
          <h1>${curriculum.title}</h1>
          <p>Welcome, ${user.email} • ${completedCount}/${totalDays} Days Complete</p>
        </div>
        <div class="header-actions">
          ${user.role === 'admin' ? '<button class="btn-secondary" id="btn-admin">Admin Dashboard</button>' : ''}
          <button class="btn-logout" id="btn-logout">Logout</button>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="tabs-nav">
        <button class="tab-btn ${category === 'n8n' ? 'active' : ''}" onclick="window.location.hash='#/n8n'">N8N</button>
        <button class="tab-btn ${category === 'vibe-coding' ? 'active' : ''}" onclick="window.location.hash='#/vibe-coding'">Vibe Coding</button>
        <button class="tab-btn ${category === 'prompt-engineering' ? 'active' : ''}" onclick="window.location.hash='#/prompt-engineering'">Prompt Eng</button>
        <button class="tab-btn ${category === 'ai-developments-tools' ? 'active' : ''}" onclick="window.location.hash='#/ai-developments-tools'">AI Tools</button>
      </div>

      <div class="progress-section">
        <div class="progress-card">
          <h2>📊 Overall Progress</h2>
          <div class="progress-bar-container">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${progressPercent}%"></div>
            </div>
            <div class="progress-text">${progressPercent}%</div>
          </div>
        </div>
      </div>

      <div class="learning-grid">
        ${curriculum.days.map((item, index) => `
          <div class="day-card ${progress.completedTasks[index] ? 'completed' : ''}">
            <div class="day-number">Day ${item.day}</div>
            <h3>${item.title}</h3>
            <div class="day-info">
              <span class="duration">⏱️ ${item.duration}</span>
              <span class="difficulty-badge">Level ${item.difficulty}</span>
            </div>
            <div class="checkbox-container">
              <input type="checkbox" id="task-${index}" ${progress.completedTasks[index] ? 'checked' : ''}>
              <label for="task-${index}">Mark as complete</label>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // Event Listeners
  document.getElementById('btn-logout')?.addEventListener('click', () => {
    import('../services/supabase.js').then(m => m.signOut().then(() => navigateTo('/')));
  });

  document.getElementById('btn-admin')?.addEventListener('click', () => navigateTo('/admin'));

  // Tab navigation
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Extract path from onclick or just use the text content mapped to route
      // For simplicity, let's just use the router navigateTo
      // But wait, the HTML onclicks above are using hash which is not what we want with our router.
      // Let's fix the HTML generation above to not use onclick attributes but data attributes.
    });
  });

  // Re-attach tab listeners properly
  const tabs = document.querySelectorAll('.tab-btn');
  tabs[0].onclick = () => navigateTo('/n8n');
  tabs[1].onclick = () => navigateTo('/vibe-coding');
  tabs[2].onclick = () => navigateTo('/prompt-engineering');
  tabs[3].onclick = () => navigateTo('/ai-developments-tools');

  // Checkbox listeners
  curriculum.days.forEach((_, index) => {
    const checkbox = document.getElementById(`task-${index}`);
    checkbox.addEventListener('change', async (e) => {
      const newCompleted = [...progress.completedTasks];
      newCompleted[index] = e.target.checked;

      const newProgress = {
        ...progress,
        completedTasks: newCompleted,
        progressPercent: Math.round((newCompleted.filter(t => t).length / totalDays) * 100)
      };

      setProgress(category, newProgress);
      await saveProgress(user.id, category, { ...newProgress, email: user.email });
      renderDashboard(category); // Re-render to update progress bar
    });
  });
}
