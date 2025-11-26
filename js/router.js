import { appState, getCurrentUser, setCurrentCategory } from './state.js';


const routes = {
  "/": {
    protected: false,
    render: async () =>
      (await import("./pages/landing.js")).renderLandingPage(),
  },
  "/login": {
    protected: false,
    render: async () => (await import("./pages/login.js")).renderLoginScreen(),
  },
  "/dashboard": {
    protected: true,
    render: async () =>
      (await import("./pages/dashboard.js")).renderDashboard("n8n"),
  },
  
    '/prompt-engineering': { protected: true, render: async () => (await import('./pages/prompt-engineering.page.js')).renderPromptEngineeringPage() },
  
    '/vibe-coding': { protected: true, render: async () => (await import('./pages/vibe-coding.page.js')).renderVibeCodingPage() },
  
    '/ai-tools': { protected: true, render: async () => (await import('./pages/ai-tools.page.js')).renderAIToolsPage() },
  
    '/n8n': { protected: true, render: async () => (await import('./pages/n8n.page.js')).renderN8NPage() },
  
  '/admin': { protected: true, adminOnly: true, render: async () => (await import('./pages/admin.js')).renderAdminDashboard() },
};

export function navigateTo(path) {
    window.history.pushState({}, path, window.location.origin + path);
    handleRoute(path);
}

export async function handleRoute(path) {
  try {
    // Normalize (remove trailing slash)
    path = path.split("?")[0].replace(/\/+$/, "") || "/";

    const route = routes[path] || routes["/"];

    // Show loading UI (optional)
    const app = document.querySelector("#app");
    if (app) app.innerHTML = `<div class="loading">Loading...</div>`;

    // -----------------------------
    // 1. Load user (always async!)
    // -----------------------------
    const user = await getCurrentUser();

    // -----------------------------
    // 2. Route protection
    // -----------------------------
    if (route.protected && !user) {
      return navigateTo("/login");
    }

    if (route.adminOnly && user?.role !== "admin") {
      return navigateTo("/dashboard");
    }

    // -----------------------------
    // 3. Render the page (lazy render)
    // -----------------------------
    await route.render();
  } catch (err) {
    console.error("Route error:", err);

    const app = document.querySelector("#app");
    if (app) {
      app.innerHTML = `
        <div class="error-screen">
          <h2>Something went wrong</h2>
          <p>${err.message || "Unknown error"}</p>
        </div>
      `;
    }
  }
}


// Handle browser back/forward
window.onpopstate = () => {
    handleRoute(window.location.pathname);
};
