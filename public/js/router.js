// router.js
// router.js (top imports)
import { getCurrentUser } from "./services/supabase.js";

// static imports from public/js/pages (must be deployed under public/js/pages/)
import { renderLoginScreen } from "/js/pages/login.page.js";
import { renderLandingPage } from "/js/pages/landing.page.js";
import { renderNotFound } from "/js/pages/notfound.page.js";
import { renderDashboard } from "/js/pages/dashboard.page.js";
import { renderAdmin } from "/js/pages/admin.page.js";
import { renderN8NPage } from "/js/pages/n8n.page.js";
import { renderVibeCodingPage } from "/js/pages/vibe-coding.page.js";
import { renderPromptEngineeringPage } from "/js/pages/prompt-engineering.page.js";
import { renderAIToolsPage } from "/js/pages/ai-tools.page.js";


/* -------------------------
   Route Definitions
------------------------- */

/**
 * ROUTES
 * - render should be an async function that renders the page when awaited.
 * - protected: requires authentication
 * - adminOnly: requires user.role === 'admin'
 */
const routes = {
  "/": {
    protected: false,
    render: async () => renderLandingPage(),
  },
  "/login": {
    protected: false,
    render: async () => renderLoginScreen(),
  },
  "/dashboard": {
    protected: true,
    render: async () => renderDashboard(),
  },

  // Curriculums (lazy)
  "/n8n": {
    protected: true,
    render: async () => renderN8NPage(),
  },
  "/vibe-coding": {
    protected: true,
    render: async () => renderVibeCodingPage(),
  },
  "/prompt-engineering": {
    protected: true,
    render: async () => renderPromptEngineeringPage(),
  },
  "/ai-tools": {
    protected: true,
    render: async () => renderAIToolsPage(),
  },

  // admin example route (replace with your actual admin page)
  "/admin": {
    protected: true,
    adminOnly: true,
    render: async () => renderAdmin(),
  },

  // 404 fallback
  "/404": {
    protected: false,
    render: async () => renderNotFound(),
  },
};

/* -------------------------
   Helpers
   ------------------------- */

// Normalize user-supplied path into route key like '/dashboard'
export function normalizePath(path) {
  if (!path) return "/";
  // If it's a hash like '#/dashboard' or '#dashboard', strip the '#'
  if (path.startsWith("#")) path = path.replace(/^#\/?/, "");
  // If it contains origin or full URL, extract pathname+hash part
  try {
    const url = new URL(path, window.location.href);
    // prefer hash when present (#/dashboard), otherwise pathname
    if (url.hash)
      return (url.hash.replace(/^#\/?/, "") || "/").startsWith("/")
        ? url.hash.replace(/^#\/?/, "")
        : "/" + url.hash.replace(/^#\/?/, "");
    return url.pathname || "/" || "/";
  } catch (e) {
    // not a full URL: ensure leading slash
    if (!path.startsWith("/")) path = "/" + path;
    // collapse multiple slashes
    return path.replace(/\/+/g, "/");
  }
}

// Read route from current location (prefers hash)
export function getRouteFromLocation() {
  const rawHash = window.location.hash || "";
  if (rawHash) {
    const cleaned = rawHash.replace(/^#\/?/, "");
    return cleaned ? (cleaned.startsWith("/") ? cleaned : "/" + cleaned) : "/";
  }
  const path = window.location.pathname || "/";
  return path;
}

/* -------------------------
   Navigation API
   ------------------------- */

/**
 * navigateTo(path)
 * - path: '/dashboard' or '#/dashboard' or '/#dashboard' or full URL
 * This function updates the URL using hash if the app currently uses hash routing.
 */
export function navigateTo(path) {
  const normalized = normalizePath(String(path || "/"));
  const usesHash = !!window.location.hash;

  if (usesHash) {
    // Set hash without triggering additional history entry weirdness
    const hash = normalized.startsWith("/")
      ? normalized.replace(/^\//, "")
      : normalized;
    // Use location.hash to allow back/forward to work naturally
    window.location.hash = hash ? "#" + hash : "#/";
  } else {
    // push state for pathname routing
    const url = normalized;
    if (window.location.pathname !== url) {
      history.pushState({}, "", url);
      // trigger route handling
      handleRoute(url).catch((err) =>
        console.error("navigateTo handleRoute error", err)
      );
    } else {
      // still call handleRoute to re-render
      handleRoute(url).catch((err) =>
        console.error("navigateTo handleRoute error", err)
      );
    }
  }
}
// expose for pages that call window.navigateTo(...) instead of importing
if (typeof window !== 'undefined') {
  window.navigateTo = navigateTo;
}

/* -------------------------
   Main route handler
   ------------------------- */

export async function handleRoute(path) {
  try {
    // Normalize & derive route key
    const routeKey = normalizePath(path ?? getRouteFromLocation());

    const route = routes[routeKey] || routes["/404"] || routes["/"];

    // show loading UI
    const app = document.querySelector("#app");
    if (app) app.innerHTML = `<div class="loading">Loading…</div>`;

    // Load current user (async)
    const user = await getCurrentUser();

    // Protection checks
    if (route.protected && !user) {
      // redirect to login
      navigateTo("/login");
      return;
    }

    if (route.adminOnly && user?.role !== "admin") {
      // non-admins go to dashboard
      navigateTo("/dashboard");
      return;
    }

    // finally render the route
    await route.render();
  } catch (err) {
    console.error("Route error:", err);
    const app = document.querySelector("#app");
    if (app) {
      app.innerHTML = `
        <div class="error-screen">
          <h2>Something went wrong</h2>
          <pre style="white-space:pre-wrap">${
            err && err.message ? err.message : String(err)
          }</pre>
        </div>
      `;
    }
  }
}

/* -------------------------
   Auto-handle popstate & initial load
   ------------------------- */

// Handle back/forward (history API)
window.addEventListener("popstate", async () => {
  try {
    await handleRoute(getRouteFromLocation());
  } catch (e) {
    console.error("popstate handler error", e);
  }
});

// Optional: handle hashchange explicitly
window.addEventListener("hashchange", async () => {
  try {
    await handleRoute(getRouteFromLocation());
  } catch (e) {
    console.error("hashchange handler error", e);
  }
});

export default { navigateTo, handleRoute };
