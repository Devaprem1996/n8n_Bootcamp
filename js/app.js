import { initSupabase, getCurrentUser } from './services/supabase.js';
import { handleRoute, navigateTo } from './router.js';
import { setCurrentUser } from './state.js';

async function initApp() {
    console.log('🚀 Initializing Vidana Bootcamp Hub...');

    await initSupabase();

    const user = await getCurrentUser();
    if (user) {
        console.log('✅ User authenticated:', user.email);
        setCurrentUser(user);
    } else {
        console.log('ℹ️ No active session');
    }

    // Handle initial route
    handleRoute(window.location.pathname);
}

// Initialize
document.addEventListener('DOMContentLoaded', initApp);

// Expose navigation for legacy onclicks if needed (though we try to avoid them)
window.navigateTo = navigateTo;
