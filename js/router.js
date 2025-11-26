import { appState, getCurrentUser, setCurrentCategory } from './state.js';
import { renderLandingPage } from './pages/landing.js';
import { renderLoginScreen } from './pages/login.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderAdminDashboard } from './pages/admin.js';

const routes = {
    '/': { protected: false, render: renderLandingPage },
    '/login': { protected: false, render: renderLoginScreen },
    '/dashboard': { protected: true, render: () => renderDashboard('n8n') }, // Default to n8n
    '/n8n': { protected: true, render: () => { setCurrentCategory('n8n'); renderDashboard('n8n'); } },
    '/vibe-coding': { protected: true, render: () => { setCurrentCategory('vibe-coding'); renderDashboard('vibe-coding'); } },
    '/prompt-engineering': { protected: true, render: () => { setCurrentCategory('prompt-engineering'); renderDashboard('prompt-engineering'); } },
    '/ai-developments-tools': { protected: true, render: () => { setCurrentCategory('ai-developments-tools'); renderDashboard('ai-developments-tools'); } },
    '/admin': { protected: true, adminOnly: true, render: renderAdminDashboard }
};

export function navigateTo(path) {
    window.history.pushState({}, path, window.location.origin + path);
    handleRoute(path);
}

export function handleRoute(path) {
    const route = routes[path] || routes['/'];
    const user = getCurrentUser();

    if (route.protected && !user) {
        console.log('🔒 Redirecting to login');
        navigateTo('/login');
        return;
    }

    if (route.adminOnly && user?.role !== 'admin') {
        console.log('🔒 Admin only area');
        navigateTo('/dashboard');
        return;
    }

    route.render();
}

// Handle browser back/forward
window.onpopstate = () => {
    handleRoute(window.location.pathname);
};
