/**
 * N8N Bootcamp - Supabase + Google Auth Version
 * Clean, minimal UI focused on performance tracking
 * Deploy to Vercel/Netlify
 */

// Bootcamp curriculum data
const BOOTCAMP = {
  days: [
    { day: 1, title: "N8N Basics & Setup", concepts: ["N8N Interface", "Nodes & Connections"], difficulty: 1 },
    { day: 2, title: "Triggers & Workflows", concepts: ["Webhook Triggers", "Manual Triggers"], difficulty: 1 },
    { day: 3, title: "HTTP Integration", concepts: ["HTTP Requests", "REST APIs"], difficulty: 2 },
    { day: 4, title: "Data Transformation", concepts: ["Function Nodes", "Data Mapping"], difficulty: 2 },
    { day: 5, title: "Database Operations", concepts: ["SQL Queries", "Data Storage"], difficulty: 2 },
    { day: 6, title: "Lead Management", concepts: ["CRM Integration", "Pipeline Automation"], difficulty: 2 },
    { day: 7, title: "Invoice Automation", concepts: ["PDF Generation", "Email Sending"], difficulty: 3 },
    { day: 8, title: "Report Generation", concepts: ["Data Aggregation", "Export Options"], difficulty: 3 },
    { day: 9, title: "Capstone Project", concepts: ["Full Workflow", "Real-world Scenario"], difficulty: 3 }
  ]
};

// State management
let currentUser = null;
let userProgress = {
  completedTasks: Array(9).fill(false),
  taskNotes: {},
  progressPercent: 0,
  cohort: 'default'
};

// Helper functions for DOM selection
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Initialize app
document.addEventListener('DOMContentLoaded', initializeApp);

/**
 * Initialize application and check authentication
 */
async function initializeApp() {
  try {
    console.log('🚀 Initializing app...')
    console.log('📍 Current URL:', window.location.href)
    
    // Use dynamic import to load supabase config
    const supabaseModule = await import('./supabase-config.js')
    console.log('✅ Supabase module loaded')
    
    const getCurrentUser = supabaseModule.getCurrentUser
    const initSupabase = supabaseModule.initSupabase
    
    // Check if this is an OAuth callback (has # in URL)
    const isOAuthCallback = window.location.hash.includes('access_token')
    if (isOAuthCallback) {
      console.log('🔐 OAuth callback detected, waiting for session...')
    }
    
    // Wait for OAuth callback to process
    await new Promise(resolve => setTimeout(resolve, 800))
    
    currentUser = await getCurrentUser()
    console.log('✅ User check complete:', currentUser ? `Logged in as ${currentUser.email}` : 'Not logged in')
    
    // Set up auth state listener to handle OAuth redirects
    if (initSupabase && typeof initSupabase === 'function') {
      try {
        const sb = await initSupabase()
        sb.auth.onAuthStateChange((event, session) => {
          console.log('🔐 Auth state changed:', event, session?.user?.email)
          if (session && session.user) {
            currentUser = session.user
            console.log('✅ User authenticated via OAuth:', currentUser.email)
            // Clear the hash/fragment to clean URL
            window.history.replaceState({}, document.title, window.location.pathname)
            renderMainApp()
            loadUserProgress()
          }
        })
      } catch (e) {
        console.log('ℹ️ Auth state listener setup skipped:', e.message)
      }
    }
    
    if (!currentUser) {
      renderLoginScreen()
    } else {
      renderMainApp()
      await loadUserProgress()
    }
  } catch (error) {
    console.error('❌ Initialization error:', error)
    // Fallback to login screen on error
    renderLoginScreen()
  }
}

/**
 * Render login screen with Google auth + Email/Password fallback
 */
function renderLoginScreen() {
  console.log('📱 Rendering login screen')
  document.body.innerHTML = `
    <div class="login-container">
      <div class="login-card">
        <h1>N8N Bootcamp Hub</h1>
        <p>Track your learning progress and master N8N automation</p>
        
        <!-- Google Sign-in -->
        <button class="btn-google" onclick="handleGoogleLogin()" style="opacity: 0.6;" title="Configure Supabase OAuth first">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10"></circle>
          </svg>
          Sign in with Google (Setup Required)
        </button>
        
        <!-- Divider -->
        <div style="margin: 24px 0; display: flex; align-items: center; gap: 12px;">
          <div style="flex: 1; height: 1px; background: #e2e8f0;"></div>
          <span style="color: #64748b; font-size: 12px;">Recommended: Use Email/Password</span>
          <div style="flex: 1; height: 1px; background: #e2e8f0;"></div>
        </div>
        
        <!-- Email/Password Login -->
        <div id="email-login-form">
          <input 
            type="email" 
            id="login-email" 
            placeholder="Email address" 
            style="width: 100%; padding: 10px; margin-bottom: 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px;"
          />
          <input 
            type="password" 
            id="login-password" 
            placeholder="Password" 
            style="width: 100%; padding: 10px; margin-bottom: 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px;"
          />
          <button 
            class="btn-google" 
            onclick="handleEmailLogin()" 
            style="background: #667eea; margin-bottom: 12px;"
          >
            Sign in with Email
          </button>
          <button 
            class="btn-google" 
            onclick="handleEmailSignup()" 
            style="background: #764ba2; margin-bottom: 12px;"
          >
            Create Account
          </button>
        </div>
        
        <div class="login-info">
          <h3>About this bootcamp:</h3>
          <ul>
            <li>9-day comprehensive N8N training</li>
            <li>Learn automation workflows from basics to advanced</li>
            <li>Real-world project experience</li>
            <li>Capstone project to showcase skills</li>
          </ul>
        </div>
      </div>
    </div>
  `;
}

/**
 * Handle Google Sign-in
 */
async function handleGoogleLogin() {
  try {
    console.log('🔐 Starting Google login...')
    const { signInWithGoogle } = await import('./supabase-config.js');
    const result = await signInWithGoogle();
    
    if (!result.success) {
      alert('❌ Google login failed:\n\n' + result.error + '\n\nPlease use email/password instead.');
      console.error('Google auth failed:', result.error)
    } else {
      console.log('✅ Google auth initiated, redirecting...')
    }
  } catch (error) {
    console.error('❌ Google login exception:', error)
    alert('Error during Google login: ' + error.message)
  }
}

/**
 * Toggle email/password login form
 */
function toggleEmailLogin() {
  const form = document.getElementById('email-login-form')
  if (form) {
    form.style.display = form.style.display === 'none' ? 'block' : 'none'
  }
}

/**
 * Handle Email Sign-in
 */
async function handleEmailLogin() {
  try {
    const email = document.getElementById('login-email')?.value
    const password = document.getElementById('login-password')?.value
    
    if (!email || !password) {
      alert('Please enter both email and password')
      return
    }
    
    console.log('📧 Signing in with email:', email)
    const { signInWithEmail } = await import('./supabase-config.js')
    const result = await signInWithEmail(email, password)
    
    if (!result.success) {
      alert('❌ Login failed: ' + result.error)
    } else {
      console.log('✅ Email login successful, reloading...')
      window.location.reload()
    }
  } catch (error) {
    console.error('❌ Email login error:', error)
    alert('Error: ' + error.message)
  }
}

/**
 * Handle Email Sign-up
 */
async function handleEmailSignup() {
  try {
    const email = document.getElementById('login-email')?.value
    const password = document.getElementById('login-password')?.value
    
    if (!email || !password) {
      alert('Please enter both email and password')
      return
    }
    
    if (password.length < 6) {
      alert('Password must be at least 6 characters')
      return
    }
    
    console.log('📧 Signing up with email:', email)
    const { signUpWithEmail } = await import('./supabase-config.js')
    const result = await signUpWithEmail(email, password)
    
    if (!result.success) {
      alert('❌ Sign up failed: ' + result.error)
    } else {
      alert('✅ Account created! Check your email for confirmation, then sign in.')
    }
  } catch (error) {
    console.error('❌ Email signup error:', error)
    alert('Error: ' + error.message)
  }
}

// Expose to global scope for onclick handlers
window.handleGoogleLogin = handleGoogleLogin;
window.toggleEmailLogin = toggleEmailLogin;
window.handleEmailLogin = handleEmailLogin;
window.handleEmailSignup = handleEmailSignup;

/**
 * Render main application
 */
function renderMainApp() {
  document.body.innerHTML = `
    <div class="app-container">
      <header class="app-header">
        <div class="header-content">
          <h1>N8N Bootcamp Hub</h1>
          <p>Welcome, ${currentUser?.user_metadata?.full_name || currentUser?.email}</p>
        </div>
        <button class="btn-logout" onclick="handleLogout()">Logout</button>
      </header>

      <main class="app-main">
        <!-- Progress Summary -->
        <section class="progress-section">
          <div class="progress-card">
            <h2>Your Progress</h2>
            <div class="progress-bar-container">
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${userProgress.progressPercent}%"></div>
              </div>
              <span class="progress-text">${userProgress.progressPercent}%</span>
            </div>
            <p class="progress-detail">
              ${userProgress.completedTasks.filter(t => t).length} of ${BOOTCAMP.days.length} days completed
            </p>
          </div>
        </section>

        <!-- Tabs Navigation -->
        <nav class="tabs-nav">
          <button class="tab-btn active" data-tab="learning" onclick="switchTab('learning')">
            📚 Learning Path
          </button>
          <button class="tab-btn" data-tab="assessment" onclick="switchTab('assessment')">
            ✓ Assessment
          </button>
          <button class="tab-btn" data-tab="performance" onclick="switchTab('performance')">
            📊 Performance
          </button>
          <button class="tab-btn" data-tab="exports" onclick="switchTab('exports')">
            ⬇ Exports
          </button>
        </nav>

        <!-- Tab Content -->
        <div class="tabs-content">
          <!-- Learning Path Tab -->
          <div class="tab-pane active" id="learning-tab">
            <h2>9-Day Learning Path</h2>
            <div class="learning-grid" id="learning-grid"></div>
          </div>

          <!-- Assessment Tab -->
          <div class="tab-pane" id="assessment-tab">
            <h2>Day Assessment & Notes</h2>
            <div class="assessment-container" id="assessment-container"></div>
          </div>

          <!-- Performance Tab -->
          <div class="tab-pane" id="performance-tab">
            <h2>Performance Analytics</h2>
            <div class="performance-stats" id="performance-stats"></div>
          </div>

          <!-- Exports Tab -->
          <div class="tab-pane" id="exports-tab">
            <h2>Export Your Progress</h2>
            <div class="export-options">
              <button class="btn-export" onclick="exportJSON()">
                📄 Export as JSON
              </button>
              <button class="btn-export" onclick="exportCSV()">
                📋 Export as CSV
              </button>
              <button class="btn-export" onclick="saveToDB()">
                💾 Save to Database
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  `;
  
  // Wait for DOM to update before rendering content
  setTimeout(() => {
    renderLearningPath();
    renderAssessment();
    renderPerformance();
  }, 0);
}

/**
 * Switch between tabs
 */
function switchTab(tabName) {
  $$('.tab-btn').forEach(btn => btn.classList.remove('active'));
  $$('.tab-pane').forEach(pane => pane.classList.remove('active'));
  
  $(`[data-tab="${tabName}"]`).classList.add('active');
  $(`#${tabName}-tab`).classList.add('active');
}

/**
 * Render learning path with day cards
 */
function renderLearningPath() {
  const grid = $('#learning-grid');
  grid.innerHTML = BOOTCAMP.days.map((day, idx) => `
    <div class="day-card ${userProgress.completedTasks[idx] ? 'completed' : ''}">
      <div class="day-number">Day ${day.day}</div>
      <h3>${day.title}</h3>
      <p class="concepts">${day.concepts.join(', ')}</p>
      <div class="difficulty difficulty-${day.difficulty}">
        ${'⭐'.repeat(day.difficulty)} Level ${['Beginner', 'Intermediate', 'Advanced'][day.difficulty - 1]}
      </div>
      <label class="checkbox-container">
        <input type="checkbox" ${userProgress.completedTasks[idx] ? 'checked' : ''} 
               onchange="toggleTask(${idx})">
        <span>Mark as completed</span>
      </label>
    </div>
  `).join('');
}

/**
 * Render assessment section
 */
function renderAssessment() {
  const container = $('#assessment-container');
  container.innerHTML = BOOTCAMP.days.map((day, idx) => `
    <div class="assessment-item">
      <div class="assessment-header">
        <h3>Day ${day.day}: ${day.title}</h3>
        <span class="status ${userProgress.completedTasks[idx] ? 'done' : 'pending'}">
          ${userProgress.completedTasks[idx] ? '✓ Done' : 'Pending'}
        </span>
      </div>
      <textarea placeholder="Add notes for Day ${day.day}..." 
                  class="assessment-textarea"
                  onchange="updateNotes(${idx}, this.value)">
${userProgress.taskNotes[idx] || ''}</textarea>
    </div>
  `).join('');
}

/**
 * Render performance analytics
 */
function renderPerformance() {
  const container = $('#performance-stats');
  const completed = userProgress.completedTasks.filter(t => t).length;
  const avgDifficulty = BOOTCAMP.days.filter((d, i) => userProgress.completedTasks[i]).length > 0
    ? (BOOTCAMP.days.filter((d, i) => userProgress.completedTasks[i]).reduce((sum, d) => sum + d.difficulty, 0) / completed).toFixed(1)
    : 0;
  
  container.innerHTML = `
    <div class="stats-grid">
      <div class="stat-box">
        <div class="stat-number">${completed}</div>
        <div class="stat-label">Days Completed</div>
      </div>
      <div class="stat-box">
        <div class="stat-number">${userProgress.progressPercent}%</div>
        <div class="stat-label">Overall Progress</div>
      </div>
      <div class="stat-box">
        <div class="stat-number">${avgDifficulty || 0}</div>
        <div class="stat-label">Avg Difficulty</div>
      </div>
      <div class="stat-box">
        <div class="stat-number">${BOOTCAMP.days.length - completed}</div>
        <div class="stat-label">Days Remaining</div>
      </div>
    </div>
    
    <div class="chart-container">
      <h3>Completion by Difficulty</h3>
      <div class="chart">
        ${[1, 2, 3].map(level => {
          const inLevel = BOOTCAMP.days.filter(d => d.difficulty === level).length;
          const completedInLevel = BOOTCAMP.days.filter((d, i) => d.difficulty === level && userProgress.completedTasks[i]).length;
          return `
            <div class="chart-bar">
              <div class="bar-label">Level ${level}</div>
              <div class="bar-container">
                <div class="bar-fill" style="width: ${(completedInLevel / inLevel) * 100}%"></div>
              </div>
              <div class="bar-text">${completedInLevel}/${inLevel}</div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

/**
 * Toggle task completion
 */
function toggleTask(index) {
  userProgress.completedTasks[index] = !userProgress.completedTasks[index];
  updateProgress();
}

/**
 * Update task notes
 */
function updateNotes(index, text) {
  userProgress.taskNotes[index] = text;
  updateProgress();
}

/**
 * Update progress calculations and UI
 */
function updateProgress() {
  userProgress.progressPercent = Math.round((userProgress.completedTasks.filter(t => t).length / BOOTCAMP.days.length) * 100);
  renderLearningPath();
  renderAssessment();
  renderPerformance();
}

/**
 * Load user progress from Supabase
 */
async function loadUserProgress() {
  try {
    const { loadProgress } = await import('./supabase-config.js');
    const result = await loadProgress(currentUser.id);
    
    console.log('📊 Loaded progress:', result)
    
    if (result.success && result.data) {
      userProgress = {
        completedTasks: result.data.completed_tasks || Array(9).fill(false),
        taskNotes: result.data.task_notes || {},
        progressPercent: result.data.progress_percent || 0,
        cohort: result.data.cohort || 'default'
      };
      console.log('✅ User progress loaded:', userProgress)
    } else {
      console.log('ℹ️ No previous progress found, using defaults')
    }
    
    // Ensure content is rendered
    updateProgress();
  } catch (error) {
    console.error('❌ Error loading progress:', error)
    // Still update progress with defaults
    updateProgress();
  }
}

/**
 * Save progress to Supabase
 */
async function saveToDB() {
  try {
    console.log('💾 Saving progress to database...')
    console.log('📊 Data to save:', {
      userId: currentUser.id,
      email: currentUser.email,
      completedTasks: userProgress.completedTasks,
      taskNotes: userProgress.taskNotes,
      progressPercent: userProgress.progressPercent
    })
    
    const { saveProgress } = await import('./supabase-config.js');
    const result = await saveProgress(currentUser.id, {
      ...userProgress,
      email: currentUser.email
    });
    
    if (result.success) {
      console.log('✅ Save successful:', result.data)
      alert('✓ Progress saved successfully!');
    } else {
      console.error('❌ Save failed:', result.error)
      alert('✗ Error saving progress:\n\n' + result.error + '\n\nMake sure:\n1. Database table exists (see DATABASE_SETUP.md)\n2. Row Level Security policies are configured\n3. You are logged in');
    }
  } catch (error) {
    console.error('❌ Save exception:', error)
    alert('✗ Error saving progress:\n\n' + error.message + '\n\nPlease check DATABASE_SETUP.md for instructions.');
  }
}

/**
 * Export progress as JSON
 */
async function exportJSON() {
  const { exportProgressJSON } = await import('./supabase-config.js');
  exportProgressJSON(userProgress, currentUser.user_metadata?.full_name || currentUser.email);
}

/**
 * Export progress as CSV
 */
async function exportCSV() {
  const { exportProgressCSV } = await import('./supabase-config.js');
  exportProgressCSV(userProgress, currentUser.user_metadata?.full_name || currentUser.email);
}

/**
 * Handle logout
 */
async function handleLogout() {
  const { signOut } = await import('./supabase-config.js');
  await signOut();
  window.location.reload();
}

// Expose all functions to global scope for onclick handlers in HTML
window.handleLogout = handleLogout;
window.switchTab = switchTab;
window.exportJSON = exportJSON;
window.exportCSV = exportCSV;
window.saveToDB = saveToDB;

// END OF APP.JS
