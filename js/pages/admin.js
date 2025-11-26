import { getAllInternsProgress } from '../services/supabase.js';
import { navigateTo } from '../router.js';

export async function renderAdminDashboard() {
    const app = document.querySelector('#app');
    app.innerHTML = '<div class="loading">Loading Admin Dashboard...</div>';

    const result = await getAllInternsProgress();

    if (!result.success) {
        app.innerHTML = `<div class="error">Error loading data: ${result.error}</div>`;
        return;
    }

    const interns = result.data;

    app.innerHTML = `
    <div class="admin-container">
      <div class="app-header">
        <h1>Admin Dashboard</h1>
        <button class="btn-secondary" onclick="window.history.back()">Back to Dashboard</button>
      </div>

      <div class="admin-table-container">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Intern</th>
              <th>Email</th>
              <th>N8N Progress</th>
              <th>Vibe Coding</th>
              <th>Prompt Eng</th>
              <th>AI Tools</th>
              <th>Resume</th>
            </tr>
          </thead>
          <tbody>
            ${interns.map(intern => {
        const n8n = intern.progress.find(p => p.category === 'n8n')?.progress_percent || 0;
        const vibe = intern.progress.find(p => p.category === 'vibe-coding')?.progress_percent || 0;
        const prompt = intern.progress.find(p => p.category === 'prompt-engineering')?.progress_percent || 0;
        const ai = intern.progress.find(p => p.category === 'ai-developments-tools')?.progress_percent || 0;

        return `
                <tr>
                  <td>${intern.full_name || 'N/A'}</td>
                  <td>${intern.email}</td>
                  <td><div class="mini-progress"><div style="width: ${n8n}%"></div></div> ${n8n}%</td>
                  <td><div class="mini-progress"><div style="width: ${vibe}%"></div></div> ${vibe}%</td>
                  <td><div class="mini-progress"><div style="width: ${prompt}%"></div></div> ${prompt}%</td>
                  <td><div class="mini-progress"><div style="width: ${ai}%"></div></div> ${ai}%</td>
                  <td>
                    ${intern.resume_url
                ? `<a href="${intern.resume_url}" target="_blank" class="btn-link">View Resume</a>`
                : '<span class="text-muted">No Resume</span>'}
                  </td>
                </tr>
              `;
    }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}
