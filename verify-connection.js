#!/usr/bin/env node
/**
 * Quick Verification Script
 * Run in browser console to verify database connection
 */

async function verifyConnection() {
  console.log('🔍 Starting Supabase Connection Verification...\n');
  
  try {
    // Check 1: Credentials
    console.log('✅ Check 1: Supabase Credentials');
    console.log('   URL:', window.SUPABASE_URL ? '✓ Configured' : '✗ Missing');
    console.log('   Key:', window.SUPABASE_ANON_KEY ? '✓ Configured' : '✗ Missing');
    
    // Check 2: Module Import
    console.log('\n✅ Check 2: Module Loading');
    const supabaseModule = await import('./supabase-config.js');
    console.log('   initSupabase:', typeof supabaseModule.initSupabase === 'function' ? '✓' : '✗');
    console.log('   getCurrentUser:', typeof supabaseModule.getCurrentUser === 'function' ? '✓' : '✗');
    console.log('   loadProgress:', typeof supabaseModule.loadProgress === 'function' ? '✓' : '✗');
    console.log('   saveProgress:', typeof supabaseModule.saveProgress === 'function' ? '✓' : '✗');
    
    // Check 3: Supabase Client
    console.log('\n✅ Check 3: Supabase Client');
    const sb = await supabaseModule.initSupabase();
    console.log('   Connected:', sb ? '✓' : '✗');
    
    // Check 4: Authentication
    console.log('\n✅ Check 4: Authentication');
    const user = await supabaseModule.getCurrentUser();
    if (user) {
      console.log('   User:', user.email);
      console.log('   ID:', user.id);
      
      // Check 5: Load User Progress
      console.log('\n✅ Check 5: Load Progress Data');
      const progressResult = await supabaseModule.loadProgress(user.id);
      if (progressResult.success) {
        if (progressResult.data) {
          console.log('   ✓ Progress found');
          console.log('   Completed tasks:', progressResult.data.completed_tasks);
          console.log('   Progress %:', progressResult.data.progress_percent);
          console.log('   Cohort:', progressResult.data.cohort);
        } else {
          console.log('   ℹ No progress record yet (first time user)');
        }
      } else {
        console.log('   ✗ Error:', progressResult.error);
      }
      
    } else {
      console.log('   No user logged in - please log in first');
    }
    
    console.log('\n✅ All checks completed!');
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

// Run verification
verifyConnection();
