// Import Supabase configuration
import { 
  getCurrentUser, 
  signInWithGoogle, 
  signUpWithEmail, 
  signInWithEmail,
  signOut,
  saveProgress,
  loadProgress,
  exportProgressJSON,
  exportProgressCSV
} from './supabase-config.js';

// ============================================
// ROUTING & STATE MANAGEMENT
// ============================================

// Application state
const appState = {
  currentUser: null,
  currentPage: 'landing', // landing, login, main
  userProgress: {
    completedTasks: Array(9).fill(false),
    taskNotes: {},
    progressPercent: 0,
    cohort: 'default'
  },
  saveTimeout: null,
  isInitialized: false
};

const AUTO_SAVE_DELAY = 2000; // Save 2 seconds after last change

// Router configuration
const routes = {
  'landing': { path: '/', protectedRoute: false, render: renderLandingPage },
  'login': { path: '/login', protectedRoute: false, render: renderLoginScreen },
  'main': { path: '/dashboard', protectedRoute: true, render: renderMainApp },
  'dashboardUsers': { path: '/dashboard/users', protectedRoute: true, render: renderMainApp }
};

// ============================================
// ROUTE PROTECTION & NAVIGATION
// ============================================

/**
 * Protected route middleware - redirects if not authenticated
 */
function requireAuth() {
  if (!appState.currentUser) {
    console.log('ℹ️ Route requires authentication, redirecting to login');
    navigateTo('/login');
    return false;
  }
  return true;
}

/**
 * Navigate to a specific page with route protection
 */
function navigateTo(path) {
  const route = Object.values(routes).find(r => r.path === path);
  
  if (!route) {
    console.error('❌ Route not found:', path);
    navigateTo('/');
    return;
  }
  
  // Check if route is protected and user is not authenticated
  if (route.protectedRoute && !appState.currentUser) {
    console.log('🔒 Attempting to access protected route without auth');
    navigateTo('/login');
    return;
  }
  
  appState.currentPage = Object.keys(routes).find(key => routes[key] === route);
  route.render();
}

// ============================================
// GLOBAL STATE GETTERS & SETTERS
// ============================================

function getAppCurrentUser() {
  return appState.currentUser;
}

function setCurrentUser(user) {
  appState.currentUser = user;
}

function getUserProgress() {
  return appState.userProgress;
}

function setUserProgress(progress) {
  appState.userProgress = { ...appState.userProgress, ...progress };
}

function getAutoSaveTimeout() {
  return appState.saveTimeout;
}

function setAutoSaveTimeout(timeout) {
  appState.saveTimeout = timeout;
}

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
  ],
  resources: {
    tutorials: [
      {
        day: 1,
        title: "N8N Basics",
        youtube: [
          { title: "N8N Introduction & Setup", url: "https://www.youtube.com/watch?v=example1" },
          { title: "Dashboard Tour & Navigation", url: "https://www.youtube.com/watch?v=example2" },
          { title: "Creating Your First Workflow", url: "https://www.youtube.com/watch?v=example3" }
        ]
      },
      {
        day: 2,
        title: "Data Flow & Nodes",
        youtube: [
          { title: "Understanding JSON Data", url: "https://www.youtube.com/watch?v=example4" },
          { title: "Node Input/Output Explained", url: "https://www.youtube.com/watch?v=example5" },
          { title: "Data Transformation with Set Node", url: "https://www.youtube.com/watch?v=example6" }
        ]
      },
      {
        day: 3,
        title: "Triggers",
        youtube: [
          { title: "All 5 Trigger Types Explained", url: "https://www.youtube.com/watch?v=example7" },
          { title: "Webhook Setup Guide", url: "https://www.youtube.com/watch?v=example8" },
          { title: "Cron Expressions Explained", url: "https://www.youtube.com/watch?v=example9" }
        ]
      },
      {
        day: 4,
        title: "Email & Slack",
        youtube: [
          { title: "Email Integration Guide", url: "https://www.youtube.com/watch?v=example10" },
          { title: "Slack OAuth Setup", url: "https://www.youtube.com/watch?v=example11" },
          { title: "Conditional Message Routing", url: "https://www.youtube.com/watch?v=example12" }
        ]
      },
      {
        day: 5,
        title: "Google Sheets",
        youtube: [
          { title: "Google Sheets Integration", url: "https://www.youtube.com/watch?v=example13" },
          { title: "OAuth Authentication", url: "https://www.youtube.com/watch?v=example14" },
          { title: "CRUD Operations", url: "https://www.youtube.com/watch?v=example15" }
        ]
      }
    ],
    workflows: [
      {
        day: 1,
        title: "Simple Webhook to Email",
        description: "Basic workflow: Receive data via webhook and send email notification",
        json: '{"nodes":[{"id":"webhook","name":"Webhook","type":"n8n-nodes-base.webhook","typeVersion":2,"position":[250,300],"parameters":{"authentication":"none","httpMethod":"POST","path":"webhook/test"}},{"id":"email","name":"Send Email","type":"n8n-nodes-base.sendGrid","typeVersion":1,"position":[650,300],"parameters":{"authentication":"sendgridApi","subject":"New Submission","toEmail":"test@example.com","message":"A new lead has been submitted"},"credentials":{"sendgridApi":{"id":"1","name":"SendGrid API"}}}],"connections":{"webhook":{"main":[[{"node":"email","branch":0,"type":"main","index":0}]]}}}',
        difficulty: 1
      },
      {
        day: 2,
        title: "Data Transform Workflow",
        description: "Split and transform incoming data using Set node",
        json: '{"nodes":[{"id":"trigger","name":"Manual Trigger","type":"n8n-nodes-base.manualTrigger","typeVersion":1,"position":[100,250],"parameters":{}},{"id":"set","name":"Set Node","type":"n8n-nodes-base.set","typeVersion":1,"position":[400,250],"parameters":{"assignments":{"assignments":[{"name":"firstName","value":"=\\"John\\""},{"name":"lastName","value":"=\\"Doe\\""},{"name":"email","value":"=\\"john@example.com\\""}]}}},{"id":"output","name":"Output","type":"n8n-nodes-base.noOp","typeVersion":1,"position":[700,250],"parameters":{}}],"connections":{"trigger":{"main":[[{"node":"set","branch":0,"type":"main","index":0}]]},"set":{"main":[[{"node":"output","branch":0,"type":"main","index":0}]]}}}',
        difficulty: 1
      },
      {
        day: 3,
        title: "Scheduled Email Report",
        description: "Send emails on a schedule (e.g., daily at 9 AM)",
        json: '{"nodes":[{"id":"schedule","name":"Schedule Trigger","type":"n8n-nodes-base.scheduleTrigger","typeVersion":1,"position":[100,250],"parameters":{"rule":{"interval":[1],"triggerAtHour":9}},{"id":"email","name":"Send Report Email","type":"n8n-nodes-base.sendGrid","typeVersion":1,"position":[400,250],"parameters":{"authentication":"sendgridApi","subject":"Daily Report","toEmail":"admin@example.com","message":"Your daily report is ready"},"credentials":{"sendgridApi":{"id":"1","name":"SendGrid API"}}}],"connections":{"schedule":{"main":[[{"node":"email","branch":0,"type":"main","index":0}]]}}}',
        difficulty: 2
      },
      {
        day: 4,
        title: "Slack Notification System",
        description: "Route different messages to Slack based on conditions",
        json: '{"nodes":[{"id":"webhook","name":"Webhook Trigger","type":"n8n-nodes-base.webhook","typeVersion":2,"position":[100,250],"parameters":{"authentication":"none","httpMethod":"POST","path":"slack-webhook"}},{"id":"switch","name":"Switch Node","type":"n8n-nodes-base.switch","typeVersion":1,"position":[400,250],"parameters":{"conditions":{"conditions":[{"name":"Success","value":"=\\"success\\"","operator":"equals"}]}}},{"id":"slack","name":"Send to Slack","type":"n8n-nodes-base.slack","typeVersion":1,"position":[700,250],"parameters":{"authentication":"slackApi","channel":"#general","text":"✅ Operation completed successfully"},"credentials":{"slackApi":{"id":"1","name":"Slack"}}}],"connections":{"webhook":{"main":[[{"node":"switch","branch":0,"type":"main","index":0}]]},"switch":{"main":[[{"node":"slack","branch":0,"type":"main","index":0}]]}}}',
        difficulty: 2
      },
      {
        day: 5,
        title: "Lead Management Workflow",
        description: "Complete workflow: Form → Sheets → Email → Slack",
        json: '{"nodes":[{"id":"webhook","name":"Webhook","type":"n8n-nodes-base.webhook","typeVersion":2,"position":[100,300],"parameters":{"authentication":"none","httpMethod":"POST","path":"leads"}},{"id":"sheets","name":"Google Sheets","type":"n8n-nodes-base.googleSheets","typeVersion":3,"position":[400,300],"parameters":{"authentication":"googleSheetsOAuth2","operation":"append","spreadsheetId":"1ABC123","sheetName":"Leads","values":"=\\"{{$json.name}},{{$json.email}},{{$json.phone}}\\""}},{"id":"email","name":"Send Email","type":"n8n-nodes-base.sendGrid","typeVersion":1,"position":[700,150],"parameters":{"authentication":"sendgridApi","subject":"Lead Received","toEmail":"=\\"{{$json.email}}\\"","message":"Thank you for your interest"}},{"id":"slack","name":"Notify Slack","type":"n8n-nodes-base.slack","typeVersion":1,"position":[700,450],"parameters":{"authentication":"slackApi","channel":"#leads","text":"📌 New lead: {{$json.name}} - {{$json.email}}"}}],"connections":{"webhook":{"main":[[{"node":"sheets","branch":0,"type":"main","index":0}]]},"sheets":{"main":[[{"node":"email","branch":0,"type":"main","index":0},{"node":"slack","branch":0,"type":"main","index":0}]]}}}',
        difficulty: 3
      },
      {
        day: 6,
        title: "Invoice Generation",
        description: "Generate invoices from form submissions",
        json: '{"nodes":[{"id":"form","name":"Form Trigger","type":"n8n-nodes-base.formTrigger","typeVersion":1,"position":[100,300],"parameters":{"fields":{"fields":[{"name":"clientName","type":"text"},{"name":"amount","type":"number"},{"name":"description","type":"text"}]}}},{"id":"set","name":"Format Data","type":"n8n-nodes-base.set","typeVersion":1,"position":[400,300],"parameters":{"assignments":{"assignments":[{"name":"invoiceNumber","value":"=\\"INV-\\" + Date.now()"},{"name":"total","value":"={{$json.amount}}"},{"name":"date","value":"={{new Date().toLocaleDateString()}}"}]}}},{"id":"email","name":"Send Invoice","type":"n8n-nodes-base.sendGrid","typeVersion":1,"position":[700,300],"parameters":{"authentication":"sendgridApi","subject":"Invoice {{$json.invoiceNumber}}","toEmail":"=\\"{{$json.clientEmail}}\\"","message":"Invoice for {{$json.description}} - {{$json.total}}"}}],"connections":{"form":{"main":[[{"node":"set","branch":0,"type":"main","index":0}]]},"set":{"main":[[{"node":"email","branch":0,"type":"main","index":0}]]}}}',
        difficulty: 3
      },
      {
        day: 7,
        title: "Multi-Source Report Aggregation",
        description: "Combine data from multiple sources and send report",
        json: '{"nodes":[{"id":"schedule","name":"Daily Schedule","type":"n8n-nodes-base.scheduleTrigger","typeVersion":1,"position":[100,250],"parameters":{"rule":{"interval":[1],"triggerAtHour":9}}},{"id":"sheets1","name":"Get Sales Data","type":"n8n-nodes-base.googleSheets","typeVersion":3,"position":[400,100],"parameters":{"authentication":"googleSheetsOAuth2","operation":"read","spreadsheetId":"1ABC123","sheetName":"Sales"}},{"id":"sheets2","name":"Get Leads Data","type":"n8n-nodes-base.googleSheets","typeVersion":3,"position":[400,350],"parameters":{"authentication":"googleSheetsOAuth2","operation":"read","spreadsheetId":"1ABC123","sheetName":"Leads"}},{"id":"merge","name":"Merge Data","type":"n8n-nodes-base.set","typeVersion":1,"position":[700,225],"parameters":{"assignments":{"assignments":[{"name":"salesCount","value":"={{$json.length}}"},{"name":"leadsCount","value":"={{$json.length}}"}]}}},{"id":"email","name":"Send Report","type":"n8n-nodes-base.sendGrid","typeVersion":1,"position":[1000,225],"parameters":{"authentication":"sendgridApi","subject":"Daily Report","toEmail":"manager@example.com","message":"Sales: {{$json.salesCount}}, Leads: {{$json.leadsCount}}"}}],"connections":{"schedule":{"main":[[{"node":"sheets1","branch":0,"type":"main","index":0},{"node":"sheets2","branch":0,"type":"main","index":0}]]},"sheets1":{"main":[[{"node":"merge","branch":0,"type":"main","index":0}]]},"sheets2":{"main":[[{"node":"merge","branch":0,"type":"main","index":0}]]},"merge":{"main":[[{"node":"email","branch":0,"type":"main","index":0}]]}}}',
        difficulty: 3
      }
    ],
    setupGuides: [
      {
        title: "N8N Installation Guide",
        steps: [
          "Go to n8n.io and sign up for free account",
          "Choose your preferred deployment (cloud or self-hosted)",
          "Complete email verification",
          "Access your N8N dashboard",
          "Explore the available nodes and integrations"
        ],
        icon: "🚀"
      },
      {
        title: "Google OAuth Setup",
        steps: [
          "Go to Google Cloud Console (console.cloud.google.com)",
          "Create a new project",
          "Enable Google Sheets API",
          "Create OAuth 2.0 credentials (Desktop app)",
          "Copy Client ID and Secret",
          "Add credentials to N8N Google Sheets node"
        ],
        icon: "🔐"
      },
      {
        title: "Slack Integration Setup",
        steps: [
          "Go to api.slack.com/apps",
          "Create New App",
          "Select 'From scratch'",
          "Enter app name and workspace",
          "Navigate to 'OAuth & Permissions'",
          "Add required scopes",
          "Install app to workspace",
          "Copy Bot Token and add to N8N"
        ],
        icon: "💬"
      },
      {
        title: "Webhook Configuration",
        steps: [
          "Create Webhook node in N8N",
          "Copy the provided webhook URL",
          "Configure authentication if needed",
          "Test webhook with curl or Postman",
          "Verify data is received in N8N",
          "Configure response format"
        ],
        icon: "🪝"
      },
      {
        title: "Email Setup (Gmail SMTP)",
        steps: [
          "Enable 2-Factor Authentication on Gmail",
          "Generate App Password (not regular password)",
          "Go to N8N Gmail/Email node",
          "Select SMTP as authentication method",
          "Enter email: your@gmail.com",
          "Enter SMTP server: smtp.gmail.com:587",
          "Paste App Password as password"
        ],
        icon: "📧"
      }
    ]
  }
}

// DOM Helpers
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

/**
 * Initialize the application with landing page
 */
async function initializeApp() {
  try {
    console.log('🚀 Initializing Vidana N8N Bootcamp...')
    
    if (appState.isInitialized) {
      console.log('ℹ️ App already initialized, skipping');
      return;
    }
    
    // Check if user is already logged in via Supabase
    const { getCurrentUser: getSupabaseUser } = await import('./supabase-config.js');
    const user = await getSupabaseUser();
    
    if (user) {
      console.log('✅ User logged in:', user.email)
      setCurrentUser(user);
      await loadUserProgress();
      navigateTo('/dashboard');
    } else {
      console.log('ℹ️ No user logged in, showing landing page')
      navigateTo('/');
    }
    
    appState.isInitialized = true;
  } catch (error) {
    console.error('❌ Error initializing app:', error)
    navigateTo('/');
  }
}

/**
 * Render modern landing page
 */
function renderLandingPage() {
  const app = $('#app');
  app.innerHTML = `
    <div class="landing-container">
      <div class="animated-bg">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
        <div class="grid"></div>
      </div>
      
      <div class="landing-content">
        <h1 class="landing-title">Vidana N8N BootCamp</h1>
        <p class="landing-subtitle">Master Modern Automation</p>
        <p class="landing-description">
          Join our comprehensive bootcamp and learn to build powerful automation workflows 
          with N8N. Master integration, data transformation, and real-world automation patterns.
        </p>
        <div class="landing-cta">
          <button class="btn-primary" onclick="window.goToLogin()">
            Get Started
          </button>
          <button class="btn-secondary" onclick="window.scrollToFeatures()">
            Learn More
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render login screen with Google Auth and email/password fallback
 */
function renderLoginScreen() {
  const app = $('#app');
  app.innerHTML = `
    <div class="login-container">
      <div class="login-card">
        <h1>🚀 Welcome Back</h1>
        <p>Continue to Vidana N8N BootCamp</p>
        
        <button class="btn-google" onclick="window.handleGoogleLogin()">
          🔐 Sign in with Google
        </button>
        
        <div class="login-info">
          <h3>Or use email & password</h3>
          <input type="email" id="email" placeholder="your@email.com" 
                 style="width: 100%; padding: 12px 16px; margin-bottom: 12px; background: rgba(100, 116, 139, 0.1); border: 1px solid rgba(148, 163, 184, 0.3); color: #e4e9f1; border-radius: 8px; font-size: 14px;">
          <input type="password" id="password" placeholder="Password" 
                 style="width: 100%; padding: 12px 16px; margin-bottom: 16px; background: rgba(100, 116, 139, 0.1); border: 1px solid rgba(148, 163, 184, 0.3); color: #e4e9f1; border-radius: 8px; font-size: 14px;">
          <button onclick="window.handleEmailLogin()" 
                  style="width: 100%; padding: 12px 16px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; margin-bottom: 10px; font-size: 14px; transition: all 0.3s;">
            Login
          </button>
          <button onclick="window.handleEmailSignup()" 
                  style="width: 100%; padding: 12px 16px; background: rgba(34, 197, 94, 0.15); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 14px; transition: all 0.3s;">
            Create Account
          </button>
        </div>
        
        <ul style="text-align: left; margin-top: 20px; list-style: none;">
          <li style="color: #94a3b8; font-size: 13px; margin-bottom: 8px; padding-left: 20px; position: relative;">
            <span style="position: absolute; left: 0; color: #22c55e;">✓</span>
            Track daily progress
          </li>
          <li style="color: #94a3b8; font-size: 13px; margin-bottom: 8px; padding-left: 20px; position: relative;">
            <span style="position: absolute; left: 0; color: #22c55e;">✓</span>
            Take learning notes
          </li>
          <li style="color: #94a3b8; font-size: 13px; margin-bottom: 8px; padding-left: 20px; position: relative;">
            <span style="position: absolute; left: 0; color: #22c55e;">✓</span>
            View performance stats
          </li>
          <li style="color: #94a3b8; font-size: 13px; margin-bottom: 8px; padding-left: 20px; position: relative;">
            <span style="position: absolute; left: 0; color: #22c55e;">✓</span>
            Export your data
          </li>
        </ul>
      </div>
    </div>
  `;
}

/**
 * Render main application dashboard
 */
function renderMainApp() {
  // Protected route check
  if (!requireAuth()) return;
  
  const app = $('#app');
  const user = appState.currentUser;
  const progress = appState.userProgress;
  const completedCount = progress.completedTasks.filter(t => t).length;
  const progressPercent = Math.round((completedCount / 9) * 100);
  
  app.innerHTML = `
    <div class="app-container">
      <!-- Header -->
      <div class="app-header">
        <div class="header-content">
          <h1>Vidana N8N BootCamp</h1>
          <p>Welcome, ${user.email} • ${completedCount}/9 Days Complete</p>
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
        <button class="tab-btn" onclick="window.switchTab('resources')">
          📖 Resources
        </button>
      </div>
      
      <!-- Tabs Content -->
      <div class="tabs-content">
        <!-- Learning Path Tab -->
        <div id="learning" class="tab-pane active">
          <h2>📚 Your Learning Path</h2>
          <div class="learning-grid">
            ${BOOTCAMP.days.map((item, index) => `
              <div class="day-card ${progress.completedTasks[index] ? 'completed' : ''}">
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
                    ${progress.completedTasks[index] ? 'checked' : ''}
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
              const notes = progress.taskNotes[`day-${index + 1}`] || '';
              const isCompleted = progress.completedTasks[index];
              return `
                <div class="assessment-item">
                  <div class="assessment-header">
                    <div>
                      <h3>Day ${item.day}: ${item.title}</h3>
                      <p style="font-size: 12px; color: #94a3b8; margin-top: 4px;">
                        ${item.topics.join(' • ')}
                      </p>
                    </div>
                    <span class="status ${isCompleted ? 'done' : 'pending'}">
                      ${isCompleted ? '✓ Done' : '○ Pending'}
                    </span>
                  </div>
                  
                  <div class="assessment-homework">
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
              <div class="stat-number">${Object.keys(progress.taskNotes).length}</div>
              <div class="stat-label">Notes Taken</div>
            </div>
          </div>
          
          <div class="chart-container">
            <h3>📊 Progress by Week</h3>
            <div class="chart">
              <div class="chart-bar">
                <div class="bar-label">Week 1 (Days 1-3)</div>
                <div class="bar-container">
                  <div class="bar-fill" style="width: ${(progress.completedTasks.slice(0, 3).filter(t => t).length / 3) * 100}%"></div>
                </div>
                <div class="bar-text">${progress.completedTasks.slice(0, 3).filter(t => t).length}/3 complete</div>
              </div>
              <div class="chart-bar">
                <div class="bar-label">Week 2 (Days 4-6)</div>
                <div class="bar-container">
                  <div class="bar-fill" style="width: ${(progress.completedTasks.slice(3, 6).filter(t => t).length / 3) * 100}%"></div>
                </div>
                <div class="bar-text">${progress.completedTasks.slice(3, 6).filter(t => t).length}/3 complete</div>
              </div>
              <div class="chart-bar">
                <div class="bar-label">Week 3 (Days 7-9)</div>
                <div class="bar-container">
                  <div class="bar-fill" style="width: ${(progress.completedTasks.slice(6, 9).filter(t => t).length / 3) * 100}%"></div>
                </div>
                <div class="bar-text">${progress.completedTasks.slice(6, 9).filter(t => t).length}/3 complete</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Export Tab -->
        <div id="export" class="tab-pane">
          <h2>💾 Export Your Data</h2>
          <p style="margin-bottom: 20px; color: #94a3b8;">Download your progress and notes in your preferred format.</p>
          <div class="export-options">
            <button class="btn-export" onclick="window.handleExportJSON()">
              📄 Export as JSON
            </button>
            <button class="btn-export" onclick="window.handleExportCSV()">
              📊 Export as CSV
            </button>
          </div>
        </div>
        
        <!-- Resources Tab -->
        <div id="resources" class="tab-pane">
          <h2>📖 Learning Resources</h2>
          
          <!-- Resources Navigation -->
          <div class="resource-tabs">
            <button class="resource-tab-btn active" onclick="window.switchResourceTab('tutorials')" style="padding: 12px 20px; background: none; border: none; border-bottom: 3px solid #6366f1; font-size: 13px; font-weight: 600; color: #6366f1; cursor: pointer; transition: all 0.3s; text-transform: uppercase; letter-spacing: 0.5px;">
              🎥 Video Tutorials
            </button>
            <button class="resource-tab-btn" onclick="window.switchResourceTab('workflows')" style="padding: 12px 20px; background: none; border: none; border-bottom: 3px solid transparent; font-size: 13px; font-weight: 600; color: #94a3b8; cursor: pointer; transition: all 0.3s; text-transform: uppercase; letter-spacing: 0.5px;">
              ⚙️ Workflows
            </button>
            <button class="resource-tab-btn" onclick="window.switchResourceTab('guides')" style="padding: 12px 20px; background: none; border: none; border-bottom: 3px solid transparent; font-size: 13px; font-weight: 600; color: #94a3b8; cursor: pointer; transition: all 0.3s; text-transform: uppercase; letter-spacing: 0.5px;">
              📚 Setup Guides
            </button>
          </div>
          
          <!-- Tutorials -->
          <div id="resource-tutorials" class="resource-content" style="display: block;">
            ${BOOTCAMP.resources.tutorials.map(tut => `
              <div style="margin-bottom: 24px; border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 12px; padding: 20px; background: rgba(99, 102, 241, 0.05);">
                <h3 style="color: #f1f5f9; margin-bottom: 16px;">📺 Day ${tut.day}: ${tut.title}</h3>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                  ${tut.youtube.map(vid => `
                    <a href="${vid.url}" target="_blank" style="
                      display: flex;
                      align-items: center;
                      gap: 12px;
                      padding: 12px 16px;
                      background: rgba(30, 31, 46, 0.6);
                      border: 1px solid rgba(99, 102, 241, 0.2);
                      border-radius: 8px;
                      text-decoration: none;
                      color: #6366f1;
                      font-size: 14px;
                      font-weight: 600;
                      transition: all 0.3s;
                    " onmouseover="this.style.background='rgba(99, 102, 241, 0.15)'; this.style.borderColor='rgba(99, 102, 241, 0.5)'" onmouseout="this.style.background='rgba(30, 31, 46, 0.6)'; this.style.borderColor='rgba(99, 102, 241, 0.2)'">
                      ▶️ ${vid.title}
                    </a>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
          
          <!-- Workflows -->
          <div id="resource-workflows" class="resource-content" style="display: none;">
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px;">
              ${BOOTCAMP.resources.workflows.map((wf, idx) => `
                <div style="border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 12px; padding: 20px; background: linear-gradient(135deg, rgba(30, 31, 46, 0.6) 0%, rgba(22, 25, 43, 0.6) 100%); transition: all 0.3s; display: flex; flex-direction: column;">
                  <div style="flex: 1;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                      <h3 style="color: #f1f5f9; font-size: 16px;">⚙️ ${wf.title}</h3>
                      <div style="background: ${wf.difficulty === 1 ? 'rgba(34, 197, 94, 0.15)' : wf.difficulty === 2 ? 'rgba(251, 146, 60, 0.15)' : 'rgba(239, 68, 68, 0.15)'}; color: ${wf.difficulty === 1 ? '#22c55e' : wf.difficulty === 2 ? '#fb923c' : '#ef4444'}; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; border: 1px solid ${wf.difficulty === 1 ? 'rgba(34, 197, 94, 0.3)' : wf.difficulty === 2 ? 'rgba(251, 146, 60, 0.3)' : 'rgba(239, 68, 68, 0.3)'}>
                        Level ${wf.difficulty}
                      </div>
                    </div>
                    <p style="color: #94a3b8; font-size: 13px; line-height: 1.6;">${wf.description}</p>
                  </div>
                  <div style="display: flex; gap: 10px; margin-top: 16px;">
                    <button onclick="window.copyWorkflowJSON('${wf.json.replace(/'/g, "\\'")}')" style="
                      flex: 1;
                      padding: 10px 12px;
                      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                      color: white;
                      border: none;
                      border-radius: 8px;
                      cursor: pointer;
                      font-size: 12px;
                      font-weight: 600;
                      transition: all 0.3s;
                    " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                      📋 Copy JSON
                    </button>
                    <button onclick="window.downloadWorkflowJSON('${wf.title.replace(/'/g, "\\'")}', '${wf.json.replace(/'/g, "\\'")}')" style="
                      flex: 1;
                      padding: 10px 12px;
                      background: rgba(34, 197, 94, 0.15);
                      color: #22c55e;
                      border: 1px solid rgba(34, 197, 94, 0.3);
                      border-radius: 8px;
                      cursor: pointer;
                      font-size: 12px;
                      font-weight: 600;
                      transition: all 0.3s;
                    " onmouseover="this.style.background='rgba(34, 197, 94, 0.25)'" onmouseout="this.style.background='rgba(34, 197, 94, 0.15)'">
                      ⬇️ Download
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          
          <!-- Setup Guides -->
          <div id="resource-guides" class="resource-content" style="display: none;">
            ${BOOTCAMP.resources.setupGuides.map(guide => `
              <div style="margin-bottom: 24px; border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 12px; padding: 24px; background: rgba(99, 102, 241, 0.05);">
                <h3 style="color: #f1f5f9; margin-bottom: 16px; font-size: 18px;">${guide.icon} ${guide.title}</h3>
                <ol style="margin-left: 20px; color: #cbd5e1; font-size: 14px; line-height: 2;">
                  ${guide.steps.map(step => `<li style="margin-bottom: 8px;">${step}</li>`).join('')}
                </ol>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    
    <div id="save-status" style="
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 12px 20px;
      background: linear-gradient(135deg, #22c55e 0%, #10b981 100%);
      color: white;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      opacity: 0;
      transition: opacity 0.3s;
      pointer-events: none;
      box-shadow: 0 8px 20px rgba(34, 197, 94, 0.3);
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
  if (!requireAuth()) return;
  const progress = appState.userProgress;
  progress.completedTasks[index] = !progress.completedTasks[index];
  console.log(`✓ Day ${index + 1} toggled:`, progress.completedTasks[index]);
  autoSaveProgress();
  renderMainApp();
}

/**
 * Update day notes
 */
function updateDayNotes(index, notes) {
  if (!requireAuth()) return;
  const progress = appState.userProgress;
  progress.taskNotes[`day-${index + 1}`] = notes;
  console.log(`✏️ Notes updated for Day ${index + 1}`);
  autoSaveProgress();
}

/**
 * Auto-save progress with debounce
 */
function autoSaveProgress() {
  // Clear existing timeout
  const oldTimeout = getAutoSaveTimeout();
  if (oldTimeout) clearTimeout(oldTimeout);
  
  // Set new timeout
  const newTimeout = setTimeout(async () => {
    try {
      const user = appState.currentUser;
      if (!user || !user.id) {
        console.error('❌ Not logged in, cannot save');
        return;
      }
      
      console.log('💾 Auto-saving progress...');
      const progress = appState.userProgress;
      const completed = progress.completedTasks.filter(t => t).length;
      const progressPercent = Math.round((completed / 9) * 100);
      
      const result = await saveProgress(user.id, {
        ...progress,
        progressPercent: progressPercent,
        email: user.email
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
  
  setAutoSaveTimeout(newTimeout);
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
    
    const user = appState.currentUser;
    if (!user || !user.id) {
      console.log('ℹ️ No user ID, skipping load');
      return;
    }
    
    const result = await loadProgress(user.id);
    
    if (result.success && result.data) {
      setUserProgress({
        completedTasks: result.data.completed_tasks || Array(9).fill(false),
        taskNotes: result.data.task_notes || {},
        progressPercent: result.data.progress_percent || 0,
        cohort: result.data.cohort || 'default'
      });
      console.log('✅ Progress loaded successfully:', appState.userProgress);
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
      setCurrentUser(result.user);
      await loadUserProgress();
      navigateTo('/dashboard');
    } else {
      alert('Google login failed. Please use email/password instead.');
    }
  } catch (error) {
    console.error('Google login error:', error);
    alert('Error during Google login: ' + error.message);
  }
};

window.goToLogin = function() {
  navigateTo('/login');
};

window.scrollToFeatures = function() {
  alert('Feature information: Complete bootcamp with progress tracking, assessments, analytics, and resources!');
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
      setCurrentUser(result.user);
      await loadUserProgress();
      navigateTo('/dashboard');
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
      setCurrentUser(result.user);
      await loadUserProgress();
      navigateTo('/dashboard');
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
    
    // Call Supabase sign out
    try {
      const result = await signOut();
      if (!result.success) {
        console.warn('⚠️ Supabase logout warning:', result.error);
      }
    } catch (error) {
      console.warn('⚠️ Supabase logout error:', error);
    }
    
    // Clear app state
    setCurrentUser(null);
    setUserProgress({
      completedTasks: Array(9).fill(false),
      taskNotes: {},
      progressPercent: 0,
      cohort: 'default'
    });
    
    // Clear auto-save timeout
    const timeout = getAutoSaveTimeout();
    if (timeout) clearTimeout(timeout);
    setAutoSaveTimeout(null);
    
    console.log('✅ Logout successful, redirecting to landing page');
    navigateTo('/');
  } catch (error) {
    console.error('❌ Logout error:', error);
    // Force navigate to landing even if error occurs
    navigateTo('/');
  }
};

window.switchTab = switchTab;
window.toggleDay = toggleDay;
window.updateDayNotes = updateDayNotes;
window.autoSaveProgress = autoSaveProgress;

window.handleExportJSON = async function() {
  try {
    const user = appState.currentUser;
    if (!user) {
      alert('Please log in first');
      return;
    }
    const result = await exportProgressJSON(user.id, appState.userProgress);
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
    const user = appState.currentUser;
    if (!user) {
      alert('Please log in first');
      return;
    }
    const result = await exportProgressCSV(user.id, appState.userProgress);
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

/**
 * Switch resource tabs
 */
window.switchResourceTab = function(tabName) {
  // Hide all resource content
  document.querySelectorAll('.resource-content').forEach(el => el.style.display = 'none');
  
  // Remove active class from all buttons
  document.querySelectorAll('.resource-tab-btn').forEach(btn => {
    btn.style.borderBottomColor = 'transparent';
    btn.style.color = '#94a3b8';
  });
  
  // Show selected content
  const content = document.getElementById(`resource-${tabName}`);
  if (content) {
    content.style.display = 'block';
    // Find and highlight the clicked button
    event.target.style.borderBottomColor = '#6366f1';
    event.target.style.color = '#6366f1';
  }
};

/**
 * Copy workflow JSON to clipboard
 */
window.copyWorkflowJSON = function(json) {
  try {
    navigator.clipboard.writeText(json).then(() => {
      alert('✓ Workflow JSON copied to clipboard!');
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = json;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('✓ Workflow JSON copied to clipboard!');
    });
  } catch (error) {
    alert('Error copying to clipboard: ' + error.message);
  }
};

/**
 * Download workflow JSON as file
 */
window.downloadWorkflowJSON = function(fileName, json) {
  try {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(json));
    element.setAttribute('download', `${fileName.replace(/\s+/g, '-').toLowerCase()}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    alert('✓ Workflow downloaded! Import it in N8N');
  } catch (error) {
    alert('Error downloading file: ' + error.message);
  }
};

// Start the app
initializeApp();
