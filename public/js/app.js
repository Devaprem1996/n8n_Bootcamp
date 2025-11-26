import { initSupabase, getCurrentUser } from "./services/supabase.js";
import { handleRoute, navigateTo } from "./router.js";
import { setCurrentUser } from "./state.js";

/**
 * Return a normalized route from current location.
 * Prefers hash routing when present (#/dashboard or #dashboard).
 * Returns a string that starts with '/', e.g. '/dashboard'
 */
function getRouteFromLocation() {
  const rawHash = window.location.hash || "";
  if (rawHash) {
    const cleaned = rawHash.replace(/^#\/?/, "");
    return cleaned ? (cleaned.startsWith("/") ? cleaned : "/" + cleaned) : "/";
  }
  const path = window.location.pathname || "/";
  return path;
}

/**
 * Ensure a profiles row exists for the newly authenticated Supabase user.
 * This is a client-side fallback to create/upsert a profile row if your DB trigger
 * is not yet creating profiles automatically. Safe to keep even after trigger is fixed.
 */
async function ensureProfileForUser(supabaseUser) {
  try {
    if (!supabaseUser?.id) return { success: false, error: "no user id" };
    const sb = await initSupabase();

    const payload = {
      id: supabaseUser.id,
      email: supabaseUser.email ?? null,
      full_name:
        supabaseUser.user_metadata?.full_name ??
        supabaseUser.user_metadata?.name ??
        supabaseUser.raw_user_meta_data?.full_name ??
        supabaseUser.raw_user_meta_data?.name ??
        supabaseUser.email ??
        null,
      role: "intern",
      resume_url: null,
      cohort: "default",
    };

    const { data, error } = await sb
      .from("profiles")
      .upsert(payload, { onConflict: "id" })
      .select();

    if (error) {
      console.warn("Profile upsert failed (ensureProfileForUser):", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error("ensureProfileForUser error:", err);
    return { success: false, error: err.message || err };
  }
}

async function initApp() {
  console.log("🚀 Initializing Vidana Bootcamp Hub...");

  try {
    await initSupabase();

    // Called when Supabase auth state changes (OAuth redirect will trigger this)
    window.__onAuthChanged = async (supabaseUser) => {
      try {
        if (supabaseUser) {
          // ensure profile exists (client-side fallback)
          await ensureProfileForUser(supabaseUser);

          // fetch profile and full user object and set app state
          const full = await getCurrentUser();
          if (full) {
            setCurrentUser(full);
          }

          // Navigate to dashboard and render current route (handles hash)
          navigateTo("/dashboard");
          await handleRoute(getRouteFromLocation());
        } else {
          setCurrentUser(null);
          navigateTo("/login");
          await handleRoute(getRouteFromLocation());
        }
      } catch (e) {
        console.error("onAuthChanged handler error", e);
      }
    };
  } catch (error) {
    console.error("❌ Failed to initialize Supabase:", error);
    const app = document.getElementById("app");
    if (app) {
      app.innerHTML = `
        <div style="padding: 32px; text-align: center; color: #ef4444;">
          ⚠️ ${error.message || "Unable to connect to Supabase."}<br/>
          Confirm that SUPABASE_URL and SUPABASE_ANON_KEY are configured.
        </div>
      `;
    }
    return;
  }

  // If a session already exists, set the current user in app state
  try {
    const user = await getCurrentUser();
    if (user) {
      console.log("✅ User authenticated:", user.email);
      setCurrentUser(user);
    } else {
      console.log("ℹ️ No active session");
    }
  } catch (e) {
    console.error("Error while getting current user on init:", e);
  }

  // Handle initial route (prefers hash if present)
  try {
    await handleRoute(getRouteFromLocation());
  } catch (e) {
    console.error("Initial route handling error:", e);
  }

  // React to hash changes (back/forward, OAuth landing on hash)
  window.addEventListener("hashchange", async () => {
    try {
      await handleRoute(getRouteFromLocation());
    } catch (e) {
      console.error("hashchange handling error", e);
    }
  });

  // Also handle popstate for history API routes
  window.addEventListener("popstate", async () => {
    try {
      await handleRoute(getRouteFromLocation());
    } catch (e) {
      console.error("popstate handling error", e);
    }
  });
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", initApp);
