/**
 * Supabase Configuration & Service
 * Handles authentication and database operations
 */

let supabase = null;
let supabaseConfigPromise = null;

// -------------------------------
// LOAD SUPABASE CONFIG
// -------------------------------
async function ensureSupabaseConfig() {
  if (window.SUPABASE_URL && window.SUPABASE_ANON_KEY) return;

  if (!supabaseConfigPromise) {
    supabaseConfigPromise = (async () => {
      const response = await fetch("/api/config", { cache: "no-store" });

      if (!response.ok) {
        throw new Error("Unable to load Supabase configuration from server");
      }

      const { url, anonKey } = await response.json();
      if (!url || !anonKey) {
        throw new Error("Supabase configuration is incomplete on the server");
      }

      window.SUPABASE_URL = url;
      window.SUPABASE_ANON_KEY = anonKey;
    })().catch((err) => {
      supabaseConfigPromise = null;
      throw err;
    });
  }

  return supabaseConfigPromise;
}

// -------------------------------
// INIT SUPABASE
// -------------------------------
export async function initSupabase() {
  if (!supabase) {
    await ensureSupabaseConfig();

    const { createClient } = await import(
      "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.43.4/+esm"
    );

    supabase = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

    // OAuth redirect auth state listener
    supabase.auth.onAuthStateChange((event, session) => {
      window.__onAuthChanged?.(session?.user ?? null);
    });
  }

  return supabase;
}

// ============================================
// AUTHENTICATION
// ============================================

export async function signInWithGoogle() {
  try {
    const sb = await initSupabase();
    const { data, error } = await sb.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/",
        scopes: "openid profile email",
      },
    });

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error("❌ Google login error:", err);
    return { success: false, error: err.message };
  }
}

export async function signUpWithEmail(email, password) {
  try {
    const sb = await initSupabase();
    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error("❌ Sign up error:", err);
    return { success: false, error: err.message };
  }
}

export async function signInWithEmail(email, password) {
  try {
    const sb = await initSupabase();
    const { data, error } = await sb.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error("❌ Sign in error:", err);
    return { success: false, error: err.message };
  }
}

export async function signOut() {
  try {
    const sb = await initSupabase();
    const { error } = await sb.auth.signOut();
    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("❌ Sign out error:", error);
    return { success: false, error: error.message };
  }
}

// ============================================
// USER + PROFILE
// ============================================

export async function getCurrentUser() {
  try {
    const sb = await initSupabase();

    const { data: sessionData } = await sb.auth.getSession();
    if (!sessionData?.session) return null;

    const { data: userData } = await sb.auth.getUser();
    const authUser = userData?.user;
    if (!authUser) return null;

    // Fetch profile (role, resume_url, full_name, email, cohort)
    const { data: profile } = await sb
      .from("profiles")
      .select("role, resume_url, full_name, email, cohort")
      .eq("id", authUser.id)
      .maybeSingle();

    return {
      ...authUser,
      email: profile?.email ?? authUser.email,
      resume_url: profile?.resume_url ?? null,
      full_name: profile?.full_name ?? null,
      cohort: profile?.cohort ?? "default",
      role: profile?.role ?? "intern",
    };
  } catch (e) {
    console.error("❌ Get user error:", e);
    return null;
  }
}

// ============================================
// PROGRESS SAVE / LOAD
// ============================================

export async function saveProgress(internId, category, progressData) {
  try {
    const sb = await initSupabase();

    const payload = {
      intern_id: internId,
      category,
      user_email: progressData.email,
      completed_tasks: progressData.completedTasks ?? [],
      task_notes: progressData.taskNotes ?? {},
      progress_percent: progressData.progressPercent ?? 0,
      cohort: progressData.cohort ?? "default",
      last_updated: new Date().toISOString(),
    };

    const { data, error } = await sb
      .from("intern_progress")
      .upsert(payload, { onConflict: "intern_id, category" })
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("❌ Error saving progress:", error);
    return { success: false, error: error.message };
  }
}

// Load one category’s progress
export async function loadProgress(internId, category) {
  try {
    const sb = await initSupabase();

    const { data, error } = await sb
      .from("intern_progress")
      .select("*")
      .eq("intern_id", internId)
      .eq("category", category)
      .maybeSingle();

    if (error) throw error;

    if (!data) return { success: true, data: null };

    return {
      success: true,
      data: {
        ...data,
        completedTasks: data.completed_tasks ?? [],
        taskNotes: data.task_notes ?? {},
        progressPercent: data.progress_percent ?? 0,
      },
    };
  } catch (error) {
    console.error("❌ Error loading progress:", error);
    return { success: false, error: error.message };
  }
}

// ============================================
// ADMIN: ALL PROGRESS (clean & correct version)
// ============================================

export async function getAllInternsProgress() {
  try {
    const sb = await initSupabase();

    // Relational fetch: profiles + intern_progress[]
    const { data, error } = await sb
      .from("profiles")
      .select(
        "id, full_name, email, resume_url, role, cohort, intern_progress(*)"
      )
      .eq("role", "intern");

    if (error) throw error;

    return { success: true, data };
  } catch (err) {
    console.error("❌ Error loading interns progress:", err);
    return { success: false, error: err.message };
  }
}

// ============================================
// FILE UPLOAD
// ============================================

export async function uploadResume(file, userId) {
  try {
    const sb = await initSupabase();

    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}/resume.${fileExt}`;

    const { error: uploadError } = await sb.storage
      .from("resumes")
      .upload(fileName, file, { upsert: true });

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = sb.storage.from("resumes").getPublicUrl(fileName);

    await sb
      .from("profiles")
      .update({ resume_url: publicUrl })
      .eq("id", userId);

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error("❌ Error uploading resume:", error);
    return { success: false, error: error.message };
  }
}
