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

/**
 * Google Sign-in
 */
export async function signInWithGoogle() {
  const sb = await initSupabase()
  const { data, error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
      scopes: ['profile', 'email']
    }
  })
  
  if (error) {
    console.error('❌ Google login error:', error)
    return { success: false, error: error.message }
  }
  
  return { success: true, data }
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
 * Get current user session
 */
export async function getCurrentUser() {
  try {
    const sb = await initSupabase()
    const { data: { user } } = await sb.auth.getUser()
    return user
  } catch (e) {
    console.error('❌ Get user error:', e)
    return null
  }
}

/**
 * Save intern progress to database
 */
export async function saveProgress(internId, progressData) {
  try {
    const sb = await initSupabase()
    const { data, error } = await sb
      .from('intern_progress')
      .upsert({
        intern_id: internId,
        user_email: progressData.email,
        completed_tasks: progressData.completedTasks,
        task_notes: progressData.taskNotes,
        progress_percent: progressData.progressPercent,
        last_updated: new Date().toISOString(),
        cohort: progressData.cohort || 'default'
      }, { onConflict: 'intern_id' })
    
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('❌ Error saving progress:', error)
    return { success: false, error: error.message }
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
    return { success: true, data: data || null }
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

/**
 * Google Sign-in
 */
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
      scopes: ['profile', 'email']
    }
  })
  
  if (error) {
    console.error('❌ Google login error:', error)
    return { success: false, error: error.message }
  }
  
  return { success: true, data }
}

/**
 * Sign out
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('❌ Sign out error:', error)
    return false
  }
  return true
}

/**
 * Get current user session
 */
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

/**
 * Save intern progress to database
 */
export async function saveProgress(internId, progressData) {
  try {
    const { data, error } = await supabase
      .from('intern_progress')
      .upsert({
        intern_id: internId,
        user_email: progressData.email,
        completed_tasks: progressData.completedTasks,
        task_notes: progressData.taskNotes,
        progress_percent: progressData.progressPercent,
        last_updated: new Date().toISOString(),
        cohort: progressData.cohort || 'default'
      }, { onConflict: 'intern_id' })
    
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('❌ Error saving progress:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Load intern progress from database
 */
export async function loadProgress(internId) {
  try {
    const { data, error } = await supabase
      .from('intern_progress')
      .select('*')
      .eq('intern_id', internId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows found
    return { success: true, data: data || null }
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
    const { data, error } = await supabase
      .from('intern_progress')
      .select('*')
      .eq('cohort', cohort)
    
    if (error) throw error
    
    // Calculate statistics
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
    const { data, error } = await supabase
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
