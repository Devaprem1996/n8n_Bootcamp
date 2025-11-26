/**
 * Supabase Configuration & Service
 * Handles authentication and database operations
 */

// Get credentials from window object (set in index.html or via environment)
const SUPABASE_URL = window.SUPABASE_URL || 'https://bovtrdrmivmyglafpojx.supabase.co';
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvdnRyZHJtaXZteWdsYWZwb2p4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwMDk0MzcsImV4cCI6MjA3OTU4NTQzN30.P2eUq0MxyvX_5O0i4B1gjwjcvjbf9vy5lYl05AETHx8';

let supabase = null;

// Initialize on first use
export async function initSupabase() {
    if (!supabase) {
        const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.43.4/+esm');
        supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return supabase;
}

// ============================================
// AUTHENTICATION
// ============================================



export async function signUpWithEmail(email, password) {
    try {
        const sb = await initSupabase();
        const { data, error } = await sb.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: window.location.origin }
        });

        if (error) throw error;
        return { success: true, data };
    } catch (err) {
        console.error('❌ Sign up error:', err);
        return { success: false, error: err.message };
    }
}

export async function signInWithEmail(email, password) {
    try {
        const sb = await initSupabase();
        const { data, error } = await sb.auth.signInWithPassword({ email, password });

        if (error) throw error;
        return { success: true, data };
    } catch (err) {
        console.error('❌ Sign in error:', err);
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
        console.error('❌ Sign out error:', error);
        return { success: false, error: error.message };
    }
}

export async function getCurrentUser() {
    try {
        const sb = await initSupabase();
        const { data: { session }, error: sessionError } = await sb.auth.getSession();

        if (sessionError || !session) return null;

        const { data: { user }, error: userError } = await sb.auth.getUser();
        if (userError) throw userError;

        // Fetch profile to get role
        const { data: profile } = await sb
            .from('profiles')
            .select('role, resume_url')
            .eq('id', user.id)
            .single();

        return { ...user, ...profile };
    } catch (e) {
        console.error('❌ Get user error:', e);
        return null;
    }
}

// ============================================
// DATABASE OPERATIONS
// ============================================

/**
 * Save intern progress for a specific category
 */
export async function saveProgress(internId, category, progressData) {
    try {
        const sb = await initSupabase();

        // Upsert progress based on intern_id and category
        const { data, error } = await sb
            .from('intern_progress')
            .upsert({
                intern_id: internId,
                category: category,
                user_email: progressData.email,
                completed_tasks: progressData.completedTasks,
                task_notes: progressData.taskNotes,
                progress_percent: progressData.progressPercent,
                cohort: progressData.cohort || 'default',
                last_updated: new Date().toISOString()
            }, { onConflict: 'intern_id, category' })
            .select();

        if (error) throw error;
        return { success: true, data };

    } catch (error) {
        console.error('❌ Error saving progress:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Load intern progress for a specific category
 */
export async function loadProgress(internId, category) {
    try {
        const sb = await initSupabase();
        const { data, error } = await sb
            .from('intern_progress')
            .select('*')
            .eq('intern_id', internId)
            .eq('category', category)
            .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows found"

        if (data) {
            return {
                success: true,
                data: {
                    ...data,
                    completedTasks: data.completed_tasks || [],
                    taskNotes: data.task_notes || {},
                    progressPercent: data.progress_percent || 0
                }
            };
        }

        return { success: true, data: null };
    } catch (error) {
        console.error('❌ Error loading progress:', error);
        return { success: false, error: error.message };
    }
}

/**
 * ADMIN: Get all interns progress
 */
export async function getAllInternsProgress() {
    try {
        const sb = await initSupabase();

        // Get all profiles
        const { data: profiles, error: profileError } = await sb
            .from('profiles')
            .select('*')
            .eq('role', 'intern');

        if (profileError) throw profileError;

        // Get all progress
        const { data: progress, error: progressError } = await sb
            .from('intern_progress')
            .select('*');

        if (progressError) throw progressError;

        // Combine data
        const combined = profiles.map(profile => {
            const userProgress = progress.filter(p => p.intern_id === profile.id);
            return {
                ...profile,
                progress: userProgress
            };
        });

        return { success: true, data: combined };
    } catch (error) {
        console.error('❌ Error getting all interns:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Upload Resume
 */
export async function uploadResume(file, userId) {
    try {
        const sb = await initSupabase();
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/resume.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await sb.storage
            .from('resumes')
            .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = sb.storage
            .from('resumes')
            .getPublicUrl(filePath);

        // Update profile
        await sb
            .from('profiles')
            .update({ resume_url: publicUrl })
            .eq('id', userId);

        return { success: true, url: publicUrl };
    } catch (error) {
        console.error('❌ Error uploading resume:', error);
        return { success: false, error: error.message };
    }
}
