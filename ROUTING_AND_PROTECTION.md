# Routing & Protected Routes Documentation

## Overview
The Vidana N8N BootCamp application now implements a robust routing system with protected routes, ensuring that only authenticated users can access specific pages.

## Architecture

### Route Types

#### 1. **Landing Page** (Unprotected)
- **Route ID**: `landing`
- **Protected**: ❌ No
- **Access**: Everyone
- **Features**:
  - Modern animated hero section
  - "Get Started" and "Learn More" buttons
  - Introduces Vidana N8N BootCamp

#### 2. **Login Page** (Unprotected)
- **Route ID**: `login`
- **Protected**: ❌ No
- **Access**: Only unauthenticated users
- **Features**:
  - Google OAuth login
  - Email/Password login
  - Account signup form
  - Dark theme UI

#### 3. **Main App** (Protected)
- **Route ID**: `main`
- **Protected**: ✅ Yes
- **Access**: Only authenticated users
- **Features**:
  - Learning path dashboard
  - Assessments
  - Performance analytics
  - Resources & workflows
  - Export data

### Route Configuration

```javascript
const routes = {
  'landing': { protectedRoute: false, render: renderLandingPage },
  'login': { protectedRoute: false, render: renderLoginScreen },
  'main': { protectedRoute: true, render: renderMainApp }
};
```

## Navigation System

### Primary Navigation Function

```javascript
function navigateTo(page) {
  const route = routes[page];
  
  if (!route) {
    console.error('Route not found:', page);
    navigateTo('landing');
    return;
  }
  
  // Check if route is protected and user is not authenticated
  if (route.protectedRoute && !appState.currentUser) {
    console.log('Attempting to access protected route without auth');
    navigateTo('login');
    return;
  }
  
  appState.currentPage = page;
  route.render();
}
```

### Protected Route Middleware

```javascript
function requireAuth() {
  if (!appState.currentUser) {
    console.log('Route requires authentication, redirecting to login');
    navigateTo('login');
    return false;
  }
  return true;
}
```

## State Management

### App State Object
```javascript
const appState = {
  currentUser: null,           // Currently logged-in user
  currentPage: 'landing',      // Current page route
  userProgress: {              // User's bootcamp progress
    completedTasks: Array(9).fill(false),
    taskNotes: {},
    progressPercent: 0,
    cohort: 'default'
  },
  saveTimeout: null,           // Auto-save debounce timeout
  isInitialized: false         // Initialization flag
};
```

### State Getter/Setter Functions

#### User Management
```javascript
function getCurrentUser() {
  return appState.currentUser;
}

function setCurrentUser(user) {
  appState.currentUser = user;
}
```

#### Progress Management
```javascript
function getUserProgress() {
  return appState.userProgress;
}

function setUserProgress(progress) {
  appState.userProgress = { ...appState.userProgress, ...progress };
}
```

#### Timeout Management
```javascript
function getAutoSaveTimeout() {
  return appState.saveTimeout;
}

function setAutoSaveTimeout(timeout) {
  appState.saveTimeout = timeout;
}
```

## Authentication Flow

### Login Flow
1. User arrives at landing page
2. Clicks "Get Started" → redirects to login
3. Enters credentials (email/password or Google)
4. Supabase authenticates user
5. User object saved to `appState.currentUser`
6. User progress loaded from database
7. `navigateTo('main')` renders protected dashboard

### Logout Flow
1. User clicks "Logout" button
2. `handleLogout()` is triggered
3. Supabase `signOut()` is called
4. `appState.currentUser` is set to `null`
5. Auto-save timeout is cleared
6. `navigateTo('landing')` redirects to landing page
7. Session is completely cleared

### Protected Page Access
1. Unauthenticated user attempts to access `/main` route
2. `requireAuth()` checks `appState.currentUser`
3. If `null`, redirects to login page
4. If authenticated, page renders normally

## Window Functions (Global Exports)

### Navigation
```javascript
window.navigateTo(page)          // Navigate to any route
window.goToLogin()               // Navigate to login
```

### Authentication
```javascript
window.handleGoogleLogin()       // Google OAuth login
window.handleEmailLogin()        // Email/password login
window.handleEmailSignup()       // Create account
window.handleLogout()            // Logout & redirect
```

### Dashboard Functions
```javascript
window.switchTab(tabName)        // Switch dashboard tabs
window.toggleDay(index)          // Mark day complete
window.updateDayNotes(index, notes)  // Save notes
window.autoSaveProgress()        // Auto-save to database
window.switchResourceTab(tabName) // Switch resource tabs
```

### Export Functions
```javascript
window.handleExportJSON()        // Export progress as JSON
window.handleExportCSV()         // Export progress as CSV
```

## Security Features

### 1. Protected Route Middleware
- Automatically redirects unauthenticated users to login
- Prevents direct access to protected pages without authentication

### 2. State Isolation
- User data stored in `appState` object
- Cleared on logout
- Prevents data leakage between sessions

### 3. Auto-Save Protection
- Only saves if user is authenticated
- Clears timeout on logout
- Prevents unauthorized data saves

### 4. Supabase Session Management
- Uses Supabase Auth for server-side authentication
- Session tokens managed by Supabase
- Logout calls Supabase `signOut()` to invalidate session

## User Flow Diagram

```
Landing Page (unprotected)
    ↓
  [Get Started]
    ↓
Login Page (unprotected)
    ↓
  [Login/Signup] → Supabase Auth
    ↓
  [Success] → Set appState.currentUser
    ↓
Load User Progress from Database
    ↓
navigateTo('main') 
    ↓
Main App Dashboard (protected)
    ├─ Learning Path
    ├─ Assessments
    ├─ Performance
    ├─ Export
    └─ Resources
    ↓
  [Logout Button]
    ↓
signOut() → Clear appState
    ↓
navigateTo('landing')
    ↓
Landing Page (unprotected)
```

## Best Practices

### 1. Always Use `navigateTo()` Instead of Direct Render Calls
```javascript
// ✅ Good
navigateTo('main');

// ❌ Bad
renderMainApp();
```

### 2. Check Authentication Before Protected Operations
```javascript
// ✅ Good
function protectedFunction() {
  if (!requireAuth()) return;
  // ... function logic
}

// ❌ Bad
function unprotectedFunction() {
  // Assumes user is authenticated
}
```

### 3. Use State Setters Instead of Direct Assignment
```javascript
// ✅ Good
setCurrentUser(user);
setUserProgress(progress);

// ❌ Bad
appState.currentUser = user;
appState.userProgress = progress;
```

### 4. Always Clear Timeouts on Logout
```javascript
// Handled automatically in handleLogout()
const timeout = getAutoSaveTimeout();
if (timeout) clearTimeout(timeout);
setAutoSaveTimeout(null);
```

## Troubleshooting

### Issue: User Gets Redirected to Login Unexpectedly
**Solution**: Check if `appState.currentUser` is being properly set after authentication
```javascript
console.log('Current user:', appState.currentUser);
```

### Issue: Logout Doesn't Clear Data
**Solution**: Ensure `setCurrentUser(null)` and `setUserProgress()` are called
```javascript
setCurrentUser(null);
setUserProgress({ /* reset */ });
```

### Issue: Protected Route Accessible Without Auth
**Solution**: Verify `requireAuth()` is called at start of protected function
```javascript
function protectedFunction() {
  if (!requireAuth()) return;  // Must be first line
  // ... rest of function
}
```

## Environment Variables

- `SUPABASE_URL`: Your Supabase project URL (set in index.html)
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key (set in index.html)

Both are required for authentication to work properly.

---

**Last Updated**: November 2025
**Status**: Production Ready ✅
