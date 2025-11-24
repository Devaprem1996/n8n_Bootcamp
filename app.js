// Import Supabase configuration
import { 
  getCurrentUser, 
  signInWithGoogle, 
  signUpWithEmail, 
  signInWithEmail,
  saveProgress,
  loadProgress,
  exportProgressJSON,
  exportProgressCSV
} from './supabase-config.js';

// Global state
let currentUser = null;
let userProgress = {
  completedTasks: Array(9).fill(false),
  taskNotes: {},
  progressPercent: 0,
  cohort: 'default'
};

// Auto-save settings
let saveTimeout = null;
const AUTO_SAVE_DELAY = 2000; // Save 2 seconds after last change

// Bootcamp curriculum data with detailed visual descriptions
const BOOTCAMP = {
  title: "N8N Bootcamp Hub",
  cohort: "2024 Automation Engineers",
  days: [
    {
      day: 1,
      title: "N8N Basics & Setup",
      duration: "2 hours",
      difficulty: 1,
      topics: [
        "Welcome & Course Overview",
        "N8N Platform Introduction",
        "Dashboard Tour",
        "First Workflow Setup"
      ],
      concepts: ["Installation", "UI Overview", "First Workflow"],
      keyOutcomes: [
        "Understand N8N core concepts",
        "Navigate the N8N dashboard",
        "Create your first workflow",
        "Connect basic nodes"
      ],
      homework: "Create a simple 2-node workflow (Webhook → Email)"
    },
    {
      day: 2,
      title: "Data Flow & Nodes",
      duration: "3 hours",
      difficulty: 1,
      topics: [
        "JSON Data Structures",
        "Node Input/Output",
        "Data Transformation",
        "Pinning Outputs"
      ],
      concepts: ["Data Mapping", "Node Types", "Output Handling"],
      keyOutcomes: [
        "Understand JSON data structures",
        "Navigate node I/O interface",
        "Transform data using Set node",
        "Pin outputs for workflow control"
      ],
      homework: "Build workflow that splits and transforms data"
    },
    {
      day: 3,
      title: "Triggers & Event Management",
      duration: "4 hours",
      difficulty: 2,
      topics: [
        "5 Trigger Types",
        "Webhook Configuration",
        "Schedule Expressions",
        "Trigger Decisions"
      ],
      concepts: ["Webhooks", "Schedules", "Forms", "Manual Triggers"],
      
      keyOutcomes: [
        "Choose correct trigger for use case",
        "Set up webhooks correctly",
        "Create cron schedules",
        "Test trigger execution"
      ],
      homework: "Build workflow triggered on schedule (daily at 9 AM)"
    },
    {
      day: 4,
      title: "Email & Slack Integration",
      duration: "4 hours",
      difficulty: 2,
      topics: [
        "Email Personalization",
        "Slack OAuth Flow",
        "Conditional Routing",
        "Message Formatting"
      ],
      concepts: ["Email Templates", "Slack API", "Switch Node", "Variables"],
     
      keyOutcomes: [
        "Set up email with personalization",
        "Configure Slack OAuth",
        "Route messages conditionally",
        "Format messages for channels"
      ],
      homework: "Send personalized emails to 5 recipients from Slack"
    },
    {
      day: 5,
      title: "Google Sheets Integration",
      duration: "5 hours",
      difficulty: 2,
      topics: [
        "Sheets Benefits & Setup",
        "OAuth Authentication",
        "CRUD Operations",
        "Data Mapping Modes"
      ],
      concepts: ["Google Sheets API", "Data Operations", "Mapping"],
      
      keyOutcomes: [
        "Authenticate with Google Sheets",
        "Perform all CRUD operations",
        "Map data between formats",
        "Handle large datasets"
      ],
      homework: "Create workflow that reads, transforms, and appends to Sheets"
    },
    {
      day: 6,
      title: "Lead Management System (Project 1)",
      duration: "6 hours",
      difficulty: 3,
      topics: [
        "Project Architecture",
        "Multi-Step Workflows",
        "Error Handling",
        "Testing & Debugging"
      ],
      concepts: ["Webhooks", "Google Sheets", "Email", "Slack"],
      
      keyOutcomes: [
        "Build 5-node workflow",
        "Handle multi-format outputs",
        "Validate data flow",
        "Deploy and test in production"
      ],
      homework: "Process 10 test leads through complete system"
    },
    {
      day: 7,
      title: "Invoice Generation System (Project 2)",
      duration: "6 hours",
      difficulty: 3,
      topics: [
        "Complex Data Transformation",
        "PDF Generation",
        "Calculation Logic",
        "Storage & Delivery"
      ],
      concepts: ["Forms", "Calculations", "PDF", "Email"],
      
      keyOutcomes: [
        "Build calculation workflows",
        "Generate formatted documents",
        "Implement business logic",
        "Automate document delivery"
      ],
      homework: "Generate invoices for 3 mock customers"
    },
    {
      day: 8,
      title: "Daily Report Aggregation (Project 3)",
      duration: "6 hours",
      difficulty: 3,
      topics: [
        "Multi-Source Integration",
        "Data Consolidation",
        "Report Formatting",
        "Scheduling & Automation"
      ],
      concepts: ["Multiple APIs", "Data Merging", "Formatting", "Scheduling"],
      
      keyOutcomes: [
        "Integrate multiple data sources",
        "Consolidate data efficiently",
        "Format professional reports",
        "Schedule recurring workflows"
      ],
      homework: "Create automated daily report with 3+ data sources"
    },
    {
      day: 9,
      title: "Error Handling & Capstone",
      duration: "4 hours",
      difficulty: 3,
      topics: [
        "Error Handling Patterns",
        "Retry Logic",
        "Capstone Project",
        "Celebration & Next Steps"
      ],
      concepts: ["Error Catching", "Retry Logic", "Logging", "Monitoring"],
      
      keyOutcomes: [
        "Handle workflow errors gracefully",
        "Implement retry strategies",
        "Log and monitor workflows",
        "Build production-ready systems"
      ],
      homework: "Complete capstone: Build error-resistant 4+ node workflow"
    } 
  ]
};

// DOM Helpers
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

/**
 * Initialize the application
 */
async function initializeApp() {
  try {
    console.log('🚀 Initializing N8N Bootcamp Hub...')
    
    // Check if user is already logged in
    const user = await getCurrentUser();
    
    if (user) {
      console.log('✅ User logged in:', user.email)
      currentUser = user;
      await loadUserProgress();
      renderMainApp();
    } else {
      console.log('ℹ️ No user logged in, showing login screen')
      renderLoginScreen();
    }
  } catch (error) {
    console.error('❌ Error initializing app:', error)
    renderLoginScreen();
  }
}

/**
 * Render login screen with Google Auth and email/password fallback
 */
function renderLoginScreen() {
  const app = $('#app');
  app.innerHTML = `
    <div class="login-container">
      <div class="login-card">
        <h1>🚀 N8N Bootcamp</h1>
        <p>Track your learning progress</p>
        
        <button class="btn-google" onclick="window.handleGoogleLogin()">
          🔐 Sign in with Google
        </button>
        
        <div class="login-info">
          <h3>Or use email & password:</h3>
          <input type="email" id="email" placeholder="your@email.com" 
                 style="width: 100%; padding: 12px; margin-bottom: 10px; border: 1px solid #e2e8f0; border-radius: 6px;">
          <input type="password" id="password" placeholder="Password" 
                 style="width: 100%; padding: 12px; margin-bottom: 10px; border: 1px solid #e2e8f0; border-radius: 6px;">
          <button onclick="window.handleEmailLogin()" 
                  style="width: 100%; padding: 12px; background: #667eea; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; margin-bottom: 10px;">
            Login
          </button>
          <button onclick="window.handleEmailSignup()" 
                  style="width: 100%; padding: 12px; background: #10b981; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">
            Create Account
          </button>
        </div>
        
        <ul style="text-align: left; margin-top: 20px;">
          <li>✓ Track daily progress</li>
          <li>✓ Take learning notes</li>
          <li>✓ View performance stats</li>
          <li>✓ Export your data</li>
        </ul>
      </div>
    </div>
  `;
}

/**
 * Render main application dashboard
 */
function renderMainApp() {
  const app = $('#app');
  const completedCount = userProgress.completedTasks.filter(t => t).length;
  const progressPercent = Math.round((completedCount / 9) * 100);
  
  app.innerHTML = `
    <div class="app-container">
      <!-- Header -->
      <div class="app-header">
        <div class="header-content">
          <h1>${BOOTCAMP.title}</h1>
          <p>Welcome, ${currentUser.email} • ${completedCount}/9 Days Complete</p>
        </div>
        <button class="btn-logout" onclick="window.handleLogout()">Logout</button>
      </div>
      
      <!-- Progress Section -->
      <div class="progress-section">
        <div class="progress-card">
          <h2>📊 Overall Progress</h2>
          <div class="progress-bar-container">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${progressPercent}%"></div>
            </div>
            <div class="progress-text">${progressPercent}%</div>
          </div>
          <div class="progress-detail">
            You've completed <strong>${completedCount} out of 9 days</strong>
          </div>
        </div>
      </div>
      
      <!-- Tabs Navigation -->
      <div class="tabs-nav">
        <button class="tab-btn active" onclick="window.switchTab('learning')">
          📚 Learning Path
        </button>
        <button class="tab-btn" onclick="window.switchTab('assessment')">
          ✍️ Assessments
        </button>
        <button class="tab-btn" onclick="window.switchTab('performance')">
          📈 Performance
        </button>
        <button class="tab-btn" onclick="window.switchTab('export')">
          💾 Export
        </button>
      </div>
      
      <!-- Tabs Content -->
      <div class="tabs-content">
        <!-- Learning Path Tab -->
        <div id="learning" class="tab-pane active">
          <h2>📚 Your Learning Path</h2>
          <div class="learning-grid">
            ${BOOTCAMP.days.map((item, index) => `
              <div class="day-card ${userProgress.completedTasks[index] ? 'completed' : ''}">
                <div class="day-number">Day ${item.day}</div>
                <h3>${item.title}</h3>
                
                <div class="day-info">
                  <span class="duration">⏱️ ${item.duration}</span>
                  <span class="difficulty-badge difficulty-${item.difficulty}">
                    ${'⭐'.repeat(item.difficulty)} Level ${item.difficulty}
                  </span>
                </div>
                
                <div class="topics">
                  <strong>Topics:</strong>
                  <ul>
                    ${item.topics.map(t => `<li>${t}</li>`).join('')}
                  </ul>
                </div>
                
                <div class="outcomes">
                  <strong>Key Outcomes:</strong>
                  <ul>
                    ${item.keyOutcomes.map(o => `<li>✓ ${o}</li>`).join('')}
                  </ul>
                </div>
                
                <div class="homework">
                  📝 <strong>Homework:</strong> ${item.homework}
                </div>
                
                <div class="checkbox-container" style="margin-top: 12px;">
                  <input 
                    type="checkbox" 
                    ${userProgress.completedTasks[index] ? 'checked' : ''}
                    onchange="window.toggleDay(${index})"
                  >
                  <span>Mark as complete</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <!-- Assessment Tab -->
        <div id="assessment" class="tab-pane">
          <h2>✍️ Daily Notes & Assessment</h2>
          <div class="assessment-container">
            ${BOOTCAMP.days.map((item, index) => {
              const notes = userProgress.taskNotes[`day-${index + 1}`] || '';
              const isCompleted = userProgress.completedTasks[index];
              return `
                <div class="assessment-item">
                  <div class="assessment-header">
                    <div>
                      <h3>Day ${item.day}: ${item.title}</h3>
                      <p style="font-size: 12px; color: #64748b; margin-top: 4px;">
                        ${item.topics.join(' • ')}
                      </p>
                    </div>
                    <span class="status ${isCompleted ? 'done' : 'pending'}">
                      ${isCompleted ? '✓ Done' : '○ Pending'}
                    </span>
                  </div>
                  
                  <div class="assessment-homework" style="margin: 12px 0; padding: 12px; background: #f1f5f9; border-left: 3px solid #667eea; border-radius: 4px; font-size: 12px;">
                    <strong>📝 Homework:</strong> ${item.homework}
                  </div>
                  
                  <textarea 
                    class="assessment-textarea"
                    placeholder="Write your notes, what you learned, challenges faced, key takeaways..."
                    onchange="window.updateDayNotes(${index}, this.value)"
                    onblur="window.autoSaveProgress()"
                  >${notes}</textarea>
                </div>
              `;
            }).join('')}
          </div>
        </div>
        
        <!-- Performance Tab -->
        <div id="performance" class="tab-pane">
          <h2>📈 Performance Analytics</h2>
          <div class="stats-grid">
            <div class="stat-box">
              <div class="stat-number">${completedCount}</div>
              <div class="stat-label">Days Completed</div>
            </div>
            <div class="stat-box">
              <div class="stat-number">${progressPercent}%</div>
              <div class="stat-label">Progress</div>
            </div>
            <div class="stat-box">
              <div class="stat-number">${9 - completedCount}</div>
              <div class="stat-label">Days Remaining</div>
            </div>
            <div class="stat-box">
              <div class="stat-number">${Object.keys(userProgress.taskNotes).length}</div>
              <div class="stat-label">Notes Taken</div>
            </div>
          </div>
          
          <div class="chart-container">
            <h3>📊 Progress by Week</h3>
            <div class="chart">
              <div class="chart-bar">
                <div class="bar-label">Week 1 (Days 1-3)</div>
                <div class="bar-container">
                  <div class="bar-fill" style="width: ${(userProgress.completedTasks.slice(0, 3).filter(t => t).length / 3) * 100}%"></div>
                </div>
                <div class="bar-text">${userProgress.completedTasks.slice(0, 3).filter(t => t).length}/3 complete</div>
              </div>
              <div class="chart-bar">
                <div class="bar-label">Week 2 (Days 4-6)</div>
                <div class="bar-container">
                  <div class="bar-fill" style="width: ${(userProgress.completedTasks.slice(3, 6).filter(t => t).length / 3) * 100}%"></div>
                </div>
                <div class="bar-text">${userProgress.completedTasks.slice(3, 6).filter(t => t).length}/3 complete</div>
              </div>
              <div class="chart-bar">
                <div class="bar-label">Week 3 (Days 7-9)</div>
                <div class="bar-container">
                  <div class="bar-fill" style="width: ${(userProgress.completedTasks.slice(6, 9).filter(t => t).length / 3) * 100}%"></div>
                </div>
                <div class="bar-text">${userProgress.completedTasks.slice(6, 9).filter(t => t).length}/3 complete</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Export Tab -->
        <div id="export" class="tab-pane">
          <h2>💾 Export Your Data</h2>
          <p style="margin-bottom: 20px; color: #64748b;">Download your progress and notes in your preferred format.</p>
          <div class="export-options">
            <button class="btn-export" onclick="window.handleExportJSON()">
              📄 Export as JSON
            </button>
            <button class="btn-export" onclick="window.handleExportCSV()">
              📊 Export as CSV
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div id="save-status" style="
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 12px 20px;
      background: #10b981;
      color: white;
      border-radius: 8px;
      font-size: 14px;
      opacity: 0;
      transition: opacity 0.3s;
      pointer-events: none;
    ">
      ✓ Saved to database
    </div>
  `;
}

/**
 * Switch between tabs
 */
function switchTab(tabName) {
  // Hide all panes
  $$('.tab-pane').forEach(pane => pane.classList.remove('active'));
  
  // Remove active class from all buttons
  $$('.tab-btn').forEach(btn => btn.classList.remove('active'));
  
  // Show selected pane
  const pane = $(`#${tabName}`);
  if (pane) pane.classList.add('active');
  
  // Add active class to clicked button
  event.target.classList.add('active');
}

/**
 * Toggle day completion
 */
function toggleDay(index) {
  userProgress.completedTasks[index] = !userProgress.completedTasks[index];
  console.log(`✓ Day ${index + 1} toggled:`, userProgress.completedTasks[index]);
  autoSaveProgress();
  renderMainApp();
}

/**
 * Update day notes
 */
function updateDayNotes(index, notes) {
  userProgress.taskNotes[`day-${index + 1}`] = notes;
  console.log(`✏️ Notes updated for Day ${index + 1}`);
  autoSaveProgress();
}

/**
 * Auto-save progress with debounce
 */
function autoSaveProgress() {
  // Clear existing timeout
  if (saveTimeout) clearTimeout(saveTimeout);
  
  // Set new timeout
  saveTimeout = setTimeout(async () => {
    try {
      if (!currentUser || !currentUser.id) {
        console.error('❌ Not logged in, cannot save');
        return;
      }
      
      console.log('💾 Auto-saving progress...');
      const completed = userProgress.completedTasks.filter(t => t).length;
      const progressPercent = Math.round((completed / 9) * 100);
      
      const result = await saveProgress(currentUser.id, {
        ...userProgress,
        progressPercent: progressPercent,
        email: currentUser.email
      });
      
      if (result.success) {
        console.log('✅ Auto-save successful!');
        showSaveStatus();
      } else {
        console.error('❌ Auto-save failed:', result.error);
      }
    } catch (error) {
      console.error('❌ Auto-save error:', error);
    }
  }, AUTO_SAVE_DELAY);
}

/**
 * Show save status notification
 */
function showSaveStatus() {
  const status = $('#save-status');
  if (status) {
    status.style.opacity = '1';
    setTimeout(() => {
      status.style.opacity = '0';
    }, 2000);
  }
}

/**
 * Load user progress from database
 */
async function loadUserProgress() {
  try {
    console.log('📂 Loading user progress...');
    
    if (!currentUser || !currentUser.id) {
      console.log('ℹ️ No user ID, skipping load');
      return;
    }
    
    const result = await loadProgress(currentUser.id);
    
    if (result.success && result.data) {
      userProgress = {
        completedTasks: result.data.completed_tasks || Array(9).fill(false),
        taskNotes: result.data.task_notes || {},
        progressPercent: result.data.progress_percent || 0,
        cohort: result.data.cohort || 'default'
      };
      console.log('✅ Progress loaded successfully:', userProgress);
    } else {
      console.log('ℹ️ No previous progress found, using defaults');
    }
  } catch (error) {
    console.error('❌ Error loading progress:', error);
  }
}

// Global function exports for onclick handlers
window.handleGoogleLogin = async function() {
  try {
    console.log('🔐 Starting Google login...');
    const result = await signInWithGoogle();
    if (result.success) {
      currentUser = result.user;
      await loadUserProgress();
      renderMainApp();
    } else {
      alert('Google login failed. Please use email/password instead.');
    }
  } catch (error) {
    console.error('Google login error:', error);
    alert('Error during Google login: ' + error.message);
  }
};

window.handleEmailLogin = async function() {
  const email = $('#email').value;
  const password = $('#password').value;
  
  if (!email || !password) {
    alert('Please enter email and password');
    return;
  }
  
  try {
    console.log('📧 Logging in with email...');
    const result = await signInWithEmail(email, password);
    if (result.success) {
      currentUser = result.user;
      await loadUserProgress();
      renderMainApp();
    } else {
      alert('Login failed: ' + result.error);
    }
  } catch (error) {
    console.error('Email login error:', error);
    alert('Error during login: ' + error.message);
  }
};

window.handleEmailSignup = async function() {
  const email = $('#email').value;
  const password = $('#password').value;
  
  if (!email || !password) {
    alert('Please enter email and password');
    return;
  }
  
  if (password.length < 6) {
    alert('Password must be at least 6 characters');
    return;
  }
  
  try {
    console.log('📝 Creating account...');
    const result = await signUpWithEmail(email, password);
    if (result.success) {
      currentUser = result.user;
      await loadUserProgress();
      renderMainApp();
    } else {
      alert('Signup failed: ' + result.error);
    }
  } catch (error) {
    console.error('Signup error:', error);
    alert('Error during signup: ' + error.message);
  }
};

window.handleLogout = async function() {
  try {
    console.log('👋 Logging out...');
    currentUser = null;
    userProgress = {
      completedTasks: Array(9).fill(false),
      taskNotes: {},
      progressPercent: 0,
      cohort: 'default'
    };
    renderLoginScreen();
  } catch (error) {
    console.error('Logout error:', error);
  }
};

window.switchTab = switchTab;
window.toggleDay = toggleDay;
window.updateDayNotes = updateDayNotes;
window.autoSaveProgress = autoSaveProgress;

window.handleExportJSON = async function() {
  try {
    const result = await exportProgressJSON(currentUser.id, userProgress);
    if (result.success) {
      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(result.data, null, 2)));
      element.setAttribute('download', `bootcamp-progress-${new Date().toISOString().split('T')[0]}.json`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  } catch (error) {
    alert('Error exporting JSON: ' + error.message);
  }
};

window.handleExportCSV = async function() {
  try {
    const result = await exportProgressCSV(currentUser.id, userProgress);
    if (result.success) {
      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(result.data));
      element.setAttribute('download', `bootcamp-progress-${new Date().toISOString().split('T')[0]}.csv`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  } catch (error) {
    alert('Error exporting CSV: ' + error.message);
  }
};

// Start the app
initializeApp();
