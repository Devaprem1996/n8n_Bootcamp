import { initSupabase, getCurrentUser } from './services/supabase.js';
import { handleRoute, navigateTo } from './router.js';
import { setCurrentUser } from './state.js';



async function initApp() {
    console.log('🚀 Initializing Vidana Bootcamp Hub...');

    try {
      await initSupabase();
      // inside initApp after initSupabase()
     window.__onAuthChanged = async (supabaseUser) => {
       try {
         if (supabaseUser) {
           // fetch profile and full user object
           const full = await getCurrentUser();
           if (full) {
             setCurrentUser(full);
           }
           // If you use hash routing, ensure you navigate to the dashboard hash
           navigateTo("/dashboard"); // or navigateTo('/#dashboard') depending on your router
           // Also force handleRoute to render current route if your router reads location.hash
           await handleRoute(window.location.hash.replace(/^#/, "") || "/");
         } else {
           setCurrentUser(null);
           navigateTo("/login");
         }
       } catch (e) {
         console.error("onAuthChanged handler error", e);
       }
     };
    } catch (error) {
        console.error('❌ Failed to initialize Supabase:', error);
        const app = document.getElementById('app');
        if (app) {
            app.innerHTML = `
                <div style="padding: 32px; text-align: center; color: #ef4444;">
                    ⚠️ ${error.message || 'Unable to connect to Supabase.'}<br/>
                    Confirm that SUPABASE_URL and SUPABASE_ANON_KEY are configured.
                </div>
            `;
        }
        return;
    }

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

