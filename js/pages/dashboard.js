import { getCurrentUser, getProgress, setProgress, setCurrentCategory, appState } from '../state.js';
import { saveProgress, loadProgress, signOut } from '../services/supabase.js';
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

let activeTab = 'dashboard';

// Main dashboard render function
export async function renderDashboard(category) {
  const user = getCurrentUser();
  if (!user) {
    navigateTo('/login');
    return;
  }
  
  const curriculum = CURRICULA[category];
  if (!curriculum) {
      navigateTo('/dashboard');
      return;
  }

  // Load progress if not already loaded
  let progress = getProgress(category);
  if (!progress.isLoaded) {
    const result = await loadProgress(user.id, category);
    if (result.success && result.data) {
      setProgress(category, { ...result.data, isLoaded: true });
    } else {
      // No progress in DB, initialize it
      const totalDays = curriculum.days.length;
      const initialProgress = {
        completedTasks: Array(totalDays).fill(false),
        isLoaded: true,
        progressPercent: 0,
      };
      setProgress(category, initialProgress);
    }
    progress = getProgress(category); // get the updated progress
  }


  const app = document.querySelector('#app');
  app.innerHTML = `
    <div class="app-container">
      <header class="app-header">
        <div class="header-content">
          <h1>Bootcamp Hub</h1>
          <p>Welcome, ${user.email}</p>
        </div>
        <div class="header-actions">
          ${user.role === 'admin' ? '<button class="btn-secondary" id="btn-admin">Admin</button>' : ''}
          <button class="btn-logout" id="btn-logout">Logout</button>
        </div>
      </header>

      <!-- Curriculum Navigation -->
      <nav class="tabs-nav">
        <button class="tab-btn ${category === 'n8n' ? 'active' : ''}" data-path="/n8n">N8N</button>
        <button class="tab-btn ${category === 'vibe-coding' ? 'active' : ''}" data-path="/vibe-coding">Vibe Coding</button>
        <button class="tab-btn ${category === 'prompt-engineering' ? 'active' : ''}" data-path="/prompt-engineering">Prompt Eng</button>
        <button class="tab-btn ${category === 'ai-developments-tools' ? 'active' : ''}" data-path="/ai-developments-tools">AI Tools</button>
      </nav>

      <!-- Main Content Area -->
      <main class="main-content">
        <div class="tabs-main-nav">
          <button class="tab-main-btn" data-tab="dashboard">Dashboard</button>
          <button class="tab-main-btn" data-tab="learning">Learning</button>
          <button class="tab-main-btn" data-tab="workbook">Workbook</button>
          <button class="tab-main-btn" data-tab="resources">Resources</button>
          <button class="tab-main-btn" data-tab="assessment">Assessment</button>
          <button class="tab-main-btn" data-tab="setup">Setup</button>
          ${user.role === 'admin' ? '<button class="tab-main-btn" data-tab="instructor">Instructor</button>' : ''}
        </div>
        <div id="tab-content" class="tab-content"></div>
      </main>
    </div>
  `;

  // Set active tab button style
  document.querySelectorAll('.tab-main-btn').forEach(btn => {
      if(btn.dataset.tab === activeTab) {
          btn.classList.add('active');
      }
  });

  renderTabContent(category);
  addEventListeners(category);
}

function renderTabContent(category) {
  const tabContent = document.getElementById('tab-content');
  switch (activeTab) {
    case 'dashboard':
      tabContent.innerHTML = renderDashboard_Overview(category);
      break;
    case 'learning':
      tabContent.innerHTML = renderDashboard_Learning(category);
      // Re-attach listeners for dynamic content
      attachLearningTabListeners(category);
      break;
    case 'workbook':
      tabContent.innerHTML = renderDashboard_Workbook(category);
      break;
    case 'resources':
      tabContent.innerHTML = renderDashboard_Resources(category);
      break;
    case 'assessment':
      tabContent.innerHTML = renderDashboard_Assessment(category);
      break;
    case 'setup':
      tabContent.innerHTML = renderDashboard_Setup(category);
      break;
    case 'instructor':
      tabContent.innerHTML = renderDashboard_Instructor(category);
      break;
  }
}

// --- TAB RENDER FUNCTIONS ---

function renderDashboard_Overview(category) {
    const curriculum = CURRICULA[category];
    const progress = getProgress(category);
    const completedCount = progress.completedTasks.filter(t => t).length;
    const totalDays = curriculum.days.length;
    const progressPercent = totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0;

    return `
    <div class="dashboard-overview">
        <h2>${curriculum.title} Overview</h2>
        <div class="stats-grid">
            <div class="stat-card">
                <h3>Progress</h3>
                <p>${progressPercent}%</p>
                <div class="progress-bar-container">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                </div>
            </div>
            <div class="stat-card">
                <h3>Total Hours</h3>
                <p>${curriculum.totalHours}</p>
            </div>
            <div class="stat-card">
                <h3>Workflows</h3>
                <p>${curriculum.totalWorkflows}</p>
            </div>
            <div class="stat-card">
                <h3>Projects</h3>
                <p>${curriculum.totalProjects}</p>
            </div>
        </div>
        <div class="getting-started">
            <h3>Getting Started</h3>
            <p>Welcome to the ${curriculum.title} Bootcamp! This hub is your central place for all learning materials, resources, and tracking your progress.</p>
        </div>
        <div class="key-dates">
            <h3>Key Dates</h3>
            <ul>
                ${curriculum.keyDates.map(d => `<li><b>${d.date}:</b> ${d.description}</li>`).join('')}
            </ul>
        </div>
    </div>
  `;
}

function renderDashboard_Learning(category) {
  const curriculum = CURRICULA[category];
  const progress = getProgress(category);

  return `
    <div class="learning-grid">
      ${curriculum.days.map((day, index) => `
        <div class="day-card ${progress.completedTasks[index] ? 'completed' : ''}">
            <div class="day-header">
                <span class="day-number">Day ${day.day}</span>
                <h3>${day.title}</h3>
                <div class="checkbox-container">
                    <input type="checkbox" id="task-${index}" ${progress.completedTasks[index] ? 'checked' : ''}>
                    <label for="task-${index}">Complete</label>
                </div>
            </div>
            <div class="day-details">
                <p><strong>Learning Outcomes:</strong></p>
                <ul>${day.outcomes.map(o => `<li>- ${o}</li>`).join('')}</ul>
                <details>
                    <summary>Topics Covered</summary>
                    <ul>${day.topics.map(t => `<li>${t}</li>`).join('')}</ul>
                </details>
                <details>
                    <summary>Concepts Deep Dive</summary>
                    <p>${day.concepts}</p>
                </details>
                 <details>
                    <summary>Practice Workflow</summary>
                    <p>${day.practice}</p>
                </details>
                 <details>
                    <summary>Homework</summary>
                    <p>${day.homework} (~${day.homeworkTime})</p>
                </details>
            </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderDashboard_Workbook(category) {
    const curriculum = CURRICULA[category];
    const progress = getProgress(category);
    const completedCount = progress.completedTasks.filter(t => t).length;
    const totalDays = curriculum.days.length;
    const progressPercent = totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0;
    return `
    <div>
        <h2>Workbook</h2>
        <div class="workbook-section">
            <h3>Daily Notes</h3>
            <a href="/note-template.html" class="resource-link" target="_blank">Open Note Template</a>
        </div>
        <div class="workbook-section">
            <h3>Personal Progress Tracker</h3>
            <div class="progress-bar-container">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progressPercent}%;"></div>
                </div>
                <div class="progress-text">${progressPercent}%</div>
            </div>
        </div>
        <div class="workbook-section">
            <h3>Project Planners</h3>
            <a href="#" class="resource-link">Capstone Project Planner</a>
        </div>
  </div>
  `;
}

function renderDashboard_Resources(category) {
  const curriculum = CURRICULA[category];
  return `
    <div>
        <h2>Resources</h2>
        <div class="resources-section">
            <h3>YouTube Resources</h3>
            <div class="video-grid">
            ${curriculum.resources.youtube.map(video => `
                <div class="video-card">
                    <h4>${video.title}</h4>
                    <p>${video.channel} - ${video.duration}</p>
                    <p>Topics: ${video.tags.join(', ')}</p>
                    <a href="${video.url}" target="_blank" class="btn-secondary">Watch</a>
                </div>
            `).join('')}
            </div>
        </div>
         <div class="resources-section">
            <h3>Pre-built Workflows</h3>
             ${curriculum.resources.workflows.map(wf => `<a href="${wf.url}" class="resource-link" download="${wf.name}.json">${wf.name}</a>`).join('')}
        </div>
    </div>
  `;
}

function renderDashboard_Assessment(category) {
    return `
    <div>
        <h2>Assessment</h2>
        <div class="assessment-section">
            <h3>Rubrics</h3>
            <ul>
                <li>Homework Rubric (0-3 Points)</li>
                <li>Project Rubric (100 Points)</li>
                <li>Capstone Rubric (100 Points)</li>
            </ul>
        </div>
        <div class="assessment-section">
            <h3>Templates</h3>
            <a href="#" class="resource-link">Certificate of Completion Template</a>
        </div>
    </div>
  `;
}

function renderDashboard_Setup(category) {
    return `
    <div>
        <h2>Setup & Preparation</h2>
        <div class="setup-section">
            <h3>Checklists</h3>
            <ul>
                <li>Pre-bootcamp Checklist</li>
                <li>Student Preparation Checklist</li>
                <li>Daily Class Prep Guide</li>
            </ul>
        </div>
        <div class="setup-section">
            <h3>Contingency Plans</h3>
            <ul>
                <li>Technology Requirements</li>
                <li>Backup Plan: N8N Outage</li>
                <li>Backup Plan: Internet Failure</li>
            </ul>
        </div>
    </div>
  `;
}

function renderDashboard_Instructor(category) {
    return `
    <div>
        <h2>Instructor Tools</h2>
        <div class="instructor-section">
            <h3>Teaching Materials</h3>
            <a href="#" class="resource-link">Download All Materials (PDF, PPT, Workflows)</a>
        </div>
        <div class="instructor-section">
            <h3>Quick Reference</h3>
            <ul>
                <li><a href="https://crontab.guru/" target="_blank">Cron Expression Generator</a></li>
                <li>Error Handling Decision Tree</li>
            </ul>
        </div>
    </div>
  `;
}

// --- EVENT LISTENERS ---

function addEventListeners(category) {
  document.getElementById('btn-logout')?.addEventListener('click', () => {
    signOut().then(() => navigateTo('/'));
  });

  document.getElementById('btn-admin')?.addEventListener('click', () => navigateTo('/admin'));
  
  // Curriculum tab navigation
  document.querySelector('.tabs-nav').addEventListener('click', (e) => {
    if (e.target.matches('.tab-btn')) {
      const path = e.target.dataset.path;
      if (path) {
        navigateTo(path);
      }
    }
  });

  // Main tab navigation
  document.querySelector('.tabs-main-nav').addEventListener('click', (e) => {
    if (e.target.matches('.tab-main-btn')) {
      activeTab = e.target.dataset.tab;
      // re-render the whole dashboard to update tab content and active tab style
      renderDashboard(category);
    }
  });
}

function attachLearningTabListeners(category) {
    const curriculum = CURRICULA[category];
    const user = getCurrentUser();
    let progress = getProgress(category);

    curriculum.days.forEach((_, index) => {
        const checkbox = document.getElementById(`task-${index}`);
        if(!checkbox) return;
        checkbox.addEventListener('change', async (e) => {
            const newCompleted = [...progress.completedTasks];
            newCompleted[index] = e.target.checked;
            const totalDays = curriculum.days.length;

            const newProgress = {
                ...progress,
                completedTasks: newCompleted,
                progressPercent: totalDays > 0 ? Math.round((newCompleted.filter(t => t).length / totalDays) * 100) : 0
            };

            setProgress(category, newProgress);
            await saveProgress(user.id, category, { ...newProgress, email: user.email });
            
            // Re-render just the overview and learning tabs if they are visible
            if(activeTab === 'dashboard') {
                document.getElementById('tab-content').innerHTML = renderDashboard_Overview(category);
            } else if (activeTab === 'learning') {
                document.getElementById('tab-content').innerHTML = renderDashboard_Learning(category);
                attachLearningTabListeners(category); // re-attach listeners after re-render
            } else if (activeTab === 'workbook') {
                document.getElementById('tab-content').innerHTML = renderDashboard_Workbook(category);
            }
        });
    });
}