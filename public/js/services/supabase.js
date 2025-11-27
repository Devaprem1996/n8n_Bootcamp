/**
 * Supabase Configuration & Service
 * Handles authentication and database operations
 */

let supabase = null;
let supabaseConfigPromise = null;

const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvdnRyZHJtaXZteWdsYWZwb2p4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwMDk0MzcsImV4cCI6MjA3OTU4NTQzN30.P2eUq0MxyvX_5O0i4B1gjwjcvjbf9vy5lYl05AETHx8"
const SUPABASE_URL = "https://bovtrdrmivmyglafpojx.supabase.co"
// -------------------------------
// LOAD SUPABASE CONFIG
// -------------------------------
async function ensureSupabaseConfig() {
  if (SUPABASE_ANON_KEY && SUPABASE_URL) return;

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

    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
    const redirectTo = window.location.origin + "/#dashboard"; // <- land on hash route

    const { data, error } = await sb.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
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

    // Try the preferred select first (with cohort)
    const preferredSelect = "role, resume_url, full_name, email, cohort";
    let profile = null;

    const trySelect = async (sel) => {
      const res = await sb.from("profiles").select(sel).eq("id", authUser.id);
      // Supabase JS returns { data, error }
      if (res.error) throw res.error;
      // data may be an array
      if (Array.isArray(res.data)) return res.data[0] ?? null;
      return res.data ?? null;
    };

    try {
      profile = await trySelect(preferredSelect);
    } catch (err) {
      // If the error suggests a missing column, try a fallback select
      console.warn(
        "Profile select (with cohort) failed. Error:",
        err?.message || err
      );
      // Attempt fallback without cohort (safer)
      try {
        profile = await trySelect("role, resume_url, full_name, email");
      } catch (err2) {
        console.error(
          "Fallback profile select also failed:",
          err2?.message || err2
        );
        profile = null;
      }
    }

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
