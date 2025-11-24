# 🗄️ Supabase Database Setup Guide

## The Problem
Progress, notes, and tasks aren't being saved to the database.

## The Solution
You need to create the `intern_progress` table in Supabase with proper Row Level Security (RLS) policies.

---

## Step 1: Go to Supabase SQL Editor

1. Go to [Supabase Dashboard](https://supabase.com)
2. Open your **n8n_Bootcamp** project
3. Click **SQL Editor** in the left menu
4. Click **New Query**

---

## Step 2: Create the Table

Copy and paste this SQL into the SQL editor and click **RUN**:

```sql
-- Create intern_progress table
CREATE TABLE IF NOT EXISTS intern_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  intern_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email VARCHAR(255) NOT NULL,
  completed_tasks JSONB DEFAULT '[]'::jsonb,
  task_notes JSONB DEFAULT '{}'::jsonb,
  progress_percent INTEGER DEFAULT 0,
  cohort VARCHAR(100) DEFAULT 'default',
  created_at TIMESTAMP DEFAULT NOW(),
  last_updated TIMESTAMP DEFAULT NOW(),
  UNIQUE(intern_id)
);

-- Enable RLS
ALTER TABLE intern_progress ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own data
CREATE POLICY "Users can read their own progress"
  ON intern_progress
  FOR SELECT
  USING (auth.uid() = intern_id);

-- Allow users to insert their own data
CREATE POLICY "Users can insert their own progress"
  ON intern_progress
  FOR INSERT
  WITH CHECK (auth.uid() = intern_id);

-- Allow users to update their own data
CREATE POLICY "Users can update their own progress"
  ON intern_progress
  FOR UPDATE
  USING (auth.uid() = intern_id)
  WITH CHECK (auth.uid() = intern_id);

-- Create index for faster queries
CREATE INDEX idx_intern_progress_intern_id ON intern_progress(intern_id);
CREATE INDEX idx_intern_progress_cohort ON intern_progress(cohort);
```

---

## Step 3: Verify the Table

After running the SQL:

1. Click **Tables** in the left menu
2. You should see `intern_progress` in the list
3. Click on it to view columns:
   - `id` - Auto-generated UUID
   - `intern_id` - Reference to authenticated user
   - `user_email` - User's email
   - `completed_tasks` - Array of completed day booleans
   - `task_notes` - Object with notes for each day
   - `progress_percent` - Overall progress percentage
   - `cohort` - Bootcamp cohort name
   - `created_at` - When record was created
   - `last_updated` - Last update timestamp

---

## Step 4: Test Saving Data

1. Go back to your N8N Bootcamp app
2. Create an account with email/password
3. Check some boxes for completed days
4. Add notes to assessment
5. Click **"💾 Save to Database"** button
6. You should see: ✓ Progress saved successfully!

---

## Step 5: Verify Data Was Saved

1. Go back to Supabase Dashboard
2. Click **Tables** → **intern_progress**
3. Click **Data** tab
4. You should see your progress record with:
   - Your email in `user_email`
   - Your completed tasks in `completed_tasks`
   - Your notes in `task_notes`
   - Updated timestamp in `last_updated`

---

## Common Issues

**"Permission denied" error?**
- Make sure RLS policies were created correctly
- Check that `auth.uid()` is being used in policies

**Table not appearing?**
- Refresh the page
- Check the SQL didn't have errors

**Data not saving?**
- Check browser DevTools (F12) → Console for errors
- Verify you're logged in
- Verify the table exists with correct columns

**Still getting errors?**
- Go to Supabase Dashboard → Authentication → Users
- Verify your user exists
- Check Row Level Security policies in Tables → intern_progress → RLS

---

## What Gets Saved

When you click "💾 Save to Database", the app sends:

```json
{
  "completedTasks": [true, false, true, ...],
  "taskNotes": {
    "0": "Learned N8N basics",
    "1": "Need to review triggers"
  },
  "progressPercent": 45,
  "cohort": "default",
  "email": "user@example.com"
}
```

This gets saved to the `intern_progress` table with your user ID.

---

## To Sync Progress Across Devices

Since data is saved to Supabase, when you:
1. Log in on another device
2. Your progress will automatically load
3. All your notes and completed tasks will appear

Try it! Log out and log back in - your progress should still be there. ✅
