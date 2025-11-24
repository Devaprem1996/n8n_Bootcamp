/**
 * Supabase Configuration
 * Initialize connection to Supabase with Google Auth
 */

// Get credentials from window object (set in index.html or via environment)
const SUPABASE_URL = window.SUPABASE_URL || 'https://your-project.supabase.co'
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || 'your-anon-key-here'

// Create Supabase client
async function createSupabaseClient() {
  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.43.4/+esm')
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}

let supabase = null

// Initialize on first use
async function initSupabase() {
  if (!supabase) {
    supabase = await createSupabaseClient()
  }
  return supabase
}

// Export initSupabase for auth state listeners
export { initSupabase }

/**
 * Google Sign-in
 */
export async function signInWithGoogle() {
  try {
    const sb = await initSupabase()
    console.log('🔐 Attempting Google OAuth sign-in...')
    
    const { data, error } = await sb.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/',
        scopes: 'openid profile email'
      }
    })
    
    if (error) {
      console.error('❌ Google OAuth error:', error.message, error)
      return { success: false, error: `Google auth failed: ${error.message}. Try email/password instead.` }
    }
    
    console.log('✅ Google OAuth initiated, redirecting to Google...')
    return { success: true, data }
  } catch (err) {
    console.error('❌ Google login exception:', err)
    return { success: false, error: `Google auth error: ${err.message}. Please try email/password login instead.` }
  }
}

/**
 * Email/Password Sign-up (Fallback authentication)
 */
export async function signUpWithEmail(email, password) {
  try {
    const sb = await initSupabase()
    console.log('📧 Signing up with email:', email)
    
    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin
      }
    })
    
    if (error) {
      console.error('❌ Sign up error:', error)
      return { success: false, error: error.message }
    }
    
    console.log('✅ Sign up successful')
    return { success: true, data }
  } catch (err) {
    console.error('❌ Sign up exception:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Email/Password Sign-in (Fallback authentication)
 */
export async function signInWithEmail(email, password) {
  try {
    const sb = await initSupabase()
    console.log('📧 Signing in with email:', email)
    
    const { data, error } = await sb.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      console.error('❌ Sign in error:', error)
      return { success: false, error: error.message }
    }
    
    console.log('✅ Email sign in successful')
    return { success: true, data }
  } catch (err) {
    console.error('❌ Sign in exception:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Sign out
 */
export async function signOut() {
  const sb = await initSupabase()
  const { error } = await sb.auth.signOut()
  if (error) {
    console.error('❌ Sign out error:', error)
    return false
  }
  return true
}

/**
 * Get current user session with better error handling
 */
export async function getCurrentUser() {
  try {
    const sb = await initSupabase()
    
    // Try to get the current session
    const { data: { session }, error: sessionError } = await sb.auth.getSession()
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError)
      return null
    }
    
    if (!session) {
      console.log('ℹ️ No active session')
      return null
    }
    
    // Get user details
    const { data: { user }, error: userError } = await sb.auth.getUser()
    
    if (userError) {
      console.error('❌ Get user error:', userError)
      return null
    }
    
    console.log('✅ User authenticated:', user?.email)
    return user
  } catch (e) {
    console.error('❌ Get user exception:', e)
    return null
  }
}

/**
 * Check if user is authenticated (for initialization)
 */
export async function isAuthenticated() {
  const user = await getCurrentUser()
  return user !== null
}

/**
 * Save intern progress to database
 */
export async function saveProgress(internId, progressData) {
  try {
    const sb = await initSupabase()
    console.log('📝 Saving progress to Supabase...')
    console.log('   intern_id:', internId)
    console.log('   email:', progressData.email)
    console.log('   tasks:', progressData.completedTasks)
    console.log('   notes:', progressData.taskNotes)
    
    // First, try to check if record exists
    const { data: existingData, error: checkError } = await sb
      .from('intern_progress')
      .select('id')
      .eq('intern_id', internId)
      .single()
    
    console.log('   Existing record check:', existingData ? 'Found' : 'Not found')
    
    let result;
    
    if (existingData) {
      // Record exists - UPDATE it
      console.log('   Action: UPDATE')
      result = await sb
        .from('intern_progress')
        .update({
          user_email: progressData.email,
          completed_tasks: progressData.completedTasks,
          task_notes: progressData.taskNotes,
          progress_percent: progressData.progressPercent,
          last_updated: new Date().toISOString(),
          cohort: progressData.cohort || 'default'
        })
        .eq('intern_id', internId)
    } else {
      // Record doesn't exist - INSERT it
      console.log('   Action: INSERT')
      result = await sb
        .from('intern_progress')
        .insert({
          intern_id: internId,
          user_email: progressData.email,
          completed_tasks: progressData.completedTasks,
          task_notes: progressData.taskNotes,
          progress_percent: progressData.progressPercent,
          cohort: progressData.cohort || 'default'
        })
    }
    
    const { data, error } = result
    
    if (error) {
      console.error('❌ Database error:', error)
      console.error('   Code:', error.code)
      console.error('   Message:', error.message)
      console.error('   Details:', error.details)
      throw error
    }
    
    console.log('✅ Save successful!')
    console.log('   Response:', data)
    return { success: true, data }
    
  } catch (error) {
    console.error('❌ Error saving progress:', error)
    console.error('   Full error:', JSON.stringify(error, null, 2))
    return { success: false, error: error.message || 'Unknown error' }
  }
}

/**
 * Load intern progress from database
 */
export async function loadProgress(internId) {
  try {
    const sb = await initSupabase()
    const { data, error } = await sb
      .from('intern_progress')
      .select('*')
      .eq('intern_id', internId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    
    if (data) {
      console.log('📂 Loaded raw data from DB:', data)
      // Ensure completed_tasks and task_notes are proper arrays/objects
      const processedData = {
        ...data,
        completed_tasks: Array.isArray(data.completed_tasks) 
          ? data.completed_tasks.map(t => t === true || t === 'true' || t === 1)
          : Array(9).fill(false),
        task_notes: typeof data.task_notes === 'object' && data.task_notes !== null
          ? data.task_notes
          : {}
      }
      console.log('✅ Processed data:', processedData)
      return { success: true, data: processedData }
    }
    
    return { success: true, data: null }
  } catch (error) {
    console.error('❌ Error loading progress:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get cohort performance report
 */
export async function getCohortReport(cohort) {
  try {
    const sb = await initSupabase()
    const { data, error } = await sb
      .from('intern_progress')
      .select('*')
      .eq('cohort', cohort)
    
    if (error) throw error
    
    const stats = {
      totalInterns: data.length,
      avgProgress: data.length > 0 
        ? Math.round(data.reduce((sum, d) => sum + (d.progress_percent || 0), 0) / data.length)
        : 0,
      tasksCompleted: data.length > 0
        ? Math.round(data.reduce((sum, d) => sum + (d.completed_tasks?.filter(t => t).length || 0), 0) / data.length)
        : 0
    }
    
    return { success: true, data, stats }
  } catch (error) {
    console.error('❌ Error getting cohort report:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get all interns in cohort
 */
export async function getCohortsInterns(cohort) {
  try {
    const sb = await initSupabase()
    const { data, error } = await sb
      .from('intern_progress')
      .select('intern_id, user_email, progress_percent, last_updated, completed_tasks')
      .eq('cohort', cohort)
      .order('last_updated', { ascending: false })
    
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('❌ Error getting interns:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Export progress as JSON
 */
export function exportProgressJSON(progressData, internName) {
  const json = {
    intern: internName,
    email: progressData.email,
    cohort: progressData.cohort,
    exportDate: new Date().toISOString(),
    progressPercent: progressData.progressPercent,
    completedTasks: progressData.completedTasks,
    taskNotes: progressData.taskNotes
  }
  
  const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `progress_${internName}_${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Export progress as CSV
 */
export function exportProgressCSV(progressData, internName) {
  let csv = 'N8N Bootcamp Progress Report\n'
  csv += `Intern: ${internName}\n`
  csv += `Email: ${progressData.email}\n`
  csv += `Cohort: ${progressData.cohort}\n`
  csv += `Date: ${new Date().toLocaleString()}\n`
  csv += `Progress: ${progressData.progressPercent}%\n\n`
  
  csv += 'Task Number,Status\n'
  progressData.completedTasks.forEach((completed, idx) => {
    csv += `Day ${idx + 1},"${completed ? 'COMPLETED' : 'PENDING'}"\n`
  })
  
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `progress_${internName}_${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
